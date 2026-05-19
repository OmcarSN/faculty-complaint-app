"""
Database connection module with health check and automatic fallback.
Connects to MongoDB Atlas (primary) or local MongoDB (fallback).
"""
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from dotenv import load_dotenv
import certifi
import os
import sys

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/faculty_complaint_db")
DB_NAME = "faculty_complaint_db"

def create_client(uri: str, timeout_ms: int = 5000) -> MongoClient:
    """Create a MongoClient with proper SSL and timeout settings."""
    kwargs = {
        "serverSelectionTimeoutMS": timeout_ms,
        "connectTimeoutMS": timeout_ms,
        "socketTimeoutMS": 10000,
    }
    # Use certifi for Atlas (SRV) connections
    if "mongodb+srv" in uri or "mongodb.net" in uri:
        kwargs["tlsCAFile"] = certifi.where()
        kwargs["tls"] = True
    return MongoClient(uri, **kwargs)

def connect_to_database():
    """
    Try connecting to the primary URI first.
    If that fails, fallback to local MongoDB.
    Returns (client, db) tuple.
    """
    # Attempt primary connection (Atlas)
    try:
        client = create_client(MONGO_URI)
        # Force a connection attempt to verify it works
        client.admin.command("ping")
        print(f"[DB] Connected to primary database successfully")
        return client, client[DB_NAME]
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        print(f"[DB] WARNING: Primary database connection failed: {e}")

    # Fallback to local MongoDB
    local_uri = "mongodb://localhost:27017"
    try:
        client = create_client(local_uri, timeout_ms=3000)
        client.admin.command("ping")
        print(f"[DB] Connected to LOCAL MongoDB fallback")
        return client, client[DB_NAME]
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        print(f"[DB] CRITICAL: Local MongoDB also unavailable: {e}")
        print(f"[DB] The application will start but database operations will fail.")
        print(f"[DB] Please ensure MongoDB is running locally or Atlas cluster is active.")
        # Return a client anyway — operations will fail with clear errors
        client = create_client(MONGO_URI, timeout_ms=3000)
        return client, client[DB_NAME]

# Initialize connection
client, db = connect_to_database()

# Collection references
users_collection = db["users"]
complaints_collection = db["complaints"]
faculties_collection = db["faculties"]

def check_db_health() -> dict:
    """Check database connectivity. Returns health status dict."""
    try:
        client.admin.command("ping")
        collections = db.list_collection_names()
        return {
            "status": "healthy",
            "database": DB_NAME,
            "collections": collections,
            "user_count": users_collection.count_documents({}),
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
        }
