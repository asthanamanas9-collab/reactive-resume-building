from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    enrollment_number = Column(String, unique=True, index=True, nullable=False)
    date_of_birth = Column(String, nullable=True)
    class_level = Column(String, nullable=False)  # e.g., Grade 10, Grade 12
    study_hours_per_week = Column(Float, default=0.0)
    parent_collaboration = Column(Float, default=5.0)  # scale of 1-10
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    marks_records = relationship("Marks", back_populates="student", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="student", cascade="all, delete-orphan")
