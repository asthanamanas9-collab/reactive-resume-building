from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date as date_type, datetime

class MarksBase(BaseModel):
    subject: str
    exam_name: str
    marks_obtained: float
    max_marks: float = 100.0
    date: date_type

class MarksCreate(MarksBase):
    pass

class MarksUpdate(BaseModel):
    subject: Optional[str] = None
    exam_name: Optional[str] = None
    marks_obtained: Optional[float] = None
    max_marks: Optional[float] = None
    date: Optional[date_type] = None

class MarksResponse(MarksBase):
    id: int
    student_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
