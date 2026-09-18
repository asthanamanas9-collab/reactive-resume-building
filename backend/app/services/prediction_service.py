import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.student import Student
from app.models.prediction import Prediction
from app.ml.preprocess import extract_features_from_db
from app.ml.predict import predict_student_performance

def run_student_prediction(student_id: int, db: Session) -> Prediction:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} not found"
        )
        
    # Extract features from db objects
    features = extract_features_from_db(student)
    
    # Run ML prediction
    prediction_result = predict_student_performance(features)
    
    # Map performance label to a general risk status
    # Excellent/Good -> Low Risk
    # Average -> Medium Risk
    # At Risk -> High Risk
    label = prediction_result["predicted_label"]
    if label in ["Excellent", "Good"]:
        risk_status = "Low"
    elif label == "Average":
        risk_status = "Medium"
    else:
        risk_status = "High"
        
    # Save to database
    db_prediction = Prediction(
        student_id=student_id,
        predicted_label=label,
        risk_status=risk_status,
        confidence_score=prediction_result["confidence"],
        features_used=json.dumps(features)
    )
    
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    
    return db_prediction
