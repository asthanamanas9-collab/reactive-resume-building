import os
import joblib
import numpy as np
from app.ml.preprocess import load_scaler, scale_features

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "performance_model.pkl")

def load_prediction_model():
    """Loads the trained RandomForestClassifier. Auto-trains if model is missing."""
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Running training script...")
        from app.ml.train_model import train
        train()
    return joblib.load(MODEL_PATH)

def predict_student_performance(features: dict) -> dict:
    """
    Predicts student performance level.
    Input: dict of raw features
    Output: dict with 'predicted_label' and 'confidence'
    """
    model = load_prediction_model()
    scaler = load_scaler()
    
    # Scale input features
    X_scaled = scale_features(features, scaler)
    
    # Predict probabilities
    probabilities = model.predict_proba(X_scaled)[0]
    predicted_index = np.argmax(probabilities)
    
    predicted_label = model.classes_[predicted_index]
    confidence = float(probabilities[predicted_index])
    
    return {
        "predicted_label": predicted_label,
        "confidence": round(confidence, 2)
    }
