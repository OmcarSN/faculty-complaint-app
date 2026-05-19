import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(
    MONGO_URI,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000
)

db = client["faculty_complaint_db"]

users_collection = db["users"]
complaints_collection = db["complaints"]
faculties_collection = db["faculties"]

print("[DB] Connected to MongoDB Atlas successfully.")
