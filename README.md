# 🎓 Faculty Complaint Portal

A secure, full-stack web application for **Savitribai Phule Pune University** students to anonymously submit complaints against faculty members. Admins can monitor, review, and resolve complaints through a dedicated dashboard.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Axios, Lucide Icons |
| **Backend** | Python, FastAPI, Pydantic, JWT (python-jose), bcrypt (Passlib) |
| **Database** | MongoDB Atlas (PyMongo) |
| **Deployment** | Vercel (frontend) · Render (backend) |

## Features

- 🔐 **JWT Authentication** — Secure login with role-based access (Student / Admin)
- 🕵️ **Student Anonymity** — Student identity is never revealed to faculty
- 📝 **Complaint Submission** — Category selection, subject, detailed description
- 🚫 **Profanity Filter** — Prevents abusive language in complaints
- 📊 **Admin Dashboard** — Stats cards, category breakdown charts, faculty ranking
- 🔄 **Status Tracking** — Students can track their complaint status (Pending → Reviewed → Resolved)
- ⚠️ **Faculty Alerts** — Auto-popup when a faculty member reaches 5+ complaints
- 👥 **Faculty Management** — Admin can add/delete faculty members
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile

## How to Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
# Add MONGO_URI and JWT_SECRET to .env
python seed.py
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
npm install
npm run dev
```

## Login Credentials (after running seed.py)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@college.com` | `admin123` |
| Student | `student@college.com` | `student123` |

> Students can also register new accounts via the `/register` page.

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app, middleware, routers
│   ├── database.py           # MongoDB Atlas connection
│   ├── models.py             # Pydantic validation models
│   ├── seed.py               # Database seeder
│   ├── routes/
│   │   ├── auth.py           # Login & registration
│   │   ├── complaints.py     # Submit & view complaints
│   │   ├── faculty.py        # Faculty listing
│   │   └── admin.py          # Dashboard stats, complaint & faculty management
│   └── utils/
│       ├── auth_utils.py     # JWT tokens, bcrypt hashing
│       └── dependencies.py   # Route protection (require_student, require_admin)
│
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── student/          # StudentDashboard, ComplaintForm
│   │   └── admin/            # AdminDashboard, ManageFaculty
│   ├── components/           # Navbar, ProtectedRoute, AlertPopup
│   ├── context/              # AuthContext (global auth state)
│   └── utils/                # Axios config, badwords filter
│
├── vercel.json               # Vercel SPA rewrite config
└── package.json
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register student account |
| POST | `/auth/login` | — | Login & get JWT token |
| GET | `/faculties` | — | List all faculty |
| GET | `/faculties/:id` | — | Single faculty details |
| POST | `/complaints` | Student | Submit complaint |
| GET | `/complaints/my` | Student | View own complaints |
| GET | `/admin/stats` | Admin | Dashboard statistics |
| GET | `/admin/complaints` | Admin | All complaints (paginated) |
| GET | `/admin/faculty-alerts` | Admin | Faculty with ≥5 complaints |
| PATCH | `/admin/complaints/:id/status` | Admin | Update complaint status |
| POST | `/admin/faculty` | Admin | Add faculty member |
| DELETE | `/admin/faculty/:id` | Admin | Delete faculty member |
