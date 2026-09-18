import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
SCALER_PATH = os.path.join(SAVED_MODELS_DIR, "scaler.pkl")

# Features expected by model
FEATURE_COLS = [
    "attendance_percentage",
    "past_exam_avg",
    "assignment_completion_rate",
    "study_hours_per_week",
    "participation_score"
]

def load_scaler() -> StandardScaler:
    """Loads the fitted scaler."""
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Scaler not found at {SCALER_PATH}. Run training first.")
    return joblib.load(SCALER_PATH)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Basic cleaning, e.g. filling missing values."""
    cleaned_df = df.copy()
    
    # Fill numeric columns with median
    for col in FEATURE_COLS:
        if col in cleaned_df.columns:
            cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].median())
            
    return cleaned_df

def extract_features_from_db(student) -> dict:
    """
    Computes/extracts model features from database models for a given student.
    Returns a dictionary of raw features.
    """
    # 1. Attendance Percentage
    attendance_records = student.attendance_records
    if not attendance_records:
        attendance_percentage = 90.0  # Default
    else:
        total = len(attendance_records)
        present = sum(1 for r in attendance_records if r.status.lower() == "present")
        attendance_percentage = (present / total) * 100.0
        
    # 2. Past Exam Avg
    marks_records = student.marks_records
    if not marks_records:
        past_exam_avg = 75.0  # Default
    else:
        percentages = []
        for mark in marks_records:
            max_m = mark.max_marks if mark.max_marks > 0 else 100.0
            percentages.append((mark.marks_obtained / max_m) * 100.0)
        past_exam_avg = float(np.mean(percentages))
        
    # 3. Assignment Completion Rate (We'll use an approximation based on total assessments or simple logic)
    # Let's say if we have marks records, 90% is default
    assignment_completion_rate = 92.0
    
    # 4. Study Hours
    study_hours_per_week = student.study_hours_per_week or 10.0
    
    # 5. Participation Score (mapped from parent collaboration and some details or static)
    # Let's map parent collaboration to participation score on a scale of 1-10
    participation_score = student.parent_collaboration or 7.0
    
    return {
        "attendance_percentage": float(attendance_percentage),
        "past_exam_avg": float(past_exam_avg),
        "assignment_completion_rate": float(assignment_completion_rate),
        "study_hours_per_week": float(study_hours_per_week),
        "participation_score": float(participation_score)
    }

def scale_features(features_dict: dict, scaler: StandardScaler) -> np.ndarray:
    """Converts feature dict to array and scales it."""
    # Build 2D array in exact order
    feat_values = [features_dict[col] for col in FEATURE_COLS]
    feat_array = np.array([feat_values])
    return scaler.transform(feat_array)
