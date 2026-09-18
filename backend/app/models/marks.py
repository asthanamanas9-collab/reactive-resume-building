from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Marks(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject = Column(String, nullable=False)
    exam_name = Column(String, nullable=False)  # e.g., Midterm, Final, Quiz 1
    marks_obtained = Column(Float, nullable=False)
    max_marks = Column(Float, nullable=False, default=100.0)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="marks_records")
