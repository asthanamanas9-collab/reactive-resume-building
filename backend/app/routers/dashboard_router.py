from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.student import Student
from app.models.attendance import Attendance
from app.models.prediction import Prediction
from app.utils.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_students = db.query(func.count(Student.id)).scalar() or 0
    
    # Calculate average study hours
    avg_study_hours = db.query(func.avg(Student.study_hours_per_week)).scalar() or 0.0
    avg_study_hours = round(float(avg_study_hours), 2)
    
    # Calculate global attendance rate
    total_attendance = db.query(func.count(Attendance.id)).scalar() or 0
    present_attendance = db.query(func.count(Attendance.id)).filter(Attendance.status.ilike("present")).scalar() or 0
    
    attendance_rate = 0.0
    if total_attendance > 0:
        attendance_rate = round((present_attendance / total_attendance) * 100, 2)
        
    # Get counts of latest risk status for students
    # We can get counts from the predictions table directly or check the latest prediction for each student
    # For a simple summary, let's group by risk_status on predictions
    # To get the latest prediction for each student, we can do a subquery or query the most recent predictions
    subquery = db.query(
        Prediction.student_id,
        func.max(Prediction.id).label("max_id")
    ).group_by(Prediction.student_id).subquery()
    
    risk_counts = {
        "Low": 0,
        "Medium": 0,
        "High": 0
    }
    
    latest_predictions = db.query(Prediction.risk_status, func.count(Prediction.id)).join(
        subquery, Prediction.id == subquery.c.max_id
    ).group_by(Prediction.risk_status).all()
    
    for status_name, count in latest_predictions:
        if status_name in risk_counts:
            risk_counts[status_name] = count
        else:
            risk_counts[status_name] = risk_counts.get(status_name, 0) + count

    # If some students don't have predictions, count them as "No Prediction" or calculate a simple default
    predicted_students_count = sum(risk_counts.values())
    no_prediction_count = max(0, total_students - predicted_students_count)
    risk_counts["Unpredicted"] = no_prediction_count

    return {
        "total_students": total_students,
        "average_study_hours": avg_study_hours,
        "attendance_rate": attendance_rate,
        "risk_distribution": risk_counts
    }
