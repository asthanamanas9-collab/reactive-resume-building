from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    predicted_label = Column(String, nullable=False)  # Excellent, Good, Average, At Risk
    risk_status = Column(String, nullable=False)      # Low, Medium, High
    confidence_score = Column(Float, nullable=False)  # confidence probability
    features_used = Column(String, nullable=True)     # JSON string representing features
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="predictions")

