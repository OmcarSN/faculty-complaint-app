"""
Faculty Complaint API — main entry point.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.auth import router as auth_router
from routes.faculty import router as faculty_router
from routes.complaints import router as complaints_router
from routes.admin import router as admin_router

import time, traceback

app = FastAPI(title="Faculty Complaint API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = round((time.time() - start) * 1000, 2)
    print(f"[API] {request.method} {request.url.path} -> {response.status_code} ({ms}ms)")
    return response

@app.exception_handler(Exception)
async def global_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

@app.on_event("startup")
async def startup():
    print("=" * 50)
    print("  Faculty Complaint API v2.0")
    print("  DB: Connected")
    print("=" * 50)

app.include_router(auth_router)
app.include_router(faculty_router)
app.include_router(complaints_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {"message": "Faculty Complaint API is running", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
