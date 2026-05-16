from fastapi import APIRouter, HTTPException
from database import faculties_collection, complaints_collection
from bson import ObjectId

router = APIRouter(prefix="/faculties", tags=["faculties"])

def faculty_serializer(faculty, complaint_count=0):
    return {
        "id": str(faculty["_id"]),
        "name": faculty["name"],
        "email": faculty["email"],
        "phone": faculty["phone"],
        "department": faculty["department"],
        "complaint_count": complaint_count
    }

@router.get("")
def get_all_faculties():
    faculties = list(faculties_collection.find())
    result = []
    for f in faculties:
        count = complaints_collection.count_documents({"faculty_id": str(f["_id"])})
        result.append(faculty_serializer(f, count))
    return result

@router.get("/{faculty_id}")
def get_faculty(faculty_id: str):
    faculty = faculties_collection.find_one({"_id": ObjectId(faculty_id)})
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    count = complaints_collection.count_documents({"faculty_id": faculty_id})
    return faculty_serializer(faculty, count)
