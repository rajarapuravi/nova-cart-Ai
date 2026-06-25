# NovaCart AI — Production-Level E-Commerce Platform

## Quick Start

### Backend
```bash
cd backend
python manage.py migrate
python seed_data.py
python manage.py runserver 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Test Accounts
| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@novacart.ai      | Admin@123  |
| User  | user@novacart.ai       | User@123   |

## URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:5173/admin
- Django Admin: http://localhost:8000/django-admin

## API Keys (optional — for live AI)
Edit `backend/.env`:
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

## Tech Stack
- **Frontend**: React 19, Vite, Redux Toolkit, TailwindCSS, Framer Motion
- **Backend**: Django 6, DRF, JWT, SQLite
- **AI**: OpenAI GPT + Google Gemini (pluggable provider pattern)
