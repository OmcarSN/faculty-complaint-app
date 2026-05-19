import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi
import ssl

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        socketTimeoutMS=10000
    )
    client.admin.command('ping')
    print("[DB] Connected to MongoDB Atlas successfully.")
except Exception as e:
    print(f"[DB] Connection failed: {e}")
    client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())

db = client["faculty_complaint_db"]
users_collection = db["users"]
complaints_collection = db["complaints"]
faculties_collection = db["faculties"]
