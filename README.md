# Portfolio + API + Monitoring (FastAPI)

<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Forks][forks-shield]][forks-url]
[![Stars][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

---

<!-- PROJECT LOGO -->

<br />
<div align="center">
  <img src="PORTFOLIO/images/favicon.png" alt="Logo" width="80" height="80">
  <h3 align="center">Portfolio + API + Monitoring</h3>

  <p align="center">
    Un projet complet combinant un front-end stylisé type “terminal” et une API FastAPI sécurisée pour la gestion des messages de contact.
    <br />
    <br />
    <a href="https://ryan.pixicode.dev" target="_blank"><strong>Voir le site en ligne »</strong></a>
    <br />
    <br />
    <a href="https://github.com/ryan/portfolio/issues/new?labels=bug&template=bug-report---.md">Signaler un bug</a>
    &middot;
    <a href="https://github.com/ryan/portfolio/issues/new?labels=enhancement&template=feature-request---.md">Proposer une amélioration</a>
  </p>
</div>

---

## 🧠 À propos du projet

Ce projet combine un **portfolio moderne** (interface inspirée d’un terminal) et une **API FastAPI** pour le traitement des messages de contact via **Mailjet**.  
Il inclut également un **rate limiter anti-spam**, des **endpoints de santé**, et des **métriques Prometheus** pour le monitoring.

### 🎯 Objectifs

* **Front-end** : interface minimaliste type terminal avec formulaire de contact.
* **Back-end** : API FastAPI pour la gestion des envois via Mailjet.
* **Sécurité & stabilité** : rate limiting, monitoring et métriques Prometheus.
* **Monitoring complet** : endpoints santé, métriques Prometheus, Grafana, supervision externe.

---

## 🧱 Arborescence du projet

```

PORTFOLIO/
├── PORTFOLIO/
│   ├── index.html
│   └── js/
│       └── contact.js
│
├── API/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│
└── docker-compose.yml

````

---

## ⚙️ Configuration des variables d’environnement (`API/.env`)

| Variable             | Description                           | Obligatoire |
| -------------------- | ------------------------------------- | ----------- |
| `MAILJET_API_KEY`    | Clé API Mailjet                       | ✅ Oui       |
| `MAILJET_API_SECRET` | Secret Mailjet                        | ✅ Oui       |

---

## 🚀 Démarrage en local (Windows)

1️⃣ **Ouvrir le terminal VS Code dans le dossier API**

```bash
cd "C:\Users\PariaHRZ\PORTFOLIO\API"
````

2️⃣ **Créer l’environnement virtuel + installer les dépendances**

```bash
python -m venv .venv
PowerShell: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3️⃣ **Lancer l’API**

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

4️⃣ **Tester les endpoints**

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/metrics
curl -X POST http://127.0.0.1:8000/contact -F "name=Test" -F "email=test@example.com" -F "message=Bonjour"
```

---

## 🐳 Démarrage avec Docker

```bash
cp API/.env.example API/.env  # puis compléter les variables
docker compose up -d --build
docker compose logs -f ryan_api
```

---

## 📡 Endpoints disponibles

| Méthode | Endpoint   | Description                                  | Auth |
| ------- | ---------- | -------------------------------------------- | ---- |
| `POST`  | `/contact` | Envoi d’un message via Mailjet (retour JSON) | ❌    |
| `GET`   | `/health`  | Vérifie l’état du service                    | ❌    |
| `GET`   | `/metrics` | Expose les métriques Prometheus              | ❌    |

---

## ⏱️ Rate Limiting

* **Méthode** : In-memory par adresse IP
* **Exemple** : 5 requêtes / 60 secondes
* **Réponse 429** : inclut un en-tête `Retry-After` (en secondes)
* **Production** : pour un déploiement multi-process, il est conseillé d’utiliser **Redis** avec **SlowAPI** ou un middleware équivalent.

---

## 🧩 Front-end (`contact.js`)

* Intercepte la soumission du formulaire.
* Timeout automatique de 15s via `AbortController`.
* Gestion des erreurs réseau et du status `429 Too Many Requests`.
* En développement, pointer vers `http://127.0.0.1:8000/contact`.

---

## 📊 Monitoring

### Endpoints

* **Santé** : `GET /health` → `{"status":"ok","time":...}`
* **Métriques Prometheus** : `GET /metrics` → compteurs & histogrammes (`api_requests_total`, `api_request_latency_seconds`, ...)

### Démarrer Prometheus + Grafana

```bash
docker compose up -d prometheus grafana
```

* Prometheus → [http://localhost:9090](http://localhost:9090)
* Grafana → [http://localhost:3000](http://localhost:3000) (admin / admin par défaut)

### Configuration Prometheus

* Scrape `ryan_api:8000` toutes les **5s**
* `metrics_path`: `/metrics`
  → Voir `monitoring/prometheus/prometheus.yml`

### Configuration Grafana

* Ajouter une datasource **Prometheus** → `http://prometheus:9090`
* Graphes rapides :

```promql
sum by (path, status) (rate(api_requests_total[5m]))
histogram_quantile(0.95, sum by (le, path) (rate(api_request_latency_seconds_bucket[5m])))
```

### Supervision externe

* **UptimeRobot / Healthchecks.io** → surveiller
  `GET https://api.ryan.pixicode.dev/health`
  (alerte si ≠ 200)

### Gestion des erreurs

* (Optionnel) **Sentry** via la variable d’environnement `SENTRY_DSN` pour remonter les exceptions.

---

## 🧰 Dépannage rapide

| Problème                              | Solution                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| PowerShell bloque l’exécution         | `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force`                                 |
| Erreur “module not found” dans Docker | Ajouter le module manquant dans `API/requirements.txt` puis relancer `docker compose up -d --build` |

---

## 🧱 Technologies utilisées

* [![FastAPI][FastAPI-badge]][FastAPI-url]
* [![Mailjet][Mailjet-badge]][Mailjet-url]
* [![Docker][Docker-badge]][Docker-url]
* [![Prometheus][Prometheus-badge]][Prometheus-url]
* [![HTML5][HTML-badge]][HTML-url]
* [![JavaScript][JS-badge]][JS-url]

---

## 📜 License

© 2025 Ryan Bouron. Tous droits réservés.
Aucune reproduction, modification ou diffusion du code n’est autorisée sans accord écrit préalable.

---

## 📬 Contact

👤 **Ryan Bouron**
📧 [bouronryan@gmail.com](mailto:bouronryan@gmail.com)
🌐 [https://ryan.pixicode.dev](https://ryan.pixicode.dev)

<p align="right">(<a href="#readme-top">Retour en haut</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->

[forks-shield]: https://img.shields.io/github/forks/PariaHRZ/portfolio?style=for-the-badge
[forks-url]: https://github.com/PariaHRZ/portfolio/network/members
[stars-shield]: https://img.shields.io/github/stars/PariaHRZ/portfolio?style=for-the-badge
[stars-url]: https://github.com/PariaHRZ/portfolio/stargazers
[issues-shield]: https://img.shields.io/github/issues/PariaHRZ/portfolio.svg?style=for-the-badge
[issues-url]: https://github.com/PariaHRZ/portfolio/issues
[license-shield]: https://img.shields.io/badge/License-Tous%20droits%20r%C3%A9serv%C3%A9s-red?style=for-the-badge
[FastAPI-badge]: https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white
[FastAPI-url]: https://fastapi.tiangolo.com/
[Mailjet-badge]: https://img.shields.io/badge/Mailjet-FF3D00?style=for-the-badge&logo=mailjet&logoColor=white
[Mailjet-url]: https://www.mailjet.com/
[Docker-badge]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[Prometheus-badge]: https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white
[Prometheus-url]: https://prometheus.io/
[HTML-badge]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML-url]: https://developer.mozilla.org/fr/docs/Web/HTML
[JS-badge]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JS-url]: https://developer.mozilla.org/fr/docs/Web/JavaScript
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white
[linkedin-url]: https://www.linkedin.com/in/tonprofil/

