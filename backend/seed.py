"""
Seed script to initialize the database with test data.
Run: python seed.py
"""
from database import users_collection, faculties_collection
from utils.auth_utils import hash_password

ADMIN_EMAIL = "admin@college.com"
ADMIN_PASSWORD = "admin123"
STUDENT_EMAIL = "student@college.com"
STUDENT_PASSWORD = "student123"


def seed():
    # Create admin account
    if not users_collection.find_one({"email": ADMIN_EMAIL, "role": "admin"}):
        users_collection.insert_one({
            "name": "Admin",
            "email": ADMIN_EMAIL,
            "password": hash_password(ADMIN_PASSWORD),
            "phone": "9999999999",
            "role": "admin",
        })
        print("Admin account created")
    else:
        print("Admin account already exists")

    # Create test student
    if not users_collection.find_one({"email": STUDENT_EMAIL, "role": "student"}):
        users_collection.insert_one({
            "name": "Test Student",
            "email": STUDENT_EMAIL,
            "password": hash_password(STUDENT_PASSWORD),
            "phone": "8888888888",
            "role": "student",
        })
        print("Student account created")
    else:
        print("Student account already exists")

    # Add sample faculty
    sample_faculty = [
        {
            "name": "Prof. Ramesh Sharma",
            "email": "ramesh.sharma@college.com",
            "phone": "9876543210",
            "department": "Computer Science",
        },
        {
            "name": "Prof. Sunita Patil",
            "email": "sunita.patil@college.com",
            "phone": "9876543211",
            "department": "Electronics",
        },
        {
            "name": "Prof. Anil Desai",
            "email": "anil.desai@college.com",
            "phone": "9876543212",
            "department": "Mechanical",
        },
    ]

    for f in sample_faculty:
        if not faculties_collection.find_one({"email": f["email"]}):
            faculties_collection.insert_one(f)
            if not users_collection.find_one({"email": f["email"]}):
                users_collection.insert_one({
                    "name": f["name"],
                    "email": f["email"],
                    "phone": f["phone"],
                    "password": hash_password("faculty123"),
                    "role": "faculty",
                })
            print(f"Added faculty: {f['name']}")
        else:
            print(f"Faculty already exists: {f['name']}")

    print("\nSeeding complete.")
    print(f"Admin login: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print(f"Student login: {STUDENT_EMAIL} / {STUDENT_PASSWORD}")


if __name__ == "__main__":
    seed()
