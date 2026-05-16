# Faculty Complaint App

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + Firebase Phone Auth
- Backend: Python FastAPI
- Database: MongoDB Atlas

## How to Run

### Backend
cd backend
pip install -r requirements.txt
Add your MongoDB URI to .env file
python seed.py
uvicorn main:app --reload

### Frontend
npm install
npm run dev

## Login Credentials (after seed)
- Admin: admin@college.com / admin123
- Student: register via phone OTP on /register page

## Features
- Phone OTP registration for students via Firebase
- Role based access: Student and Admin
- Bad word filter on complaints
- Admin alert popup for faculty with 5+ complaints
- Student identity kept confidential
