"""
Admin routes — dashboard stats, complaint management, faculty CRUD.
Protected by admin role dependency.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from database import users_collection, complaints_collection, faculties_collection
from models import FacultyCreate
from utils.auth_utils import hash_password
from utils.dependencies import require_admin
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError

router = APIRouter(prefix="/admin", tags=["admin"])


def safe_object_id(id_str: str) -> ObjectId:
    """Safely convert string to ObjectId, raising 400 on invalid format."""
    try:
        return ObjectId(id_str)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {id_str}")


@router.get("/complaints")
def get_all_complaints(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=200, description="Items per page"),
    admin: dict = Depends(require_admin),
):
    """Get all complaints with pagination. Admin only."""
    try:
        skip = (page - 1) * limit
        total = complaints_collection.count_documents({})
        complaints = list(
            complaints_collection.find()
            .sort("timestamp", -1)
            .skip(skip)
            .limit(limit)
        )
        result = []
        for c in complaints:
            result.append({
                "id": str(c["_id"]),
                "student_name": c.get("student_name", "Anonymous"),
                "faculty_name": c.get("faculty_name", "Unknown"),
                "faculty_id": c.get("faculty_id", ""),
                "category": c.get("category", ""),
                "subject": c.get("subject", ""),
                "description": c.get("description", ""),
                "status": c.get("status", "pending"),
                "timestamp": c.get("timestamp", ""),
            })
        return {
            "complaints": result,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
        }
    except PyMongoError as e:
        print(f"[ADMIN] Database error fetching complaints: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.get("/stats")
def get_stats(admin: dict = Depends(require_admin)):
    """Get dashboard statistics. Admin only."""
    try:
        total_complaints = complaints_collection.count_documents({})
        pending = complaints_collection.count_documents({"status": "pending"})
        reviewed = complaints_collection.count_documents({"status": "reviewed"})
        resolved = complaints_collection.count_documents({"status": "resolved"})

        return {
            "total_complaints": total_complaints,
            "pending_complaints": pending,
            "reviewed_complaints": reviewed,
            "resolved_complaints": resolved,
            "total_faculty": faculties_collection.count_documents({}),
            "total_students": users_collection.count_documents({"role": "student"}),
        }
    except PyMongoError as e:
        print(f"[ADMIN] Database error fetching stats: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.get("/faculty-alerts")
def get_faculty_alerts(
    threshold: int = Query(5, ge=1, le=50, description="Minimum complaints for alert"),
    admin: dict = Depends(require_admin),
):
    """Get faculty members with complaints above threshold. Admin only."""
    try:
        faculties = list(faculties_collection.find())
        alerts = []
        for f in faculties:
            faculty_id = str(f["_id"])
            complaint_list = list(complaints_collection.find({"faculty_id": faculty_id}))
            complaint_count = len(complaint_list)
            if complaint_count >= threshold:
                alerts.append({
                    "faculty_id": faculty_id,
                    "faculty_name": f.get("name", "Unknown"),
                    "faculty_phone": f.get("phone", ""),
                    "department": f.get("department", ""),
                    "total_complaints": complaint_count,
                    "complaints": [
                        {
                            "category": c.get("category", ""),
                            "subject": c.get("subject", ""),
                            "status": c.get("status", "pending"),
                        }
                        for c in complaint_list
                    ],
                })
        # Sort by complaint count descending
        alerts.sort(key=lambda x: x["total_complaints"], reverse=True)
        return alerts
    except PyMongoError as e:
        print(f"[ADMIN] Database error fetching faculty alerts: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.patch("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    status: str = Query(..., description="New status"),
    admin: dict = Depends(require_admin),
):
    """Update the status of a complaint. Admin only."""
    if status not in ("pending", "reviewed", "resolved"):
        raise HTTPException(status_code=400, detail="Status must be 'pending', 'reviewed', or 'resolved'")

    try:
        oid = safe_object_id(complaint_id)
        result = complaints_collection.update_one(
            {"_id": oid},
            {"$set": {"status": status}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Complaint not found")
        return {"message": f"Complaint status updated to '{status}'"}
    except HTTPException:
        raise
    except PyMongoError as e:
        print(f"[ADMIN] Database error updating complaint: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.post("/faculty")
def add_faculty(data: FacultyCreate, admin: dict = Depends(require_admin)):
    """Add a new faculty member. Admin only."""
    email = data.email.strip().lower()

    try:
        existing = users_collection.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=409, detail="A user with this email already exists")

        hashed = hash_password(data.password)
        faculty_doc = {
            "name": data.name.strip(),
            "email": email,
            "phone": data.phone.strip(),
            "department": data.department.strip(),
        }
        result = faculties_collection.insert_one(faculty_doc)
        users_collection.insert_one({
            "name": data.name.strip(),
            "email": email,
            "phone": data.phone.strip(),
            "password": hashed,
            "role": "faculty",
        })
        return {
            "message": "Faculty added successfully",
            "id": str(result.inserted_id),
        }
    except HTTPException:
        raise
    except PyMongoError as e:
        print(f"[ADMIN] Database error adding faculty: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: str, admin: dict = Depends(require_admin)):
    """Delete a faculty member and their user account. Admin only."""
    try:
        oid = safe_object_id(faculty_id)
        faculty = faculties_collection.find_one({"_id": oid})
        if not faculty:
            raise HTTPException(status_code=404, detail="Faculty not found")

        faculties_collection.delete_one({"_id": oid})
        users_collection.delete_one({"email": faculty["email"]})
        return {"message": "Faculty deleted successfully"}
    except HTTPException:
        raise
    except PyMongoError as e:
        print(f"[ADMIN] Database error deleting faculty: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")
