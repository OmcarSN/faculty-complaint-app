"""
Authentication utilities — hashing, JWT tokens, and validation helpers.
"""
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import re
import os

load_dotenv()

# Passlib context with explicit bcrypt config for compatibility
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
    bcrypt__ident="2b",
)

SECRET_KEY = os.getenv("JWT_SECRET", "fallback-dev-secret-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRY_DAYS = 7

# --- Validation ---

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
VALID_ROLES = {"student", "admin"}

def validate_email(email: str) -> bool:
    """Check if email format is valid."""
    return bool(EMAIL_REGEX.match(email))

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password meets minimum requirements.
    Returns (is_valid, error_message).
    """
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    if len(password) > 128:
        return False, "Password must not exceed 128 characters"
    return True, ""

def validate_role(role: str) -> bool:
    """Check if role is a valid role."""
    return role in VALID_ROLES

# --- Hashing ---

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        # Handle corrupted hashes or incompatible formats gracefully
        return False

# --- JWT Tokens ---

def create_token(data: dict, expires_days: int = TOKEN_EXPIRY_DAYS) -> str:
    """Create a JWT token with expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=expires_days)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict | None:
    """
    Decode and validate a JWT token.
    Returns payload dict or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Check required fields
        if "id" not in payload or "role" not in payload:
            return None
        return payload
    except JWTError:
        return None
