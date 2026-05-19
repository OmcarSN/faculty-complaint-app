# Faculty Complaint Portal

A web application built for Savitribai Phule Pune University (SPPU) that allows students to file complaints against faculty members anonymously. The admin can review, track, and resolve complaints through a dashboard.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Lucide Icons  
**Backend:** Python, FastAPI, Pydantic, JWT auth (python-jose), bcrypt  
**Database:** MongoDB Atlas (via PyMongo)  
**Hosting:** Vercel (frontend), Render (backend)

## Main Features

- JWT-based authentication with student and admin roles
- Students can file complaints against faculty (anonymous to faculty)
- Complaint tracking — students can see status updates
- Admin dashboard with stats, filters, and status management
- Admin can add or remove faculty members
- Alert system for faculty with 5+ complaints
- Client-side bad word filter on complaint submissions
- Responsive design — works on mobile and desktop

## Getting Started

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
# create a .env file with MONGO_URI and JWT_SECRET
python seed.py
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
npm install
npm run dev
```

## Test Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.com | admin123 |
| Student | student@college.com | student123 |

New student accounts can be created from the registration page.

## Folder Structure

```
backend/
  main.py             – App entry point, middleware config
  database.py         – MongoDB connection
  models.py           – Pydantic schemas + validation
  seed.py             – Database seeder script
  routes/
    auth.py           – Login and registration
    complaints.py     – Submit and view complaints
    faculty.py        – Faculty listing
    admin.py          – Admin dashboard, stats, complaint/faculty management
  utils/
    auth_utils.py     – JWT + bcrypt helpers
    dependencies.py   – Route protection (role checks)

src/
  pages/
    Login.jsx         – Login with role toggle
    Register.jsx      – Student registration
    student/          – Student dashboard, complaint form
    admin/            – Admin dashboard, faculty management
  components/         – Navbar, ProtectedRoute, AlertPopup
  context/            – Auth state (React Context)
  utils/              – Axios config, bad word filter
```

## API Routes

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /auth/register | No | Student registration |
| POST | /auth/login | No | Login |
| GET | /faculties | No | List all faculty |
| GET | /faculties/:id | No | Single faculty |
| POST | /complaints | Student | Submit complaint |
| GET | /complaints/my | Student | View own complaints |
| GET | /admin/stats | Admin | Dashboard stats |
| GET | /admin/complaints | Admin | All complaints |
| GET | /admin/faculty-alerts | Admin | Faculty with 5+ complaints |
| PATCH | /admin/complaints/:id/status | Admin | Update complaint status |
| POST | /admin/faculty | Admin | Add faculty |
| DELETE | /admin/faculty/:id | Admin | Remove faculty |
