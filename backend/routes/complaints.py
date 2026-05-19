"""
Complaint submission routes — protected, validated, with status tracking.
"""
from fastapi import APIRouter, HTTPException, Depends
from database import complaints_collection, faculties_collection
from models import ComplaintCreate
from utils.dependencies import require_student
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
from datetime import datetime, timezone

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.post("")
def submit_complaint(data: ComplaintCreate, student: dict = Depends(require_student)):
    """
    Submit a complaint against a faculty member.
    Student only. Validates faculty exists and sanitizes inputs.
    """
    try:
        # Validate faculty_id format and existence
        try:
            faculty_oid = ObjectId(data.faculty_id)
        except (InvalidId, Exception):
            raise HTTPException(status_code=400, detail="Invalid faculty ID format")

        faculty = faculties_collection.find_one({"_id": faculty_oid})
        if not faculty:
            raise HTTPException(status_code=404, detail="Faculty not found")

        # Build complaint document
        complaint = {
            "student_id": student["id"],
            "student_name": student["name"],
            "faculty_id": data.faculty_id,
            "faculty_name": faculty["name"],
            "category": data.category.strip(),
            "subject": data.subject.strip(),
            "description": data.description.strip(),
            "status": "pending",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        result = complaints_collection.insert_one(complaint)
        return {
            "message": "Complaint submitted successfully",
            "complaint_id": str(result.inserted_id),
        }
    except HTTPException:
        raise
    except PyMongoError as e:
        print(f"[COMPLAINTS] Database error submitting complaint: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable. Please try again.")
    except Exception as e:
        print(f"[COMPLAINTS] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.get("/my")
def get_my_complaints(student: dict = Depends(require_student)):
    """Get all complaints submitted by the current student."""
    try:
        complaints = list(
            complaints_collection.find({"student_id": student["id"]}).sort("timestamp", -1)
        )
        result = []
        for c in complaints:
            result.append({
                "id": str(c["_id"]),
                "faculty_name": c.get("faculty_name", "Unknown"),
                "category": c.get("category", ""),
                "subject": c.get("subject", ""),
                "description": c.get("description", ""),
                "status": c.get("status", "pending"),
                "timestamp": c.get("timestamp", ""),
            })
        return result
    except PyMongoError as e:
        print(f"[COMPLAINTS] Database error fetching complaints: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")
