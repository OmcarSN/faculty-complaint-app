"""
Faculty listing routes — public for students to select faculty when filing complaints.
"""
from fastapi import APIRouter, HTTPException
from database import faculties_collection, complaints_collection
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError

router = APIRouter(prefix="/faculties", tags=["faculties"])


def faculty_serializer(faculty: dict, complaint_count: int = 0) -> dict:
    """Serialize a faculty MongoDB document to a clean API response."""
    return {
        "id": str(faculty["_id"]),
        "name": faculty.get("name", ""),
        "email": faculty.get("email", ""),
        "phone": faculty.get("phone", ""),
        "department": faculty.get("department", ""),
        "complaint_count": complaint_count,
    }


@router.get("")
def get_all_faculties():
    """
    Get all faculty members with their complaint counts.
    Public endpoint — students need this to file complaints.
    """
    try:
        faculties = list(faculties_collection.find())
        result = []
        for f in faculties:
            count = complaints_collection.count_documents({"faculty_id": str(f["_id"])})
            result.append(faculty_serializer(f, count))
        return result
    except PyMongoError as e:
        print(f"[FACULTY] Database error fetching faculties: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")


@router.get("/{faculty_id}")
def get_faculty(faculty_id: str):
    """Get a single faculty member by ID."""
    try:
        oid = ObjectId(faculty_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid faculty ID format")

    try:
        faculty = faculties_collection.find_one({"_id": oid})
        if not faculty:
            raise HTTPException(status_code=404, detail="Faculty not found")
        count = complaints_collection.count_documents({"faculty_id": faculty_id})
        return faculty_serializer(faculty, count)
    except HTTPException:
        raise
    except PyMongoError as e:
        print(f"[FACULTY] Database error: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")
