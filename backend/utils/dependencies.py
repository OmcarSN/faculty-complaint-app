"""
FastAPI dependencies for authentication and authorization.
Use these with Depends() for clean, reusable route protection.
"""
from fastapi import Header, HTTPException, Depends
from utils.auth_utils import decode_token


def get_current_user(authorization: str = Header(None)) -> dict:
    """
    Extract and validate the current user from the Authorization header.
    Raises 401 if token is missing or invalid.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please provide a valid token.",
        )
    # Support both "Bearer <token>" and raw token
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    if not token:
        raise HTTPException(status_code=401, detail="Empty token provided")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token. Please log in again.",
        )
    return payload


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that requires the current user to be an admin.
    Chain with get_current_user.
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin privileges required.",
        )
    return user


def require_student(user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that requires the current user to be a student.
    Chain with get_current_user.
    """
    if user.get("role") != "student":
        raise HTTPException(
            status_code=403,
            detail="Access denied. Student account required.",
        )
    return user
