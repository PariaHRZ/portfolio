from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from mailjet_rest import Client
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()

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


api_key = os.getenv("MAILJET_API_KEY")
api_secret = os.getenv("MAILJET_API_SECRET")
mailjet = Client(auth=(api_key, api_secret), version='v3.1')

@app.post("/contact")
async def contact(
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...)
):
    data = {
        'Messages': [
            {
                "From": {
                    "Email": "bouronryan@gmail.com",
                    "Name": "Portfolio Contact Form"
                },
                "To": [
                    {
                        "Email": "bouronryan@gmail.com",
                        "Name": "Ryan Bouron"
                    }
                ],
                "Subject": f"Nouveau message de {name}",
                "TextPart": f"Nom : {name}\nEmail : {email}\nMessage : {message}",
            }
        ]
    }

    result = mailjet.send.create(data=data)
    if result.status_code == 200:
        return {"success": True, "message": "Message envoyé avec succès"}
    else:
        return {"success": False, "error": result.json()}
