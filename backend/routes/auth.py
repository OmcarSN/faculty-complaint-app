from fastapi import APIRouter, HTTPException
from database import users_collection
from models import UserRegister, UserLogin
from utils.auth_utils import hash_password, verify_password, create_token
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(data: UserRegister):
    existing = users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(data.password)
    user = {
        "name": data.name,
        "email": data.email,
        "password": hashed,
        "phone": data.phone,
        "role": "student"
    }
    users_collection.insert_one(user)
    return {"message": "Account created successfully"}

@router.post("/login")
def login(data: UserLogin):
    user = users_collection.find_one({"email": data.email, "role": data.role})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({
        "id": str(user["_id"]),
        "name": user["name"],
        "role": user["role"]
    })
    return {
        "token": token,
        "name": user["name"],
        "role": user["role"],
        "id": str(user["_id"])
    }
