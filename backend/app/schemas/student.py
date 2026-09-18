from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.attendance import AttendanceResponse
from app.schemas.marks import MarksResponse
from app.schemas.prediction import PredictionResponse

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    enrollment_number: str
    date_of_birth: Optional[str] = None
    class_level: str
    study_hours_per_week: Optional[float] = 0.0
    parent_collaboration: Optional[float] = 5.0

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    enrollment_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    class_level: Optional[str] = None
    study_hours_per_week: Optional[float] = None
    parent_collaboration: Optional[float] = None

class StudentResponse(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    predictions: List[PredictionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class StudentDetailResponse(StudentResponse):
    attendance_records: List[AttendanceResponse] = []
    marks_records: List[MarksResponse] = []
    predictions: List[PredictionResponse] = []

    model_config = ConfigDict(from_attributes=True)
