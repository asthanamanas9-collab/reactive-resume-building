# 🎓 AI-Driven Student Performance Prediction System

> **Predict at-risk students before it's too late.** A full-stack platform that combines a machine learning model with a real-time analytics dashboard to help teachers intervene early.

<p align="left">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=flat&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/scikit--learn-ML%20Model-F7931E?style=flat&logo=scikitlearn&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?style=flat&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" />
</p>

---

## 📌 Problem Statement

Teachers and academic coordinators often discover that a student is falling behind only **after** end-of-term results — when it's too late to intervene. Attendance, marks, and assignment data typically live in disconnected spreadsheets, making early risk detection slow and manual, especially across large classrooms.

## 💡 Our Solution

**EduPredict AI** (working name) is a web platform that:

- Centralizes student academic data — attendance, marks, assignments, study hours, participation
- Trains a **machine learning model** on historical data to predict each student's performance category (`Excellent` / `Good` / `Average` / `At Risk`)
- Surfaces predictions on a **live dashboard**, so teachers can spot and support at-risk students *during* the term, not after

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Auth** | JWT-based login/register with role-based access (Admin / Teacher) |
| 📊 **Analytics Dashboard** | Real-time cards, charts, and a sortable student table with risk badges |
| 🤖 **ML-Powered Predictions** | RandomForest classifier trained on attendance, marks, and engagement data |
| 📈 **Student Timelines** | Per-student attendance, marks, and prediction history over time |
| ⚡ **Instant Predictions** | Enter new metrics and get a predicted risk category + confidence score in real time |
| 🐳 **Deployable Anywhere** | Dockerized backend, frontend, and database for one-command deployment |

---



```
📸 Login Page        →  screenshots/login.png
📸 Dashboard          →  screenshots/dashboard.png
📸 Prediction Result  →  screenshots/prediction.png
🎥 Demo Video         →  https://your-demo-link.com
```

---

## 🏗️ Architecture

```
┌─────────────────────────────┐
│   React + Vite Dashboard    │   (Presentation Layer)
└──────────────┬───────────────┘
               │ REST API (JSON/HTTPS)
┌──────────────▼───────────────┐
│      FastAPI Backend         │   (Auth · Students · Predictions)
└───────┬───────────────┬──────┘
        │               │
┌───────▼──────┐  ┌──────▼────────┐
│  ML Service    │  │  SQLite / PostgreSQL │
│ scikit-learn   │  │  via SQLAlchemy ORM  │
└────────────────┘  └───────────────────────┘
```

---

## 🛠️ Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · Axios · Recharts
**Backend:** FastAPI · SQLAlchemy · Pydantic · JWT (python-jose) · Uvicorn
**Machine Learning:** scikit-learn · pandas · numpy · joblib
**Database:** SQLite (dev) / PostgreSQL (prod)
**DevOps:** Docker · Docker Compose · GitHub Actions (CI)

---

## 📁 Project Structure

```
student-performance-prediction/
├── backend/          # FastAPI app, ML pipeline, database models
├── frontend/          # React dashboard (Vite + Tailwind)
├── docs/              # Architecture & documentation
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/student-performance-prediction.git
cd student-performance-prediction
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
python -m app.ml.generate_dataset
python -m app.ml.train_model
uvicorn app.main:app --reload --port 8000
```
Backend runs at → `http://localhost:8000` (API docs at `/docs`)

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs at → `http://localhost:5173`

---

## 🧠 Machine Learning Model

- **Algorithm:** Random Forest Classifier (scikit-learn)
- **Features:** attendance %, past exam average, assignment completion rate, weekly study hours, participation score
- **Target:** performance category (Excellent / Good / Average / At Risk)
- **Metrics:** Accuracy ~87%, evaluated via train/test split with precision, recall, and F1-score
- **Serving:** Model serialized with `joblib` and loaded into the FastAPI backend for real-time inference via `/api/predict/{student_id}`

---

## 🔮 Future Roadmap

- [ ] SHAP-based explainability ("why was this student flagged?")
- [ ] Automated email/SMS alerts to guardians
- [ ] Automated model retraining on new data
- [ ] Mobile-responsive PWA

---


---



<p align="center">Built with ❤️ for [Hackathon Name] 2026</p>
