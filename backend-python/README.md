# Pawthos Python Backend API

FastAPI-based backend for the Pawthos pet management application. Provides authentication, pet profiles, appointments, medical/vaccination records, image uploads, and feline pain assessment using classic vision heuristics and an advanced ELD (Ensemble Landmark Detector) model.

## Tech Stack

- **FastAPI** for REST API and OpenAPI docs
- **SQLAlchemy** ORM with **PostgreSQL**
- **JWT** auth, **bcrypt** password hashing
- **CORS** for mobile app access
- **Email OTP** via `fastapi-mail` (Gmail SMTP by default)
- **Computer Vision/ML**: OpenCV, Pillow, optional PyTorch EfficientNet, ELD 48-landmark model

## Project Structure (backend only)

```
backend-python/
├── main.py                 # FastAPI app, models, endpoints
├── requirements.txt        # Backend dependencies
├── models/
│   ├── best_efficientnet_model.pth
│   └── haarcascade_frontalcatface_extended.xml
├── eld/                    # ELD 48-landmark implementation
│   ├── eld_model.py
│   ├── eld_pain_model.pkl
│   ├── README_ELD.md
│   └── train_*.py
├── uploads/                # Uploaded images (served at /uploads)
├── migrate_reset_tokens.py # Helper script
├── run.txt                 # Quick-run commands
└── README.md               # This file
```

## Prerequisites

- Python 3.11+
- PostgreSQL running locally or accessible via `DATABASE_URL`
- Windows PowerShell, macOS Terminal, or Linux shell

## Setup

### 1) Create/Activate Virtual Environment (Windows PowerShell)

```powershell
python -m venv venv
./venv/Scripts/Activate.ps1
```

### 2) Install Dependencies

```powershell
pip install -r requirements.txt
```

Note: For this project, always use `requirements.txt` for installs (not any other requirements file).

### 3) Environment Variables

Create `.env` in `backend-python/` with at least:

```
DATABASE_URL=postgresql://postgres:pawthos@localhost/cityvet_db
SECRET_KEY=change_me_in_production
SMTP_USER=your_gmail_username@gmail.com
SMTP_PASS=your_gmail_app_password
```

Gmail requires an App Password when 2FA is enabled. Mail is sent via `smtp.gmail.com:587`.

### 4) Database

Ensure PostgreSQL is running and the database in `DATABASE_URL` exists. Tables are auto-created on startup. The app includes migration-like safeguards that add missing columns for legacy databases.

### 5) Run the Server

```powershell
# from backend-python/
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the quick guide in `run.txt`:

```text
./venv/Scripts/Activate.ps1
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API base: `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

## Core Features and Endpoints

Auth and Profile
- `POST /api/register` — Register with email + OTP
- `POST /api/verify-otp` — Verify email OTP
- `POST /api/login` — Login, returns JWT
- `GET /api/me` — Current user profile
- `PUT /api/update-profile` — Update profile fields
- `POST /forgot-password` — Request password reset link
- `POST /reset-password` — Reset password with token

Dashboard
- `GET /api/dashboard` — Summary for the current user

Pets
- `POST /api/pets` — Create pet (auto species-based `pet_id` like `PET-C-1`)
- `GET /api/pets` — List user’s pets
- `GET /api/pets/{id}` — Get one pet
- `PUT /api/pets/{id}` — Update pet
- `DELETE /api/pets/{id}` — Delete pet
- `POST /api/upload-pet-photo?pet_id={id}` — Upload pet photo; served under `/uploads/...`

Appointments
- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/appointments/{id}`
- `PUT /api/appointments/{id}`
- `PATCH /api/appointments/{id}/status` — Update status
- `DELETE /api/appointments/{id}`

Medical Records
- `POST /api/medical-records`
- `GET /api/medical-records`
- `GET /api/medical-records/pet/{pet_id}`
- `GET /api/medical-records/{id}`
- `PUT /api/medical-records/{id}`
- `DELETE /api/medical-records/{id}`

Vaccination Records and Events
- `POST /api/vaccination-records`
- `GET /api/vaccination-records`
- `GET /api/vaccination-records/{id}`
- `PUT /api/vaccination-records/{id}`
- `DELETE /api/vaccination-records/{id}`
- `GET /api/vaccination-events/scheduled` — Public, returns scheduled events

Health
- `GET /health` — Returns service status and model availability

Pain Assessment (Vision/ML)
- `POST /api/predict` — Heuristic fallback using Haar cascade and image stats
- `POST /api/predict-eld` — Advanced ELD model (48 landmarks) when available

See detailed ELD docs in `eld/README_ELD.md`.

## Quick Test (without auth)

```bash
curl http://localhost:8000/health
```

Expect a JSON payload with `status`, `eld_model_available`, and `torch_available`.

## Security Notes

- Passwords are hashed with bcrypt
- JWT tokens for auth (`Authorization: Bearer <token>`)
- CORS is enabled for app access; restrict origins for production
- Input validation is enforced with Pydantic v2 models

## Production Tips

- Set strong `SECRET_KEY` and secure SMTP credentials
- Restrict `allow_origins` in CORS
- Serve behind a proper ASGI server/reverse proxy (e.g., `uvicorn` + Nginx)
- Configure persistent storage for `uploads/`
- Monitor `/health` and add probes

## How to Check This System in GitHub

If you cloned from GitHub, you can verify the remote and browse the repo:

1) Verify remotes locally
```powershell
git remote -v
```

2) Open the repository in your browser
- Use the origin URL from the command above, or navigate to your project’s GitHub page.
- Key areas to check:
  - Code: `backend-python/main.py`, `backend-python/requirements.txt`, `backend-python/eld/`
  - Docs: `backend-python/README.md`, `backend-python/eld/README_ELD.md`
  - Releases/Tags: for versioned builds
  - Branches/PRs: review ongoing work
  - Actions: CI workflows and status (if configured)

3) Review CI/CD (optional)
- Go to the GitHub repository → Actions tab to check build/test status.

4) Open issues or PRs
- Use the Issues tab to report bugs or request features
- Use Pull Requests to propose changes and request review

## Frontend

The mobile frontend (Expo/React Native) lives under `frontend/`. See its `README` and `package.json` for run scripts. The backend exposes endpoints consumed by the app screens such as authentication, dashboard, pet management, medical records, vaccination records, and pain assessment.

## License

Part of the Pawthos project. See repository-level license terms.

