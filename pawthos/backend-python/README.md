# Pawthos Python Backend API

FastAPI-based backend for the Pawthos pet management application.

## Features

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - Python SQL toolkit and Object-Relational Mapping
- **PostgreSQL** - Database integration
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Secure password storage with bcrypt
- **CORS Support** - Cross-origin requests for mobile app

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the `.env` file and update with your database credentials:

```bash
cp .env.example .env
```

### 3. Database Setup

Make sure PostgreSQL is running and the `cityvet_db` database exists.

### 4. Run the Server

**Development:**
```bash
python main.py
```

**Or using uvicorn directly:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **API:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs
- **OpenAPI Schema:** http://localhost:8000/openapi.json

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Health Check
- `GET /health` - API health status

## API Documentation

FastAPI automatically generates interactive API documentation available at:
http://localhost:8000/docs

## Database Models

### User
- id, username, name, email, password_hash
- phone_number, address, is_confirmed
- otp_code, otp_expires_at, created_at

### Pet
- id, user_id, name, breed, age, species
- weight, color, medical_history, vaccinations
- created_at

### Appointment
- id, pet_id, user_id, type, date, time
- veterinarian, notes, location, status
- created_at

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS enabled for mobile app access
- Input validation with Pydantic models

## Development

The server automatically reloads when code changes are detected in development mode.

For production deployment, use a production WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```
