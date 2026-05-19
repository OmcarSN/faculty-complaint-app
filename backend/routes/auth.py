"""
Authentication routes — login and registration with strong validation.
"""
from fastapi import APIRouter, HTTPException
from database import users_collection
from models import UserRegister, UserLogin
from utils.auth_utils import (
    hash_password,
    verify_password,
    create_token,
    validate_email,
    validate_password_strength,
    validate_role,
)
from pymongo.errors import PyMongoError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(data: UserRegister):
    """Register a new student account with validation."""
    # Normalize email
    email = data.email.strip().lower()

    # Validate email format
    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Validate password strength
    is_valid, msg = validate_password_strength(data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    try:
        # Check for existing user
        existing = users_collection.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=409, detail="An account with this email already exists")

        # Hash password and create user
        hashed = hash_password(data.password)
        user = {
            "name": data.name.strip(),
            "email": email,
            "password": hashed,
            "phone": data.phone.strip(),
            "role": "student",
        }
        result = users_collection.insert_one(user)
        return {
            "message": "Account created successfully",
            "user": {
                "id": str(result.inserted_id),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
        }
    except HTTPException:
        raise
    except PyMongoError as e:
        print(f"[AUTH] Database error during registration: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable. Please try again.")
    except Exception as e:
        print(f"[AUTH] Unexpected error during registration: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.post("/login")
def login(data: UserLogin):
    """Authenticate a user and return a JWT token."""
    # Normalize inputs
    email = data.email.strip().lower()
    role = data.role.strip().lower()

    # Validate role
    if not validate_role(role):
        raise HTTPException(status_code=400, detail="Invalid role specified")

    try:
        # Find user by email AND role
        user = users_collection.find_one({"email": email, "role": role})
        if not user:
            # Generic message to prevent user enumeration
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Verify password
        if not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Create JWT token
        token = create_token({
            "id": str(user["_id"]),
            "name": user["name"],
            "role": user["role"],
        })

        return {
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
        }
    except HTTPException:
        raise
    except PyMongoError as e:
        print(f"[AUTH] Database error during login: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable. Please try again.")
    except Exception as e:
        print(f"[AUTH] Unexpected error during login: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")
