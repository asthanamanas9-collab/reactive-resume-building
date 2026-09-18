from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PredictionBase(BaseModel):
    predicted_label: str  # Excellent, Good, Average, At Risk
    risk_status: str      # Low, Medium, High
    confidence_score: float
    features_used: Optional[str] = None

class PredictionResponse(PredictionBase):
    id: int
    student_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

