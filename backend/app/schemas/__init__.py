from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenData
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentDetailResponse
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.schemas.marks import MarksCreate, MarksUpdate, MarksResponse
from app.schemas.prediction import PredictionResponse, PredictionBase

__all__ = [
    "UserCreate", "UserLogin", "UserResponse", "Token", "TokenData",
    "StudentCreate", "StudentUpdate", "StudentResponse", "StudentDetailResponse",
    "AttendanceCreate", "AttendanceUpdate", "AttendanceResponse",
    "MarksCreate", "MarksUpdate", "MarksResponse",
    "PredictionResponse", "PredictionBase"
]
