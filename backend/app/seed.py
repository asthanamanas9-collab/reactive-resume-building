import os
import sys
from datetime import datetime, date, timedelta
import random

# Ensure the root directory of the project is in the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.student import Student
from app.models.attendance import Attendance
from app.models.marks import Marks
from app.services.prediction_service import run_student_prediction
from app.utils.security import get_password_hash

def seed_data():
    # Recreate all tables
    print("Recreating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Create default admin user if not exists
        admin_user = db.query(User).filter(User.username == "shaileynayak123").first()
        if not admin_user:
            print("Creating default admin user 'shaileynayak123' with password 'password123'...")
            hashed_pw = get_password_hash("password123")
            admin_user = User(
                username="shaileynayak123",
                email="nayakshailey2005@gmail.com",
                full_name="Shailey Nayak",
                hashed_password=hashed_pw
            )
            db.add(admin_user)
            db.commit()

        # Check if students already exist
        student_count = db.query(Student).count()
        if student_count > 0:
            print(f"Database already has {student_count} students. Skipping seeding.")
            return

        print("Seeding database with mock student data...")

        # Create mock students
        students_data = [
            # High Performing students (Low risk)
            {"first_name": "Aarav", "last_name": "Sharma", "enrollment_number": "STU001", "class_level": "Grade 10", "study_hours_per_week": 18.0, "parent_collaboration": 9.0},
            {"first_name": "Diya", "last_name": "Patel", "enrollment_number": "STU002", "class_level": "Grade 10", "study_hours_per_week": 16.5, "parent_collaboration": 8.5},
            {"first_name": "Kabir", "last_name": "Mehta", "enrollment_number": "STU003", "class_level": "Grade 12", "study_hours_per_week": 20.0, "parent_collaboration": 9.5},
            
            # Average Performing students (Medium risk)
            {"first_name": "Ananya", "last_name": "Rao", "enrollment_number": "STU004", "class_level": "Grade 10", "study_hours_per_week": 10.0, "parent_collaboration": 6.0},
            {"first_name": "Vivaan", "last_name": "Singh", "enrollment_number": "STU005", "class_level": "Grade 12", "study_hours_per_week": 11.5, "parent_collaboration": 7.0},
            {"first_name": "Ira", "last_name": "Joshi", "enrollment_number": "STU006", "class_level": "Grade 10", "study_hours_per_week": 9.0, "parent_collaboration": 5.5},
            {"first_name": "Rohan", "last_name": "Gupta", "enrollment_number": "STU007", "class_level": "Grade 12", "study_hours_per_week": 8.0, "parent_collaboration": 6.5},
            
            # At-Risk students (High risk)
            {"first_name": "Aditya", "last_name": "Verma", "enrollment_number": "STU008", "class_level": "Grade 10", "study_hours_per_week": 3.0, "parent_collaboration": 2.0},
            {"first_name": "Sanya", "last_name": "Malhotra", "enrollment_number": "STU009", "class_level": "Grade 12", "study_hours_per_week": 4.5, "parent_collaboration": 3.0},
            {"first_name": "Arjun", "last_name": "Kapoor", "enrollment_number": "STU010", "class_level": "Grade 12", "study_hours_per_week": 2.0, "parent_collaboration": 2.5},
        ]

        subjects = ["Mathematics", "Science", "English", "Social Studies", "Computer Science"]
        exams = ["Quiz 1", "Midterm", "Quiz 2", "Final Exam"]

        start_date = date.today() - timedelta(days=30)

        for s_data in students_data:
            student = Student(
                first_name=s_data["first_name"],
                last_name=s_data["last_name"],
                enrollment_number=s_data["enrollment_number"],
                email=f"{s_data['first_name'].lower()}.{s_data['last_name'].lower()}@school.com",
                class_level=s_data["class_level"],
                study_hours_per_week=s_data["study_hours_per_week"],
                parent_collaboration=s_data["parent_collaboration"]
            )
            db.add(student)
            db.flush()  # to populate student.id

            # Determine behavior profiles for realistic generation
            is_low_risk = s_data["study_hours_per_week"] >= 15.0
            is_high_risk = s_data["study_hours_per_week"] <= 5.0

            # 1. Add attendance records (30 school days)
            for i in range(30):
                att_date = start_date + timedelta(days=i)
                # Skip weekends
                if att_date.weekday() >= 5:
                    continue

                if is_low_risk:
                    # 95% attendance rate
                    status = "Present" if random.random() < 0.95 else "Absent"
                elif is_high_risk:
                    # 60% attendance rate
                    status = "Present" if random.random() < 0.60 else "Absent"
                else:
                    # 85% attendance rate
                    status = "Present" if random.random() < 0.85 else "Absent"

                attendance = Attendance(
                    student_id=student.id,
                    date=att_date,
                    status=status,
                    remarks="Regular school day"
                )
                db.add(attendance)

            # 2. Add Marks records
            for exam in exams:
                for subj in subjects:
                    if is_low_risk:
                        marks_obtained = round(random.uniform(85, 100), 1)
                    elif is_high_risk:
                        marks_obtained = round(random.uniform(40, 65), 1)
                    else:
                        marks_obtained = round(random.uniform(65, 85), 1)

                    mark = Marks(
                        student_id=student.id,
                        subject=subj,
                        exam_name=exam,
                        marks_obtained=marks_obtained,
                        max_marks=100.0,
                        date=start_date + timedelta(days=15 if "Midterm" in exam else 28)
                    )
                    db.add(mark)

            db.commit()

            # 3. Generate ML Prediction
            try:
                run_student_prediction(student.id, db)
                print(f"Generated prediction for student {student.first_name} {student.last_name}")
            except Exception as pe:
                print(f"Failed to generate prediction for {student.first_name}: {pe}")

        print("Successfully seeded all mock data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
