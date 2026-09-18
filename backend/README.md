# AI-Driven Student Performance Prediction System - Backend

This is the Python FastAPI backend for the AI-Driven Student Performance Prediction System. It includes:
- JWT-based authentication for Administrators/Teachers.
- Student profiles CRUD.
- Student attendance & marks tracking CRUD.
- Machine Learning inference endpoint (`/api/predict/{student_id}`) utilizing a scikit-learn Random Forest Regressor trained on study hours, attendance rate, average marks, and parental collaboration metrics.
- Summary dashboard metrics (`/api/dashboard/summary`).

---

## Tech Stack
- **Framework:** FastAPI
- **Web Server:** Uvicorn
- **ORM:** SQLAlchemy
- **Data Serialization & Validation:** Pydantic v2
- **Database:** SQLite (local development)
- **Machine Learning:** Scikit-Learn, Pandas, NumPy, Joblib
- **Authentication:** Python-Jose (JWT Tokens), Passlib (Bcrypt)

---

## File Structure
```
backend/
├── app/
│   ├── ml/                       # Machine Learning Pipeline
│   │   ├── dataset/              # Generated/Real datasets
│   │   ├── saved_models/         # Saved joblib models
│   │   ├── preprocess.py         # DB metrics preprocessing
│   │   ├── train_model.py        # Model training script
│   │   └── predict.py            # Predictor and model loader
│   ├── models/                   # SQLAlchemy database models
│   ├── schemas/                  # Pydantic validation schemas
│   ├── routers/                  # API endpoints (Auth, Student, Dashboard, Prediction)
│   ├── utils/                    # Security helper functions
│   ├── config.py                 # Pydantic Settings config
│   ├── database.py               # Database engine & session setup
│   └── main.py                   # FastAPI app entry point
├── .env.example
├── .env
├── requirements.txt
└── README.md
```

---

## Getting Started

### 1. Prerequisites
Ensure you have Python 3.10+ installed.

### 2. Setup Virtual Environment & Install Dependencies
Navigate to the `backend/` directory:
```bash
cd backend
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file using the example:
```bash
cp .env.example .env
```
The defaults in `.env` are configured for SQLite:
```env
DATABASE_URL=sqlite:///./student_performance.db
SECRET_KEY=supersecretjwtkeythatshouldbechangedinproduction123!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Train the ML Model
Before running predictions, you need to train the model. A script is provided to generate a synthetic dataset and train a Random Forest model:
```bash
python -m app.ml.train_model
```
This saves the trained model to `app/ml/saved_models/model.joblib`. (If you skip this step, the prediction router will automatically trigger model generation on the first API call.)

### 5. Running the Backend Server
Start the Uvicorn hot-reload development server:
```bash
uvicorn app.main:app --reload
```
The server will start on [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## API Documentation
Once the server is running, visit:
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Authentication Flow
1. **Register** a new account by sending a `POST` request to `/api/auth/register` with `username`, `email`, and `password`.
2. **Login** by sending a `POST` request to `/api/auth/login` containing `username` and `password` as form-data (standard OAuth2 flow). You will receive an `access_token`.
3. Put the token in the `Authorization: Bearer <token>` header to make requests to the secured routes.
