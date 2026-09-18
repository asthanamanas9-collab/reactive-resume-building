from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date as date_type, datetime

class AttendanceBase(BaseModel):
    date: date_type
    status: str  # Present, Absent, Late
    remarks: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    date: Optional[date_type] = None
    status: Optional[str] = None
    remarks: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: int
    student_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
