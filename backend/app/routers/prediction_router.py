from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.student import Student
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionResponse
from app.services.prediction_service import run_student_prediction
from app.utils.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/predict", tags=["Predictions"])

@router.post("/{student_id}", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def trigger_prediction(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return run_student_prediction(student_id, db)

@router.get("/{student_id}", response_model=List[PredictionResponse])
def get_prediction_history(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return student.predictions

