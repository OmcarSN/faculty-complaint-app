from fastapi import APIRouter, HTTPException
from database import users_collection
from models import UserRegister, UserLogin
from utils.auth_utils import (
    hash_password, verify_password, create_token,
    validate_email, validate_password_strength, validate_role,
)
from pymongo.errors import PyMongoError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(data: UserRegister):
    email = data.email.strip().lower()

    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    is_valid, msg = validate_password_strength(data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    try:
        if users_collection.find_one({"email": email}):
            raise HTTPException(status_code=409, detail="An account with this email already exists")

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
        print(f"DB error during registration: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.post("/login")
def login(data: UserLogin):
    email = data.email.strip().lower()
    role = data.role.strip().lower()

    if not validate_role(role):
        raise HTTPException(status_code=400, detail="Invalid role")

    try:
        user = users_collection.find_one({"email": email, "role": role})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

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
        print(f"DB error during login: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")
