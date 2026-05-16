from fastapi import APIRouter, HTTPException, Header
from database import complaints_collection, faculties_collection
from models import ComplaintCreate
from utils.auth_utils import decode_token
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/complaints", tags=["complaints"])

@router.post("")
def submit_complaint(data: ComplaintCreate, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authorized")
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload or payload.get("role") != "student":
        raise HTTPException(status_code=401, detail="Students only")
    faculty = faculties_collection.find_one({"_id": ObjectId(data.faculty_id)})
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    complaint = {
        "student_id": payload["id"],
        "student_name": payload["name"],
        "faculty_id": data.faculty_id,
        "faculty_name": faculty["name"],
        "category": data.category,
        "subject": data.subject,
        "description": data.description,
        "timestamp": datetime.utcnow().isoformat()
    }
    complaints_collection.insert_one(complaint)
    return {"message": "Complaint submitted successfully"}
