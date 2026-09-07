# MediKiosk Clinical Core Backend

FastAPI & SQLAlchemy 2.0 Backend Service for the MediKiosk Intelligent Clinical Intake, Triage, and Unified Doctor/Nurse Workspace.

---

## 🌟 Architectural Overview

```
Frontend (React + Vite + TS)
       │ HTTP / JSON API (JWT Bearer)
       ▼
FastAPI Route Controllers (`app/api/v1/endpoints/`)
       │ Pydantic v2 DTOs / Schemas (`app/schemas/`)
       ▼
Domain Services (`app/services/` + `ai_interfaces.py`)
       │
       ▼
Data Repositories (`app/repositories/`)
       │
       ▼
SQLAlchemy 2.0 ORM Models (`app/models/`)
       │
       ▼
Database (PostgreSQL in Staging/Prod, SQLite in Local Dev)
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Python 3.12+
- `pip` or virtual environment manager

### 2. Installation
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration runs with a zero-configuration SQLite local database (`sqlite:///./medikiosk.db`).

### 4. Seed Realistic Clinical Demo Data
Seed the database with complete synthetic patient workflows (Ramesh Kumar #102, Sita Devi, Mohan Singh, Dr. Rajesh Sharma, Dr. Ananya Iyer, Nurse Priya Nair):
```bash
python seed/demo_data.py
```

### 5. Start Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/api/v1/health`

---

## 🧪 Running Automated Tests

Run the test suite with pytest:
```bash
pytest
```

---

## 🐳 Docker Deployment

To launch the full PostgreSQL + FastAPI stack with Docker Compose:
```bash
docker compose up --build -d
```

---

## 📂 Project Structure

```
backend/
├── alembic.ini                   # Alembic configuration
├── Dockerfile                    # Container definition
├── pytest.ini                    # Pytest configuration
├── requirements.txt              # Production & test dependencies
├── .env.example                  # Environment template
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/        # Domain route controllers
│   │       │   ├── health.py
│   │       │   ├── auth.py
│   │       │   ├── patients.py
│   │       │   ├── intake.py
│   │       │   ├── conversations.py
│   │       │   ├── documents.py
│   │       │   ├── facts.py
│   │       │   ├── timeline.py
│   │       │   ├── risk.py
│   │       │   ├── evidence.py
│   │       │   ├── verification.py
│   │       │   ├── queue.py
│   │       │   ├── doctor.py
│   │       │   ├── nurse.py
│   │       │   └── admin.py
│   │       └── router.py         # Master API v1 router
│   │
│   ├── core/                     # Config, DB engine, JWT security
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   │
│   ├── models/                   # SQLAlchemy 2.0 ORM Models
│   │   ├── user.py, patient.py, intake.py, conversation.py,
│   │   ├── document.py, medical_fact.py, medication.py, allergy.py,
│   │   ├── timeline.py, risk.py, evidence.py, verification.py,
│   │   ├── queue.py, audit.py, doctor.py, nurse.py, department.py
│   │
│   ├── schemas/                  # Pydantic v2 validation DTOs
│   ├── repositories/             # Layered repository database access
│   ├── services/                 # Domain logic & AI engine interfaces
│   └── utils/                    # Logging, storage helpers
│
├── seed/
│   └── demo_data.py              # Realistic clinical synthetic data seeder
└── tests/                        # Full pytest suite
```
