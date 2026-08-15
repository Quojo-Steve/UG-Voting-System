# UG Voting Backend

FastAPI backend for the University of Ghana voting frontend.

## Setup

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows Git Bash/PowerShell equivalent as needed
python -m pip install -r requirements.txt
```

## Run

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API base URL expected by the frontend:

```text
http://localhost:8000/api
```

Default commissioner seed created on startup:

```text
email: commissioner@ug.edu.gh
password: ecpassword2026
```

## Tests

```bash
python -m pytest -q
```

## Migrations

```bash
python -m alembic upgrade head
python -m alembic revision --autogenerate -m "message"
```
