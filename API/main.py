from fastapi import FastAPI, Form, Request, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from mailjet_rest import Client
from dotenv import load_dotenv
from ratelimiter import RateLimiter
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.concurrency import run_in_threadpool
import os
import time
import re
import logging

# --- Chargement des variables d'environnement ---
load_dotenv()

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ryan.pixicode.dev",
        "https://api.ryan.pixicode.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Logging ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("portfolio-api")

# --- Initialisation du rate limiter ---
# 5 requêtes max par minute
rate_limiter = RateLimiter(max_calls=5, period=60)

# --- MailJet ---
api_key = os.getenv("MAILJET_API_KEY")
api_secret = os.getenv("MAILJET_API_SECRET")
if not api_key or not api_secret:
    raise RuntimeError("MAILJET_API_KEY et MAILJET_API_SECRET doivent être définis dans .env")

mailjet = Client(auth=(api_key, api_secret), version='v3.1')

EMAIL_RE = re.compile(r"^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$")

# --- Route contact protégée ---
@app.post("/contact")
async def contact(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...)
):
    # Récupération IP client
    xff = request.headers.get("x-forwarded-for")
    ip = xff.split(",")[0].strip() if xff else request.client.host

    # Application du rate limiter
    try:
        with rate_limiter:
            pass
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de requêtes. Réessayez plus tard."
        )

    # Validation des champs
    name = name.strip()[:100]
    email = email.strip()[:254]
    message = message.strip()[:2000]

    if not name or not email or not message:
        raise HTTPException(status_code=400, detail="Tous les champs sont requis.")
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Email invalide.")

    # Préparation des données Mailjet
    data = {
        'Messages': [
            {
                "From": {"Email": "bouronryan@gmail.com", "Name": "Portfolio Contact Form"},
                "To": [{"Email": "bouronryan@gmail.com", "Name": "Ryan Bouron"}],
                "Subject": f"Nouveau message de {name}",
                "TextPart": f"Nom : {name}\nEmail : {email}\nMessage : {message}",
            }
        ]
    }

    # Envoi
    try:
        result = await run_in_threadpool(lambda: mailjet.send.create(data=data))
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Erreur interne lors de l'envoi du message.") from exc

    status_code = getattr(result, "status_code", None)
    result_json = getattr(result, "json", lambda: {})()

    if status_code and 200 <= status_code < 300:
        return {"success": True, "message": "Message envoyé avec succès"}
    else:
        return {"success": False, "error": result_json or {"status_code": status_code}}

# --- Prometheus Metrics ---
REQUESTS = Counter("api_requests_total", "Total HTTP requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram("api_request_latency_seconds", "Request latency", ["method", "path"])

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed = time.time() - start
    try:
        REQUEST_LATENCY.labels(request.method, request.url.path).observe(elapsed)
        REQUESTS.labels(request.method, request.url.path, str(response.status_code)).inc()
    except Exception:
        logger.exception("metrics middleware error")
    return response

@app.get("/metrics")
def metrics():
    payload = generate_latest()
    return Response(content=payload, media_type=CONTENT_TYPE_LATEST)

@app.get("/health")
def health():
    return {"status": "ok", "time": int(time.time())}
