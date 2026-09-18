import os
import pandas as pd
import numpy as np

# Ensure directory exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
os.makedirs(DATASET_DIR, exist_ok=True)

def generate_csv(num_samples: int = 500):
    np.random.seed(42)
    
    student_ids = list(range(1001, 1001 + num_samples))
    
    # Generate realistic features
    attendance = np.random.uniform(60.0, 100.0, num_samples) # 60% to 100%
    past_exam_avg = np.random.uniform(40.0, 100.0, num_samples) # 40 to 100
    assignment_completion = np.random.uniform(50.0, 100.0, num_samples) # 50% to 100%
    study_hours = np.random.uniform(2.0, 25.0, num_samples) # 2 to 25 hours per week
    participation = np.random.uniform(1.0, 10.0, num_samples) # 1 to 10 scale
    
    # Simple score to determine the label
    # Excellent, Good, Average, At Risk
    score = (
        0.3 * attendance + 
        0.35 * past_exam_avg + 
        0.15 * assignment_completion + 
        0.1 * (study_hours * 4.0) + # normalize to 100
        0.1 * (participation * 10.0) # normalize to 100
    )
    # Add noise
    score += np.random.normal(0, 4, num_samples)
    score = np.clip(score, 0, 100)
    
    labels = []
    for s in score:
        if s >= 85:
            labels.append("Excellent")
        elif s >= 70:
            labels.append("Good")
        elif s >= 50:
            labels.append("Average")
        else:
            labels.append("At Risk")
            
    df = pd.DataFrame({
        "student_id": student_ids,
        "attendance_percentage": attendance,
        "past_exam_avg": past_exam_avg,
        "assignment_completion_rate": assignment_completion,
        "study_hours_per_week": study_hours,
        "participation_score": participation,
        "performance_label": labels
    })
    
    csv_path = os.path.join(DATASET_DIR, "student_performance.csv")
    df.to_csv(csv_path, index=False)
    print(f"Synthetic dataset saved to: {csv_path}")

if __name__ == "__main__":
    generate_csv()
