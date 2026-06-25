# NovaCart AI — Deployment Guide

## ✅ GitHub
Repo: https://github.com/rajarapuravi/nova-cart-Ai

---

## 🔵 RENDER — Backend (Django)

1. Go to https://render.com → Sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect repo: `rajarapuravi/nova-cart-Ai`
4. Set these settings:
   - **Name**: `novacart-ai-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate && python seed_data.py`
   - **Start Command**: `gunicorn novacart_backend.wsgi:application --bind 0.0.0.0:$PORT`
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | any-random-50-char-string |
   | `DEBUG` | False |
   | `ALLOWED_HOSTS` | .onrender.com,localhost |
   | `OPENAI_API_KEY` | your-key (optional) |
   | `GEMINI_API_KEY` | your-key (optional) |
   | `FRONTEND_URL` | https://novacart-ai.netlify.app |
   | `EMAIL_BACKEND` | django.core.mail.backends.console.EmailBackend |
6. Click **"Create Web Service"**
7. Wait ~5 min for deploy
8. Copy your Render URL: `https://novacart-ai-backend.onrender.com`

---

## 🟢 NETLIFY — Frontend (React)

1. Go to https://netlify.com → Sign in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub → Select `rajarapuravi/nova-cart-Ai`
4. Set these settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | https://novacart-ai-backend.onrender.com |
6. Click **"Deploy site"**
7. Your site: `https://novacart-ai.netlify.app`

---

## 🔗 After Both Are Deployed

Go back to Render → Your backend service → Environment
Update: `FRONTEND_URL` = your actual Netlify URL

Then in Netlify → Update:
`VITE_API_BASE_URL` = your actual Render URL

Redeploy both once after updating URLs.

---

## Test Accounts
| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@novacart.ai   | Admin@123 |
| User  | user@novacart.ai    | User@123  |
