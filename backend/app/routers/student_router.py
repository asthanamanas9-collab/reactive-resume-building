from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.student import Student
from app.models.attendance import Attendance
from app.models.marks import Marks
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse, StudentDetailResponse
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.schemas.marks import MarksCreate, MarksUpdate, MarksResponse
from app.utils.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/students", tags=["Students"])

# ==================== STUDENT CRUD ====================

@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_student = db.query(Student).filter(Student.enrollment_number == student_in.enrollment_number).first()
    if db_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student with enrollment number '{student_in.enrollment_number}' already exists."
        )
    new_student = Student(**student_in.model_dump())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

@router.get("", response_model=List[StudentResponse])
def list_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Student).all()

@router.get("/{student_id}", response_model=StudentDetailResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    return student

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student_in: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    update_data = student_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)
        
    db.commit()
    db.refresh(student)
    return student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    db.delete(student)
    db.commit()
    return

# ==================== ATTENDANCE CRUD ====================

@router.post("/{student_id}/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def add_attendance(
    student_id: int,
    attendance_in: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    new_attendance = Attendance(student_id=student_id, **attendance_in.model_dump())
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

@router.get("/{student_id}/attendance", response_model=List[AttendanceResponse])
def get_student_attendance(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student.attendance_records

@router.put("/attendance/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: int,
    attendance_in: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
    
    update_data = attendance_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(attendance, key, value)
        
    db.commit()
    db.refresh(attendance)
    return attendance

@router.delete("/attendance/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
    db.delete(attendance)
    db.commit()
    return

# ==================== MARKS CRUD ====================

@router.post("/{student_id}/marks", response_model=MarksResponse, status_code=status.HTTP_201_CREATED)
def add_marks(
    student_id: int,
    marks_in: MarksCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    new_marks = Marks(student_id=student_id, **marks_in.model_dump())
    db.add(new_marks)
    db.commit()
    db.refresh(new_marks)
    return new_marks

@router.get("/{student_id}/marks", response_model=List[MarksResponse])
def get_student_marks(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student.marks_records

@router.put("/marks/{marks_id}", response_model=MarksResponse)
def update_marks(
    marks_id: int,
    marks_in: MarksUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    marks = db.query(Marks).filter(Marks.id == marks_id).first()
    if not marks:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marks record not found")
    
    update_data = marks_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(marks, key, value)
        
    db.commit()
    db.refresh(marks)
    return marks

@router.delete("/marks/{marks_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_marks(
    marks_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    marks = db.query(Marks).filter(Marks.id == marks_id).first()
    if not marks:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marks record not found")
    db.delete(marks)
    db.commit()
    return
