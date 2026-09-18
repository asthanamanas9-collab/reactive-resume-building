import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_CSV = os.path.join(BASE_DIR, "dataset", "student_performance.csv")
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "performance_model.pkl")
SCALER_PATH = os.path.join(SAVED_MODELS_DIR, "scaler.pkl")

# Import preprocessing helpers
from app.ml.preprocess import clean_data, FEATURE_COLS

def train():
    # If dataset doesn't exist, generate it
    if not os.path.exists(DATASET_CSV):
        print("Dataset not found. Generating synthetic dataset...")
        from app.ml.generate_dataset import generate_csv
        generate_csv()

    df = pd.read_csv(DATASET_CSV)
    df = clean_data(df)
    
    # Split features and target
    X = df[FEATURE_COLS]
    y = df["performance_label"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save the scaler
    joblib.dump(scaler, SCALER_PATH)
    print(f"Scaler saved successfully to: {SCALER_PATH}")
    
    # Train Random Forest Classifier
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted")
    recall = recall_score(y_test, y_pred, average="weighted")
    f1 = f1_score(y_test, y_pred, average="weighted")
    
    print("\n--- Model Evaluation Results ---")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved successfully to: {MODEL_PATH}")

if __name__ == "__main__":
    train()
