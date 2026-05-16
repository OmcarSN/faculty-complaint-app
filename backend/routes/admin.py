from fastapi import APIRouter, HTTPException, Header
from database import users_collection, complaints_collection, faculties_collection
from models import FacultyCreate
from utils.auth_utils import decode_token, hash_password
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["admin"])

def verify_admin(authorization: str):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authorized")
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return payload

@router.get("/complaints")
def get_all_complaints(authorization: str = Header(None)):
    verify_admin(authorization)
    complaints = list(complaints_collection.find().sort("timestamp", -1))
    result = []
    for c in complaints:
        result.append({
            "id": str(c["_id"]),
            "student_name": c["student_name"],
            "faculty_name": c["faculty_name"],
            "category": c["category"],
            "subject": c["subject"],
            "description": c["description"],
            "timestamp": c["timestamp"]
        })
    return result

@router.get("/stats")
def get_stats(authorization: str = Header(None)):
    verify_admin(authorization)
    return {
        "total_complaints": complaints_collection.count_documents({}),
        "total_faculty": faculties_collection.count_documents({}),
        "total_students": users_collection.count_documents({"role": "student"})
    }

@router.get("/faculty-alerts")
def get_faculty_alerts(authorization: str = Header(None)):
    verify_admin(authorization)
    faculties = list(faculties_collection.find())
    alerts = []
    for f in faculties:
        faculty_id = str(f["_id"])
        complaints = list(complaints_collection.find({"faculty_id": faculty_id}))
        if len(complaints) >= 5:
            alerts.append({
                "faculty_name": f["name"],
                "faculty_phone": f["phone"],
                "total_complaints": len(complaints),
                "complaints": [
                    {"category": c["category"], "subject": c["subject"]}
                    for c in complaints
                ]
            })
    return alerts

@router.post("/faculty")
def add_faculty(data: FacultyCreate, authorization: str = Header(None)):
    verify_admin(authorization)
    existing = users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed = hash_password(data.password)
    faculty_doc = {
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "department": data.department
    }
    result = faculties_collection.insert_one(faculty_doc)
    users_collection.insert_one({
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "password": hashed,
        "role": "faculty"
    })
    return {"message": "Faculty added successfully", "id": str(result.inserted_id)}

@router.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: str, authorization: str = Header(None)):
    verify_admin(authorization)
    faculty = faculties_collection.find_one({"_id": ObjectId(faculty_id)})
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    faculties_collection.delete_one({"_id": ObjectId(faculty_id)})
    users_collection.delete_one({"email": faculty["email"]})
    return {"message": "Faculty deleted successfully"}
