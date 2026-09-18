from app.database import Base
from app.models.user import User
from app.models.student import Student
from app.models.attendance import Attendance
from app.models.marks import Marks
from app.models.prediction import Prediction

__all__ = ["Base", "User", "Student", "Attendance", "Marks", "Prediction"]
