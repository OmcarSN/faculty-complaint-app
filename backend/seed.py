from pymongo import MongoClient
from utils.auth_utils import hash_password
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["faculty_complaint_db"]

users = db["users"]
faculties = db["faculties"]

# Clear existing data for clean seed
users.delete_many({})
faculties.delete_many({})

# Admin
admin = {
    "name": "Admin",
    "email": "admin@college.com",
    "password": hash_password("admin123"),
    "role": "admin",
    "phone": "9999999999"
}
users.insert_one(admin)

# Faculties
faculty_data = [
    {
        "name": "Prof. Ramesh Sharma",
        "email": "ramesh@college.com",
        "phone": "9876543210",
        "department": "Computer Science",
        "password": hash_password("faculty123"),
        "role": "faculty"
    },
    {
        "name": "Prof. Sunita Patil",
        "email": "sunita@college.com",
        "phone": "9823456789",
        "department": "Information Technology",
        "password": hash_password("faculty123"),
        "role": "faculty"
    },
    {
        "name": "Prof. Anil Desai",
        "email": "anil@college.com",
        "phone": "9812345678",
        "department": "Electronics",
        "password": hash_password("faculty123"),
        "role": "faculty"
    }
]

for f in faculty_data:
    users.insert_one({
        "name": f["name"],
        "email": f["email"],
        "password": f["password"],
        "phone": f["phone"],
        "role": f["role"]
    })
    faculties.insert_one({
        "name": f["name"],
        "email": f["email"],
        "phone": f["phone"],
        "department": f["department"]
    })

# Student
student = {
    "name": "Test Student",
    "email": "student@college.com",
    "password": hash_password("student123"),
    "role": "student",
    "phone": "9011223344"
}
users.insert_one(student)

print("Seed data inserted successfully")
