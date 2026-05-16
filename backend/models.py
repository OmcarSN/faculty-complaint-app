from pydantic import BaseModel
from typing import Optional

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    role: str = "student"

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

class ComplaintCreate(BaseModel):
    faculty_id: str
    category: str
    subject: str
    description: str

class FacultyCreate(BaseModel):
    name: str
    email: str
    phone: str
    department: str
    password: str
