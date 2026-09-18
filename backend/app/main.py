from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth_router, student_router, prediction_router, dashboard_router

# Create Database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Driven Student Performance Prediction System API",
    description="Backend API for predicting student outcomes, tracking attendance, and grades.",
    version="1.0.0"
)

# CORS configurations
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(student_router.router)
app.include_router(prediction_router.router)
app.include_router(dashboard_router.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the AI-Driven Student Performance Prediction System API",
        "docs_url": "/docs",
        "status": "running"
    }
