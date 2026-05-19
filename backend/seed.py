"""
Seed script — idempotent database seeding with connection check.
"""
from pymongo import MongoClient
from utils.auth_utils import hash_password
from dotenv import load_dotenv
import certifi
import os
import sys

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/faculty_complaint_db")

def create_client():
    kwargs = {"serverSelectionTimeoutMS": 5000, "connectTimeoutMS": 5000}
    if "mongodb+srv" in MONGO_URI or "mongodb.net" in MONGO_URI:
        kwargs["tlsCAFile"] = certifi.where()
        kwargs["tls"] = True
    return MongoClient(MONGO_URI, **kwargs)

def seed():
    print("[SEED] Connecting to database...")
    try:
        client = create_client()
        client.admin.command("ping")
        print("[SEED] Connected successfully")
    except Exception as e:
        print(f"[SEED] Atlas connection failed: {e}")
        print("[SEED] Trying local MongoDB...")
        try:
            client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=3000)
            client.admin.command("ping")
            print("[SEED] Connected to local MongoDB")
        except Exception as e2:
            print(f"[SEED] FATAL: No database available: {e2}")
            sys.exit(1)

    db = client["faculty_complaint_db"]
    users = db["users"]
    faculties = db["faculties"]

    # Clear existing data
    users.delete_many({})
    faculties.delete_many({})
    print("[SEED] Cleared existing data")

    # Admin
    users.insert_one({
        "name": "Admin",
        "email": "admin@college.com",
        "password": hash_password("admin123"),
        "role": "admin",
        "phone": "9999999999"
    })
    print("[SEED] Admin created: admin@college.com / admin123")

    # Faculties
    faculty_data = [
        {"name": "Prof. Ramesh Sharma", "email": "ramesh@college.com",
         "phone": "9876543210", "department": "Computer Science"},
        {"name": "Prof. Sunita Patil", "email": "sunita@college.com",
         "phone": "9823456789", "department": "Information Technology"},
        {"name": "Prof. Anil Desai", "email": "anil@college.com",
         "phone": "9812345678", "department": "Electronics"},
    ]
    for f in faculty_data:
        users.insert_one({
            "name": f["name"], "email": f["email"],
            "password": hash_password("faculty123"),
            "phone": f["phone"], "role": "faculty"
        })
        faculties.insert_one({
            "name": f["name"], "email": f["email"],
            "phone": f["phone"], "department": f["department"]
        })
    print(f"[SEED] {len(faculty_data)} faculties created")

    # Student
    users.insert_one({
        "name": "Test Student",
        "email": "student@college.com",
        "password": hash_password("student123"),
        "role": "student",
        "phone": "9011223344"
    })
    print("[SEED] Student created: student@college.com / student123")
    print("[SEED] Done!")

if __name__ == "__main__":
    seed()
