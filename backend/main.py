from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.faculty import router as faculty_router
from routes.complaints import router as complaints_router
from routes.admin import router as admin_router

app = FastAPI(title="Faculty Complaint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(faculty_router)
app.include_router(complaints_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {"message": "Faculty Complaint API is running"}
