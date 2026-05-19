from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum
import re


class UserRole(str, Enum):
    student = "student"
    admin = "admin"


class ComplaintStatus(str, Enum):
    pending = "pending"
    reviewed = "reviewed"
    resolved = "resolved"


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)
    phone: str = Field(..., min_length=10, max_length=15)
    role: str = Field(default="student")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        v = v.strip()
        if not re.match(r"^\d{10,15}$", v):
            raise ValueError("Phone must be 10-15 digits")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("student",):
            raise ValueError("Registration is only allowed for students")
        return v


class UserLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=1, max_length=128)
    role: str = Field(...)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        return v.strip().lower()

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("student", "admin"):
            raise ValueError("Role must be 'student' or 'admin'")
        return v


class ComplaintCreate(BaseModel):
    faculty_id: str = Field(..., min_length=1)
    category: str = Field(..., min_length=2, max_length=100)
    subject: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)

    @field_validator("subject", "category", "description")
    @classmethod
    def strip_whitespace(cls, v):
        return v.strip()

    @field_validator("faculty_id")
    @classmethod
    def validate_object_id(cls, v):
        v = v.strip()
        if len(v) != 24:
            raise ValueError("Invalid faculty ID format")
        return v


class FacultyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    phone: str = Field(..., min_length=10, max_length=15)
    department: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("name", "department")
    @classmethod
    def strip_and_validate(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        v = v.strip()
        if not re.match(r"^\d{10,15}$", v):
            raise ValueError("Phone must be 10-15 digits")
        return v
