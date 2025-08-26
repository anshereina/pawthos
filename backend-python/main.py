import warnings
# Suppress deprecation warnings from torchvision
warnings.filterwarnings("ignore", category=UserWarning, module="torchvision")

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, func, ForeignKey, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone, date
from typing import Optional
from pydantic import BaseModel, field_validator
from typing import List
import os
import random
import string
from dotenv import load_dotenv
import re
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from PIL import ImageOps, ExifTags
try:
    import torch
    import torch.nn as nn
    from torchvision import models, transforms
    TORCH_AVAILABLE = True
except Exception:
    TORCH_AVAILABLE = False
# import torch
# import torch.nn as nn
# from torchvision import models, transforms
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
import logging
logging.basicConfig(level=logging.INFO)

# SMS support removed - using email OTP only
TWILIO_AVAILABLE = False

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:pawthos@localhost/cityvet_db')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "pawthos_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv('SMTP_USER'),
    MAIL_PASSWORD=os.getenv('SMTP_PASS'),
    MAIL_FROM=os.getenv('SMTP_USER'),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# SMS configuration removed - using email OTP only
twilio_client = None
TWILIO_PHONE_NUMBER = None

# FastAPI app
app = FastAPI(title="Pawthos API", description="Pet management system API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount static files for serving uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Lightweight AI prediction setup (OpenCV Haar cascade only)
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Prefer models/ location, fallback to legacy
_HAAR_CASCADE_CANDIDATES = [
    os.path.join(_BASE_DIR, "models", "haarcascade_frontalcatface_extended.xml"),
    os.path.join(_BASE_DIR, "haarcascade_frontalcatface_extended.xml"),
]
_HAAR_CASCADE_PATH = next((p for p in _HAAR_CASCADE_CANDIDATES if os.path.exists(p)), None)
try:
    _CAT_FACE_CASCADE = cv2.CascadeClassifier(_HAAR_CASCADE_PATH) if _HAAR_CASCADE_PATH else None
except Exception as _e:
    _CAT_FACE_CASCADE = None
# Add human face cascade for rejection of non-cat images
try:
    _HUMAN_FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
except Exception:
    _HUMAN_FACE_CASCADE = None
# Add eye cascades for eye-position verification
try:
    _EYE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    _EYEGLASS_EYE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml')
except Exception:
    _EYE_CASCADE = None
    _EYEGLASS_EYE_CASCADE = None

# Strict mode enabled to use tighter species gates
_ELD_STRICT = True
_MIN_CONFIDENCE = 0.0

# Import ELD model
try:
    from eld.eld_model import FelinePainAssessmentELD
    ELD_AVAILABLE = True
    logging.info("ELD model imported successfully")
except ImportError as e:
    ELD_AVAILABLE = False
    logging.warning(f"ELD model not available: {e}")

# Initialize ELD model
eld_model = None
if ELD_AVAILABLE:
    try:
        eld_model = FelinePainAssessmentELD()
        logging.info("ELD model initialized successfully")
    except Exception as e:
        logging.error(f"Failed to initialize ELD model: {e}")
        eld_model = None

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)  # Add photo URL column
    is_confirmed = Column(Integer, default=0)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    reset_token = Column(String, nullable=True)  # Password reset token
    reset_token_expiry = Column(DateTime, nullable=True)  # Password reset token expiry
    created_at = Column(DateTime, default=datetime.utcnow)

class Pet(Base):
    __tablename__ = "pets"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(String, nullable=False)  # Character varying field
    name = Column(String, nullable=False)
    owner_name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=True)  # Date field
    color = Column(String, nullable=True)
    breed = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    reproductive_status = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)  # Add photo URL column
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=True)
    user_id = Column(Integer, nullable=True)
    type = Column(String, nullable=False)
    date = Column(String, nullable=False)  # Keep as string for compatibility
    time = Column(String, nullable=False)  # Keep as string for compatibility
    veterinarian = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

class PainAssessment(Base):
    __tablename__ = "pain_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    # Optional descriptive fields; DB may already have these
    pet_name = Column(String, nullable=True)
    pet_type = Column(String, nullable=True)
    assessment_date = Column(DateTime, default=datetime.utcnow)
    pain_score = Column(Integer, nullable=False)
    pain_level = Column(String, nullable=True)  # Legacy field - keep for compatibility
    notes = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    # Question answers from Integration flow
    basic_answers = Column(Text, nullable=True)  # JSON string of basic question answers
    assessment_answers = Column(Text, nullable=True)  # JSON string of detailed assessment answers
    created_at = Column(DateTime, default=datetime.utcnow)

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    record_type = Column(String, nullable=True)  # vaccination, treatment, etc.
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False)
    veterinarian = Column(String, nullable=True)
    clinic = Column(String, nullable=True)
    next_due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    vaccine_name = Column(String, nullable=False)
    date_given = Column(DateTime, nullable=True)
    next_due_date = Column(DateTime, nullable=True)
    veterinarian = Column(String, nullable=True)
    clinic = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

class VaccinationEvent(Base):
    __tablename__ = "vaccination_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_title = Column(String, nullable=False)
    barangay = Column(String, nullable=False)
    event_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="Scheduled")  # Scheduled, Completed, Cancelled
    # description = Column(Text, nullable=True)  # Removed - doesn't exist in your table
    # created_at = Column(DateTime, default=datetime.utcnow)  # Removed - doesn't exist in your table
    # updated_at = Column(DateTime, nullable=True)  # Removed - doesn't exist in your table

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure legacy databases have required columns
def _ensure_pain_assessments_columns() -> None:
    try:
        with engine.begin() as connection:
            # Add new columns if they don't exist
            connection.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS pain_score INTEGER NULL"))
            connection.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS notes TEXT NULL"))
            connection.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL"))
            connection.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS pet_name VARCHAR NULL"))
            connection.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS pet_type VARCHAR NULL"))
            connection.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS image_url VARCHAR NULL"))
            connection.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS basic_answers TEXT NULL"))
            connection.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS assessment_answers TEXT NULL"))
            
            # Make pain_level nullable if it exists and is not nullable
            try:
                connection.execute(text("ALTER TABLE pain_assessments ALTER COLUMN pain_level DROP NOT NULL"))
            except Exception:
                # Column might not exist or already be nullable
                pass
    except Exception as e:
        print(f"Schema check failed (pain_assessments): {e}")

_ensure_pain_assessments_columns()

# Debug: Check if columns exist (commented out to reduce startup noise)
# def _debug_check_columns():
#     try:
#         with engine.begin() as connection:
#             result = connection.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'pain_assessments'"))
#             columns = [row[0] for row in result]
#             print("=== DATABASE COLUMNS DEBUG ===")
#             print(f"Available columns in pain_assessments: {columns}")
#             print(f"Has basic_answers: {'basic_answers' in columns}")
#             print(f"Has assessment_answers: {'assessment_answers' in columns}")
#     except Exception as e:
#         print(f"Column check failed: {e}")

# _debug_check_columns()

def _ensure_medical_records_columns() -> None:
    try:
        # Use a transactional connection so DDL is committed
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS record_type VARCHAR NULL"))
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS title VARCHAR NULL"))
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS description TEXT NULL"))
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS date TIMESTAMP NULL"))
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS veterinarian VARCHAR NULL"))
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS clinic VARCHAR NULL"))
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS next_due_date TIMESTAMP NULL"))
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL"))
            connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL"))
    except Exception as e:
        # Log and continue; avoid crashing app on startup
        print(f"Schema check failed (medical_records): {e}")

_ensure_medical_records_columns()

def _ensure_vaccination_records_columns() -> None:
    try:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS date_given TIMESTAMP NULL"))
            connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS next_due_date TIMESTAMP NULL"))
            connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS veterinarian VARCHAR NULL"))
            connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS clinic VARCHAR NULL"))
            connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS notes TEXT NULL"))
            connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL"))
            connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL"))
    except Exception as e:
        print(f"Schema check failed (vaccination_records): {e}")

_ensure_vaccination_records_columns()

def _ensure_user_photo_url_column() -> None:
    try:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR NULL"))
    except Exception as e:
        print(f"Schema check failed (users photo_url): {e}")

_ensure_user_photo_url_column()

# Removed _ensure_vaccination_events_table() function since you already have the table

# Pydantic models for request/response
class UserCreate(BaseModel):
    name: Optional[str] = None
    email: str
    password: str
    phone_number: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: Optional[str]
    email: str
    phone_number: Optional[str]
    address: Optional[str]
    photo_url: Optional[str]
    is_confirmed: int

    class Config:
        from_attributes = True

class PetCreate(BaseModel):
    name: str
    owner_name: str
    species: str
    date_of_birth: Optional[str] = None
    color: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    reproductive_status: Optional[str] = None
    photo_url: Optional[str] = None

class PetUpdate(BaseModel):
    name: Optional[str] = None
    owner_name: Optional[str] = None
    species: Optional[str] = None
    date_of_birth: Optional[str] = None
    color: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    reproductive_status: Optional[str] = None
    photo_url: Optional[str] = None

class PetResponse(BaseModel):
    id: int
    pet_id: str
    name: str
    owner_name: str
    species: str
    date_of_birth: Optional[str]
    color: Optional[str]
    breed: Optional[str]
    gender: Optional[str]
    reproductive_status: Optional[str]
    photo_url: Optional[str]
    user_id: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def ensure_date_of_birth_is_string(cls, value):
        if value is None:
            return None
        # Handle datetime.date or datetime.datetime
        if hasattr(value, "isoformat"):
            try:
                return value.isoformat()
            except Exception:
                pass
        return str(value)

class AppointmentCreate(BaseModel):
    pet_id: Optional[int] = None
    type: str
    date: str
    time: str
    veterinarian: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    pet_id: Optional[int]
    user_id: Optional[int]
    type: str
    date: str
    time: str
    veterinarian: Optional[str]
    notes: Optional[str]
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class DashboardUser(BaseModel):
    id: int
    name: Optional[str]
    email: str
    phoneNumber: Optional[str]
    address: Optional[str]
    createdAt: datetime

class DashboardResponse(BaseModel):
    user: DashboardUser
    pets_count: int
    upcoming_appointments: List[AppointmentResponse]
    recent_pets: List[PetResponse]

class PainAssessmentCreate(BaseModel):
    pet_id: int
    pain_score: int
    pain_level: Optional[str] = None  # Legacy field for compatibility
    notes: Optional[str] = None
    pet_name: Optional[str] = None
    pet_type: Optional[str] = None
    image_url: Optional[str] = None
    basic_answers: Optional[str] = None  # JSON string of basic question answers
    assessment_answers: Optional[str] = None  # JSON string of detailed assessment answers

class PainAssessmentResponse(BaseModel):
    id: int
    pet_id: int
    user_id: int
    pet_name: Optional[str]
    pet_type: Optional[str]
    assessment_date: datetime
    pain_score: int
    pain_level: Optional[str]  # Include legacy field
    notes: Optional[str]
    image_url: Optional[str]
    basic_answers: Optional[str]  # Include question answers
    assessment_answers: Optional[str]  # Include detailed answers
    created_at: datetime

    class Config:
        from_attributes = True

class MedicalRecordCreate(BaseModel):
    pet_id: int
    record_type: str
    title: str
    description: Optional[str] = None
    date: datetime
    veterinarian: Optional[str] = None
    clinic: Optional[str] = None
    next_due_date: Optional[datetime] = None

class MedicalRecordResponse(BaseModel):
    id: int
    pet_id: int
    user_id: int
    record_type: Optional[str]
    title: Optional[str]
    description: Optional[str]
    date: Optional[datetime]
    veterinarian: Optional[str]
    clinic: Optional[str]
    next_due_date: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class VaccinationRecordCreate(BaseModel):
    pet_id: int
    vaccine_name: str
    date_given: Optional[datetime]
    next_due_date: Optional[datetime] = None
    veterinarian: Optional[str] = None
    clinic: Optional[str] = None
    notes: Optional[str] = None

class VaccinationRecordResponse(BaseModel):
    id: int
    pet_id: int
    user_id: int
    vaccine_name: str
    date_given: Optional[datetime]
    next_due_date: Optional[datetime]
    veterinarian: Optional[str]
    clinic: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class VaccinationEventResponse(BaseModel):
    id: int
    event_title: str
    barangay: str
    event_date: datetime
    status: str
    # description: Optional[str]  # Removed - doesn't exist in your table
    # created_at: Optional[datetime]  # Removed - doesn't exist in your table
    # updated_at: Optional[datetime]  # Removed - doesn't exist in your table

    class Config:
        from_attributes = True

# --- Appointment Status Update Model ---
class AppointmentStatusUpdate(BaseModel):
    status: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Request models for auth actions
class VerifyOTPRequest(BaseModel):
    contactInfo: str
    otp_code: str
    otpMethod: Optional[str] = 'email'

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# Utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

async def send_otp_email(email: str, otp: str):
    try:
        message = MessageSchema(
            subject="Pawthos - Email Verification",
            recipients=[email],
            body=f"Your verification code is: {otp}",
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# SMS function removed - using email OTP only
def send_otp_sms(phone_number: str, otp: str):
    print("SMS OTP not available - using email OTP only")
    return False

# API Endpoints

def generate_species_pet_id(db: Session, species: str) -> str:
    species_lower = (species or "").lower()
    prefix = "PET-D-" if species_lower in ("dog", "canine") else "PET-C-"
    # Find max existing sequence for the prefix
    existing_ids = db.query(Pet.pet_id).filter(Pet.pet_id.like(f"{prefix}%")).all()
    max_seq = 0
    pattern = re.compile(rf"^{re.escape(prefix)}(\d+)$")
    for (pid,) in existing_ids:
        if not pid:
            continue
        m = pattern.match(pid)
        if m:
            try:
                num = int(m.group(1))
                if num > max_seq:
                    max_seq = num
            except Exception:
                continue
    next_seq = max_seq + 1
    pet_id = f"{prefix}{next_seq}"
    return pet_id[:20]

def _serialize_date_like(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        try:
            return value.date().isoformat()
        except Exception:
            return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value)

def _to_appointment_response(appt: Appointment) -> AppointmentResponse:
    return AppointmentResponse(
        id=appt.id,
        pet_id=appt.pet_id,
        user_id=appt.user_id,
        type=appt.type,
        date=str(appt.date) if appt.date is not None else "",
        time=str(appt.time) if appt.time is not None else "",
        veterinarian=appt.veterinarian,
        notes=appt.notes,
        status=appt.status,
        created_at=appt.created_at,
        updated_at=appt.updated_at,
    )

@app.post("/api/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = pwd_context.hash(user.password)
    
    # Generate OTP
    otp = generate_otp()
    otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Create user
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        phone_number=user.phone_number,
        address=user.address,
        otp_code=otp,
        otp_expires_at=otp_expires
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send OTP via email
    if user.email:
        await send_otp_email(user.email, otp)
    
    # SMS OTP removed - using email OTP only
    
    return db_user

@app.post("/api/verify-otp")
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    # Only email OTP supported currently
    email = payload.contactInfo
    otp = payload.otp_code
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_confirmed:
        raise HTTPException(status_code=400, detail="User already verified")
    
    if not user.otp_code or user.otp_code != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if user.otp_expires_at:
        expires_raw = user.otp_expires_at
        now_utc = datetime.now(timezone.utc)
        if expires_raw.tzinfo is None:
            expires_utc = expires_raw.replace(tzinfo=timezone.utc)
        else:
            expires_utc = expires_raw.astimezone(timezone.utc)
        # Debug log for diagnosis if still failing
        try:
            print(f"OTP verify debug: expires={expires_utc.isoformat()} now={now_utc.isoformat()}")
        except Exception:
            pass
        if expires_utc < now_utc:
            raise HTTPException(status_code=400, detail="OTP expired")
    
    # Mark user as confirmed
    user.is_confirmed = 1
    user.otp_code = None
    user.otp_expires_at = None
    
    db.commit()
    
    return {"message": "Email verified successfully"}

@app.post("/api/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not pwd_context.verify(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_confirmed:
        raise HTTPException(status_code=400, detail="Please verify your email first")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "name": user.name,
    }

@app.get("/api/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None

@app.put("/api/update-profile", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update only the fields that are provided
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        # Check if email is already taken by another user
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email
    if user_update.phone_number is not None:
        current_user.phone_number = user_update.phone_number
    if user_update.address is not None:
        current_user.address = user_update.address
    if user_update.photo_url is not None:
        current_user.photo_url = user_update.photo_url
    
    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")

@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Pets owned by the current user
        pets_query = db.query(Pet).filter(Pet.user_id == current_user.id)
        pets_count = pets_query.count()
        recent_pets = pets_query.order_by(Pet.created_at.desc()).limit(3).all()

        # Upcoming appointments for the current user
        upcoming_appointments = (
            db.query(Appointment)
            .filter(Appointment.user_id == current_user.id, Appointment.status == "scheduled")
            .order_by(Appointment.date.asc())
            .limit(5)
            .all()
        )

        dashboard_user = DashboardUser(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            phoneNumber=current_user.phone_number,
            address=current_user.address,
            createdAt=current_user.created_at,
        )

        # Map ORM objects to response models
        recent_pets_response = [
            PetResponse(
                id=pet.id,
                pet_id=pet.pet_id,
                name=pet.name,
                owner_name=pet.owner_name,
                species=pet.species,
                date_of_birth=_serialize_date_like(pet.date_of_birth),
                color=pet.color,
                breed=pet.breed,
                gender=pet.gender,
                reproductive_status=pet.reproductive_status,
                photo_url=pet.photo_url,
                user_id=getattr(pet, "user_id", None),
                created_at=pet.created_at,
                updated_at=pet.updated_at,
            )
            for pet in recent_pets
        ]

        upcoming_appointments_response = [
            AppointmentResponse(
                id=appt.id,
                pet_id=appt.pet_id,
                user_id=appt.user_id,
                type=appt.type,
                date=str(appt.date) if appt.date else "",
                time=str(appt.time) if appt.time else "",
                veterinarian=appt.veterinarian,
                notes=appt.notes,
                status=appt.status,
                created_at=appt.created_at,
                updated_at=appt.updated_at,
            )
            for appt in upcoming_appointments
        ]

        return DashboardResponse(
            user=dashboard_user,
            pets_count=pets_count,
            upcoming_appointments=upcoming_appointments_response,
            recent_pets=recent_pets_response,
        )
    except Exception as e:
        print(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail="Server error retrieving dashboard data")

@app.post("/api/pets", response_model=PetResponse)
def create_pet(pet: PetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Generate species-based sequential pet ID
    pet_id = generate_species_pet_id(db, pet.species)
    
    db_pet = Pet(
        pet_id=pet_id,
        name=pet.name,
        owner_name=pet.owner_name,
        species=pet.species,
        date_of_birth=pet.date_of_birth,
        color=pet.color,
        breed=pet.breed,
        gender=pet.gender,
        reproductive_status=pet.reproductive_status,
        photo_url=pet.photo_url,
        user_id=current_user.id
    )
    
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@app.get("/api/pets", response_model=List[PetResponse])
def get_pets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pets = db.query(Pet).filter(Pet.user_id == current_user.id).all()
    return pets

@app.get("/api/pets/{pet_id}", response_model=PetResponse)
def get_pet(pet_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.user_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@app.put("/api/pets/{pet_id}", response_model=PetResponse)
def update_pet(pet_id: int, pet: PetUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_pet = db.query(Pet).filter(Pet.id == pet_id, Pet.user_id == current_user.id).first()
    if not db_pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    # Only update fields that are provided (not None)
    pet_data = pet.dict(exclude_unset=True)
    for field, value in pet_data.items():
        if value is not None:
            setattr(db_pet, field, value)
    
    db_pet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_pet)
    return db_pet

@app.delete("/api/pets/{pet_id}")
def delete_pet(pet_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.user_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    db.delete(pet)
    db.commit()
    return {"message": "Pet deleted successfully"}

@app.post("/api/appointments", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_appointment = Appointment(
        pet_id=appointment.pet_id,
        user_id=current_user.id,
        type=appointment.type,
        date=appointment.date,
        time=appointment.time,
        veterinarian=appointment.veterinarian,
        notes=appointment.notes
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return _to_appointment_response(db_appointment)

@app.get("/api/appointments", response_model=List[AppointmentResponse])
def get_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(Appointment.user_id == current_user.id).all()
    return [_to_appointment_response(a) for a in appointments]

@app.get("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.user_id == current_user.id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return _to_appointment_response(appointment)

@app.put("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: int, appointment: AppointmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.user_id == current_user.id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    for field, value in appointment.dict().items():
        setattr(db_appointment, field, value)
    
    db_appointment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_appointment)
    return _to_appointment_response(db_appointment)

@app.patch("/api/appointments/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(appointment_id: int, update: AppointmentStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.user_id == current_user.id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db_appointment.status = update.status
    db_appointment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_appointment)
    return _to_appointment_response(db_appointment)

@app.delete("/api/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.user_id == current_user.id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}

@app.post("/api/pain-assessments", response_model=PainAssessmentResponse)
def create_pain_assessment(assessment: PainAssessmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Debug: Log what's being received
    print("=== BACKEND RECEIVED ASSESSMENT ===")
    print(f"Assessment data: {assessment}")
    print(f"Basic answers: {assessment.basic_answers}")
    print(f"Assessment answers: {assessment.assessment_answers}")
    
    db_assessment = PainAssessment(
        pet_id=assessment.pet_id,
        user_id=current_user.id,
        pet_name=assessment.pet_name or "Pet",
        pet_type=assessment.pet_type,
        pain_score=assessment.pain_score,
        pain_level=assessment.pain_level,  # Include legacy field
        notes=assessment.notes,
        image_url=assessment.image_url,
        basic_answers=assessment.basic_answers,  # Include question answers
        assessment_answers=assessment.assessment_answers  # Include detailed answers
    )
    
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    # Debug: Log what was actually saved to database
    print("=== DATABASE SAVE DEBUG ===")
    print(f"Saved assessment ID: {db_assessment.id}")
    print(f"Saved basic_answers: {db_assessment.basic_answers}")
    print(f"Saved assessment_answers: {db_assessment.assessment_answers}")
    
    return db_assessment

@app.get("/api/pain-assessments", response_model=List[PainAssessmentResponse])
def get_pain_assessments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessments = db.query(PainAssessment).filter(PainAssessment.user_id == current_user.id).all()
    return assessments

@app.get("/api/pain-assessments/{assessment_id}", response_model=PainAssessmentResponse)
def get_pain_assessment(assessment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = db.query(PainAssessment).filter(PainAssessment.id == assessment_id, PainAssessment.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Pain assessment not found")
    return assessment

@app.post("/api/medical-records", response_model=MedicalRecordResponse)
def create_medical_record(record: MedicalRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_record = MedicalRecord(
        pet_id=record.pet_id,
        user_id=current_user.id,
        record_type=record.record_type,
        title=record.title,
        description=record.description,
        date=record.date,
        veterinarian=record.veterinarian,
        clinic=record.clinic,
        next_due_date=record.next_due_date
    )
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/api/medical-records", response_model=List[MedicalRecordResponse])
def get_medical_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id).all()
    return records

@app.get("/api/medical-records/pet/{pet_id}", response_model=List[MedicalRecordResponse])
def get_medical_records_by_pet(pet_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = (
        db.query(MedicalRecord)
        .filter(
            MedicalRecord.user_id == current_user.id,
            MedicalRecord.pet_id == pet_id,
        )
        .order_by(MedicalRecord.date.desc())
        .all()
    )
    return records

@app.get("/api/medical-records/{record_id}", response_model=MedicalRecordResponse)
def get_medical_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id, MedicalRecord.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record

@app.put("/api/medical-records/{record_id}", response_model=MedicalRecordResponse)
def update_medical_record(record_id: int, record: MedicalRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id, MedicalRecord.user_id == current_user.id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    for field, value in record.dict().items():
        setattr(db_record, field, value)
    
    db_record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_record)
    return db_record

@app.delete("/api/medical-records/{record_id}")
def delete_medical_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id, MedicalRecord.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    db.delete(record)
    db.commit()
    return {"message": "Medical record deleted successfully"}

@app.post("/api/vaccination-records", response_model=VaccinationRecordResponse)
def create_vaccination_record(record: VaccinationRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_record = VaccinationRecord(
        pet_id=record.pet_id,
        user_id=current_user.id,
        vaccine_name=record.vaccine_name,
        date_given=record.date_given,
        next_due_date=record.next_due_date,
        veterinarian=record.veterinarian,
        clinic=record.clinic,
        notes=record.notes
    )
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/api/vaccination-records", response_model=List[VaccinationRecordResponse])
def get_vaccination_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(VaccinationRecord).filter(VaccinationRecord.user_id == current_user.id).all()
    return records

@app.get("/api/vaccination-records/{record_id}", response_model=VaccinationRecordResponse)
def get_vaccination_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(VaccinationRecord).filter(VaccinationRecord.id == record_id, VaccinationRecord.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    return record

@app.put("/api/vaccination-records/{record_id}", response_model=VaccinationRecordResponse)
def update_vaccination_record(record_id: int, record: VaccinationRecordCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_record = db.query(VaccinationRecord).filter(VaccinationRecord.id == record_id, VaccinationRecord.user_id == current_user.id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    
    for field, value in record.dict().items():
        setattr(db_record, field, value)
    
    db_record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_record)
    return db_record

@app.delete("/api/vaccination-records/{record_id}")
def delete_vaccination_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(VaccinationRecord).filter(VaccinationRecord.id == record_id, VaccinationRecord.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    
    db.delete(record)
    db.commit()
    return {"message": "Vaccination record deleted successfully"}

@app.post("/api/upload-pet-photo")
def upload_pet_photo(pet_id: int, file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify pet belongs to user
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.user_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    filename = f"pet_{pet_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = os.path.join("uploads", filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    
    # Update pet photo URL
    pet.photo_url = f"/uploads/{filename}"
    pet.updated_at = datetime.utcnow()
    db.commit()
    
    return {"photo_url": pet.photo_url}

# AI Model functionality temporarily disabled due to PyTorch installation issues
class CatPainModelService:
    _instance = None

    def __init__(self):
        if not TORCH_AVAILABLE:
            raise RuntimeError("Torch is not available")
        base_dir = os.path.dirname(os.path.abspath(__file__))
        # Update paths to models/ with fallback
        cascade_candidates = [
            os.path.join(base_dir, "models", "haarcascade_frontalcatface_extended.xml"),
            os.path.join(base_dir, "haarcascade_frontalcatface_extended.xml"),
        ]
        cascade_path = next((p for p in cascade_candidates if os.path.exists(p)), None)
        model_candidates = [
            os.path.join(base_dir, "models", "best_efficientnet_model.pth"),
            os.path.join(base_dir, "best_efficientnet_model.pth"),
        ]
        model_path = next((p for p in model_candidates if os.path.exists(p)), None)

        self.face_cascade = cv2.CascadeClassifier(cascade_path) if cascade_path else cv2.CascadeClassifier()
        if self.face_cascade.empty():
            raise RuntimeError("Failed to load Haar cascade for cat face detection")

        self.device = torch.device("cpu")
        self.model, self.class_names = self._load_model(model_path)
        self.model.eval()
        self.model.to(self.device)

        # Standard ImageNet normalization
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    @staticmethod
    def get():
        if CatPainModelService._instance is None:
            CatPainModelService._instance = CatPainModelService()
        return CatPainModelService._instance

    def _infer_num_classes(self, state_dict: dict) -> int:
        # Try torchvision EfficientNet classifier key
        for key, tensor in state_dict.items():
            if hasattr(tensor, 'ndim') and tensor.ndim == 2:
                if str(key).endswith("classifier.1.weight") or str(key).endswith("_fc.weight"):
                    return int(tensor.shape[0])
        # Fallback: search any 2D last-layer-like weight
        candidates = [t for k, t in state_dict.items() if hasattr(t, 'ndim') and t.ndim == 2]
        if candidates:
            return int(candidates[0].shape[0])
        return 3

    def _load_model(self, model_path: str):
        # Load state dict (handles checkpoints saved as dicts or raw state_dict)
        state = torch.load(model_path, map_location="cpu")
        if isinstance(state, dict) and "state_dict" in state:
            state_dict = state["state_dict"]
        else:
            state_dict = state

        num_classes = self._infer_num_classes(state_dict)

        # Default labels based on common pain scales
        if num_classes == 3:
            class_names = ["No Pain", "Mild Pain", "Moderate Pain"]
        elif num_classes == 4:
            class_names = ["No Pain", "Mild Pain", "Moderate Pain", "Severe Pain"]
        elif num_classes == 5:
            class_names = ["No Pain", "Mild Pain", "Moderate Pain", "Severe Pain", "Worst Pain"]
        else:
            class_names = [f"Class {i}" for i in range(num_classes)]

        # Try torchvision EfficientNet-B0
        try:
            model = models.efficientnet_b0(weights=None)
            in_features = model.classifier[1].in_features
            model.classifier[1] = nn.Linear(in_features, num_classes)
            model.load_state_dict(state_dict, strict=False)
            return model, class_names
        except Exception as e:
            print(f"Torchvision EfficientNet load failed: {e}")

        # Fallback to efficientnet_pytorch
        try:
            from efficientnet_pytorch import EfficientNet
            model = EfficientNet.from_name('efficientnet-b0', num_classes=num_classes)
            model.load_state_dict(state_dict, strict=False)
            return model, class_names
        except Exception as e:
            print(f"efficientnet_pytorch load failed: {e}")
            raise RuntimeError("Failed to load EfficientNet model with given weights")

    def detect_and_crop_face(self, pil_image: Image.Image) -> Image.Image:
        # Convert PIL to OpenCV BGR
        img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
        if len(faces) == 0:
            raise HTTPException(status_code=400, detail="No cat face detected. Please upload a clear cat face image.")
        # Choose largest face
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
        # Add padding around face
        pad = int(0.2 * max(w, h))
        x1 = max(x - pad, 0)
        y1 = max(y - pad, 0)
        x2 = min(x + w + pad, img.shape[1])
        y2 = min(y + h + pad, img.shape[0])
        crop = img[y1:y2, x1:x2]
        crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
        return Image.fromarray(crop_rgb)

    def predict_pain(self, image_bytes: bytes) -> str:
        pil = Image.open(BytesIO(image_bytes)).convert('RGB')
        face_img = self.detect_and_crop_face(pil)
        tensor = self.transform(face_img).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            if isinstance(logits, (list, tuple)):
                logits = logits[0]
            probs = torch.softmax(logits, dim=1)
            pred = int(torch.argmax(probs, dim=1).item())
        return self.class_names[pred]

@app.post("/api/predict")
def predict(file: UploadFile = File(...)):
    """
    Prediction endpoint:
    - Prefer EfficientNet model inference (if torch + weights available)
    - Fallback to Haar-cascade heuristic when ML stack is unavailable
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        image_bytes = file.file.read()

        # Try model-based inference first
        if TORCH_AVAILABLE:
            try:
                service = CatPainModelService.get()
                label = service.predict_pain(image_bytes)
                # Map labels to UI levels
                normalized = str(label).lower()
                if "no pain" in normalized or "level 0" in normalized:
                    return {"pain_level": "Level 0 (No Pain)"}
                if "mild" in normalized or "level 1" in normalized:
                    return {"pain_level": "Level 1 (Mild Pain)"}
                # any moderate/severe or higher -> level 2
                return {"pain_level": "Level 2 (Moderate/Severe Pain)"}
            except Exception as model_error:
                print(f"Model inference unavailable, falling back to heuristic: {model_error}")

        # Fallback: Haar heuristic
        if _CAT_FACE_CASCADE is None or _CAT_FACE_CASCADE.empty():
            raise HTTPException(status_code=500, detail="AI model not initialized on server")

        pil = Image.open(BytesIO(image_bytes)).convert('RGB')
        img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        faces = _CAT_FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
        if len(faces) == 0:
            raise HTTPException(status_code=400, detail="No cat face detected in the image")

        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
        face = gray[y:y+h, x:x+w]
        img_area = float(gray.shape[0] * gray.shape[1]) or 1.0
        face_area_ratio = float(w * h) / img_area
        mean_intensity = float(np.mean(face)) if face.size > 0 else 0.0

        if face_area_ratio >= 0.12 and mean_intensity >= 110:
            return {"pain_level": "Level 0 (No Pain)"}
        if face_area_ratio >= 0.06 and mean_intensity >= 90:
            return {"pain_level": "Level 1 (Mild Pain)"}
        return {"pain_level": "Level 2 (Moderate/Severe Pain)"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Predict error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image")

# Enhanced prediction endpoint with ELD
@app.post("/api/predict-eld")
async def predict_with_eld(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """
    Enhanced prediction endpoint using Ensemble Landmark Detector (ELD) with 48 landmarks
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # --- Robust image load with EXIF orientation fix ---
        image_bytes = file.file.read()
        try:
            pil_image = Image.open(BytesIO(image_bytes)).convert('RGB')
            # Correct EXIF orientation if present
            try:
                pil_image = ImageOps.exif_transpose(pil_image)
            except Exception:
                pass
            # Convert to OpenCV BGR
            image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        except Exception:
            # Fallback to imdecode if PIL load fails
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        # --- Light normalization (CLAHE on luminance) to help detection ---
        try:
            ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
            y, cr, cb = cv2.split(ycrcb)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            y_eq = clahe.apply(y)
            ycrcb_eq = cv2.merge((y_eq, cr, cb))
            image = cv2.cvtColor(ycrcb_eq, cv2.COLOR_YCrCb2BGR)
        except Exception:
            pass

        # Pre-crop face region using Haar before ELD to improve landmarking
        face_roi = None
        
        # Initial cat face detection and validation
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces_pre = _CAT_FACE_CASCADE.detectMultiScale(
            gray,
            scaleFactor=1.05 if not _ELD_STRICT else 1.03,
            minNeighbors=4 if not _ELD_STRICT else 6,
            minSize=(64, 64) if not _ELD_STRICT else (96, 96)
        ) if (_CAT_FACE_CASCADE is not None and not _CAT_FACE_CASCADE.empty()) else []
        
        # Strict species gate: require a cat face to proceed
        if len(faces_pre) == 0:
            raise HTTPException(status_code=400, detail="No Cat Face Detected\n\nPlease upload a clear photo of a cat's face for pain assessment.")
        
        # Multi-stage cat validation before proceeding to ELD
        x, y, w, h = max(faces_pre, key=lambda r: r[2] * r[3])
        # Face must be a reasonable size relative to image
        img_area = float(image.shape[0] * image.shape[1]) or 1.0
        face_area_ratio = float(w * h) / img_area
        # Tighten area bounds to block non-cats while allowing cats
        min_area = 0.04 if not _ELD_STRICT else 0.08
        max_area = 0.40 if not _ELD_STRICT else 0.30
        if face_area_ratio < min_area:
            logging.error(f"ELD_STRICT={_ELD_STRICT} face_area_ratio too small: {face_area_ratio:.4f}")
            raise HTTPException(status_code=400, detail="Cat face detected is too small for analysis. Please take a closer photo.")
        if face_area_ratio > max_area:
            logging.error(f"ELD_STRICT={_ELD_STRICT} face_area_ratio too large: {face_area_ratio:.4f}")
            raise HTTPException(status_code=400, detail="Cat face detected is too large (too close). Please include more of the face in the frame.")
        
        # Store face ROI for ELD processing
        face_roi = (x, y, w, h)
        
        try:
            
            # Stage 1: Whisker region validation (horizontal edges in lower face)
            try:
                roi_y1 = y + int(0.55 * h)
                roi_y2 = y + h
                roi_x1 = x + int(0.15 * w)
                roi_x2 = x + int(0.85 * w)
                roi_y1 = max(0, min(gray.shape[0], roi_y1))
                roi_y2 = max(0, min(gray.shape[0], roi_y2))
                roi_x1 = max(0, min(gray.shape[1], roi_x1))
                roi_x2 = max(0, min(gray.shape[1], roi_x2))
                whisker_region = gray[roi_y1:roi_y2, roi_x1:roi_x2]
                if whisker_region.size == 0:
                    raise HTTPException(status_code=400, detail="No Cat Face Detected\n\nPlease upload a clear photo of a cat's face for pain assessment.")
                sobelx = cv2.Sobel(whisker_region, cv2.CV_32F, 1, 0, ksize=3)
                edge_energy = float(np.mean(np.abs(sobelx)))
                # Tighten whisker threshold to block non-cats
                whisker_thresh = 20.0 if not _ELD_STRICT else 35.0
                if os.getenv('ELD_DEBUG', '0') == '1':
                    logging.error(f"ELD_DEBUG whisker_energy={edge_energy:.2f} thresh={whisker_thresh:.2f}")
                if edge_energy < whisker_thresh:
                    raise HTTPException(status_code=400, detail="No Cat Face Detected\n\nPlease upload a clear photo of a cat's face for pain assessment.")
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(status_code=400, detail="No cat face detected in the image")
            
            # Stage 2: Ear region validation (vertical edges in top corners)
            try:
                ear_y1 = y
                ear_y2 = y + int(0.4 * h)
                ear_y1 = max(0, min(gray.shape[0], ear_y1))
                ear_y2 = max(0, min(gray.shape[0], ear_y2))
                # Left ear region
                left_ear_x1 = x
                left_ear_x2 = x + int(0.3 * w)
                left_ear_x1 = max(0, min(gray.shape[1], left_ear_x1))
                left_ear_x2 = max(0, min(gray.shape[1], left_ear_x2))
                left_ear_region = gray[ear_y1:ear_y2, left_ear_x1:left_ear_x2]
                # Right ear region
                right_ear_x1 = x + int(0.7 * w)
                right_ear_x2 = x + w
                right_ear_x1 = max(0, min(gray.shape[1], right_ear_x1))
                right_ear_x2 = max(0, min(gray.shape[1], right_ear_x2))
                right_ear_region = gray[ear_y1:ear_y2, right_ear_x1:right_ear_x2]
                
                if left_ear_region.size > 0 and right_ear_region.size > 0:
                    sobely_left = cv2.Sobel(left_ear_region, cv2.CV_32F, 0, 1, ksize=3)
                    sobely_right = cv2.Sobel(right_ear_region, cv2.CV_32F, 0, 1, ksize=3)
                    left_ear_energy = float(np.mean(np.abs(sobely_left)))
                    right_ear_energy = float(np.mean(np.abs(sobely_right)))
                    ear_energy = left_ear_energy + right_ear_energy
                    # Tighten ear threshold to block non-cats
                    ear_thresh = 20.0 if not _ELD_STRICT else 35.0
                    if os.getenv('ELD_DEBUG', '0') == '1':
                        logging.error(f"ELD_DEBUG ear_energy={ear_energy:.2f} thresh={ear_thresh:.2f}")
                    if ear_energy < ear_thresh:
                        raise HTTPException(status_code=400, detail="No cat face detected in the image")
                else:
                    raise HTTPException(status_code=400, detail="No Cat Face Detected\n\nPlease upload a clear photo of a cat's face for pain assessment.")
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(status_code=400, detail="No cat face detected in the image")
            
            # Stage 3: Face aspect ratio validation (cats have roughly square faces in cascade)
            try:
                aspect_ratio = float(w) / float(h)
                # Tighten aspect ratio bounds to block non-cats
                min_ar = 0.80 if not _ELD_STRICT else 0.85
                max_ar = 1.25 if not _ELD_STRICT else 1.20
                if os.getenv('ELD_DEBUG', '0') == '1':
                    logging.error(f"ELD_DEBUG face_area_ratio={face_area_ratio:.4f} aspect_ratio={aspect_ratio:.3f}")
                if aspect_ratio < min_ar or aspect_ratio > max_ar:
                    raise HTTPException(status_code=400, detail="No Cat Face Detected\n\nPlease upload a clear photo of a cat's face for pain assessment.")
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(status_code=400, detail="No cat face detected in the image")
            
            # Stage 4: Human face rejection (if a strong human face overlaps the candidate)
            try:
                human_faces = _HUMAN_FACE_CASCADE.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
                ) if _HUMAN_FACE_CASCADE is not None and not _HUMAN_FACE_CASCADE.empty() else []
                for hx, hy, hw, hh in human_faces:
                    # Compute IoU between cat bbox and human bbox
                    ix1 = max(x, hx)
                    iy1 = max(y, hy)
                    ix2 = min(x + w, hx + hw)
                    iy2 = min(y + h, hy + hh)
                    inter_w = max(0, ix2 - ix1)
                    inter_h = max(0, iy2 - iy1)
                    inter = inter_w * inter_h
                    union = (w * h) + (hw * hh) - inter
                    iou = float(inter) / float(union) if union > 0 else 0.0
                    human_min_area = 0.06 if not _ELD_STRICT else 0.04
                    if iou >= 0.30 and (hw * hh) / img_area >= human_min_area:
                        raise HTTPException(status_code=400, detail="No cat face detected in the image")
            except HTTPException:
                raise
            except Exception:
                # If human cascade fails, continue (non-fatal), other gates already applied
                pass

            # Stage 5: Eye-position verification (reject lateral-eye species like rabbits)
            try:
                roi = gray[y:y+h, x:x+w]
                eyes = []
                if _EYE_CASCADE is not None and not _EYE_CASCADE.empty():
                    eyes.extend(_EYE_CASCADE.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=6, minSize=(int(0.08*w), int(0.08*h))))
                if _EYEGLASS_EYE_CASCADE is not None and not _EYEGLASS_EYE_CASCADE.empty():
                    eyes.extend(_EYEGLASS_EYE_CASCADE.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=6, minSize=(int(0.08*w), int(0.08*h))))
                # Keep unique by position
                unique = []
                for ex, ey, ew, eh in eyes:
                    if all(abs(ex - ux) > 5 or abs(ey - uy) > 5 for ux, uy, _, _ in unique):
                        unique.append((ex, ey, ew, eh))
                # Filter eyes to central 70% width and upper 60% height
                cx1 = int(0.15 * w)
                cx2 = int(0.85 * w)
                cy2 = int(0.60 * h)
                filtered = [(ex, ey, ew, eh) for (ex, ey, ew, eh) in unique if ex >= cx1 and (ex+ew) <= cx2 and (ey+eh) <= cy2]
                # Require at least 2 eyes and reasonable horizontal separation
                if len(filtered) < 2:
                    if _ELD_STRICT:
                        raise HTTPException(status_code=400, detail="No cat face detected in the image")
                else:
                    # sort by x, measure distance between two most central eyes
                    filtered.sort(key=lambda e: e[0])
                    # pick leftmost and rightmost
                    lx, ly, lw, lh = filtered[0]
                    rx, ry, rw, rh = filtered[-1]
                    inter_eye = (rx + rw/2) - (lx + lw/2)
                    if inter_eye < 0.25 * w and _ELD_STRICT:
                        raise HTTPException(status_code=400, detail="No cat face detected in the image")
            except HTTPException:
                raise
            except Exception:
                # Non-fatal; rely on earlier gates
                pass

            pad = int(0.2 * max(w, h))
            x1 = max(x - pad, 0)
            y1 = max(y - pad, 0)
            x2 = min(x + w + pad, image.shape[1])
            y2 = min(y + h + pad, image.shape[0])
            face_roi = image[y1:y2, x1:x2]
        except Exception:
            face_roi = None

        # Use ELD model if available
        if eld_model is not None:
            try:
                def run_assess(img_bgr):
                    return eld_model.assess_pain(img_bgr)

                # Prefer running on face ROI if available
                base_img = face_roi if face_roi is not None and face_roi.size > 0 else image
                result = run_assess(base_img)
                
                # Map ELD result to UI format
                pain_level = result.get('pain_level', 'Unknown')
                confidence = float(result.get('confidence', 0.0))
                landmarks_detected = int(result.get('landmarks_detected', 0))
                expected_landmarks = int(result.get('expected_landmarks', 48))

                # If landmarks are too few, retry with rotated variants (handle EXIF misses)
                if landmarks_detected < 10:
                    retries = []
                    try:
                        # 90 degrees CW
                        rot90 = cv2.rotate(base_img, cv2.ROTATE_90_CLOCKWISE)
                        retries.append(rot90)
                        # 90 degrees CCW
                        rot270 = cv2.rotate(base_img, cv2.ROTATE_90_COUNTERCLOCKWISE)
                        retries.append(rot270)
                        # 180 degrees
                        rot180 = cv2.rotate(base_img, cv2.ROTATE_180)
                        retries.append(rot180)
                    except Exception:
                        pass
                    for aug in retries:
                        try:
                            result_aug = run_assess(aug)
                            ld = int(result_aug.get('landmarks_detected', 0))
                            if ld >= landmarks_detected:
                                result = result_aug
                                landmarks_detected = ld
                                pain_level = result.get('pain_level', pain_level)
                                confidence = float(result.get('confidence', confidence))
                                expected_landmarks = int(result.get('expected_landmarks', expected_landmarks))
                            if landmarks_detected >= 10:
                                break
                        except Exception:
                            continue
                
                # If we still failed to detect landmarks, surface a clear error
                if landmarks_detected < 10:
                    # Optional debug save for analysis
                    if os.getenv('ELD_DEBUG', '0') == '1':
                        try:
                            os.makedirs('uploads/debug', exist_ok=True)
                            ts = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
                            cv2.imwrite(f"uploads/debug/eld_fail_{ts}.jpg", base_img)
                        except Exception:
                            pass
                    # Provide a more specific error if face was too small/large
                    try:
                        img_area2 = float(image.shape[0] * image.shape[1]) or 1.0
                        approx_ratio = float(w * h) / img_area2
                        if approx_ratio < 0.04:
                            raise HTTPException(status_code=400, detail="Cat face detected is too small for analysis. Please take a closer photo.")
                        if approx_ratio > 0.40:
                            raise HTTPException(status_code=400, detail="Cat face detected is too large (too close). Please include more of the face in the frame.")
                    except HTTPException:
                        raise
                    except Exception:
                        pass
                    raise HTTPException(status_code=400, detail="Insufficient landmarks detected for analysis. Please ensure the full face is clearly visible and well-lit.")
                


                # Convert to UI format - Map to 3 levels
                if "no pain" in pain_level.lower():
                    ui_pain_level = "Level 0 (No Pain)"
                elif "mild" in pain_level.lower():
                    ui_pain_level = "Level 1 (Mild Pain)"
                elif "moderate" in pain_level.lower():
                    ui_pain_level = "Level 1 (Moderate Pain)"
                elif "severe" in pain_level.lower():
                    ui_pain_level = "Level 2 (Severe Pain)"
                else:
                    ui_pain_level = "Level 1 (Moderate Pain)"
                
                # Clamp confidence to [0,1] and provide percentage for UI
                try:
                    if confidence < 0.0 or confidence > 1.0:
                        # If model returned logits-like value, normalize best-effort
                        confidence = max(0.0, min(1.0, confidence))
                except Exception:
                    confidence = 0.0
                confidence_percent = int(round(confidence * 100))

                # Confidence cutoff disabled; log for diagnostics only
                logging.info(f"ELD confidence check: confidence={confidence}")

                return {
                    "pain_level": ui_pain_level,
                    "confidence": confidence,
                    "confidence_percent": confidence_percent,
                    "model_type": "ELD (48 Landmarks)",
                    "landmarks_detected": landmarks_detected,
                    "expected_landmarks": expected_landmarks,
                    "features_extracted": len(result.get('features', {})),
                    "raw_prediction": result.get('prediction_raw', -1)
                }
                
            except HTTPException:
                # Propagate explicit HTTP errors (e.g., low confidence)
                raise
            except Exception as e:
                logging.error(f"ELD model error: {e}")
                # Fall back to original method
                pass
        
        # Fallback to original method if ELD fails: run tuned Haar detection directly here
        try:
            # In strict mode, do not fall back; return explicit error instead
            if _ELD_STRICT:
                raise HTTPException(status_code=400, detail="Could not detect sufficient feline landmarks. Please retake a clearer cat face photo.")
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = _CAT_FACE_CASCADE.detectMultiScale(
                gray, scaleFactor=1.05, minNeighbors=3, minSize=(48, 48)
            ) if (_CAT_FACE_CASCADE is not None and not _CAT_FACE_CASCADE.empty()) else []
            if len(faces) == 0:
                raise HTTPException(status_code=400, detail="No cat face detected in the image")

            x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
            face = gray[y:y+h, x:x+w]
            img_area = float(gray.shape[0] * gray.shape[1]) or 1.0
            face_area_ratio = float(w * h) / img_area
            mean_intensity = float(np.mean(face)) if face.size > 0 else 0.0

            if face_area_ratio < 0.04:
                raise HTTPException(status_code=400, detail="Cat face detected is too small for analysis. Please take a closer photo.")
            if face_area_ratio > 0.40:
                raise HTTPException(status_code=400, detail="Cat face detected is too large (too close). Please include more of the face in the frame.")

            if face_area_ratio >= 0.12 and mean_intensity >= 110:
                return {"pain_level": "Level 0 (No Pain)", "model_type": "Heuristic Fallback", "landmarks_detected": 0, "expected_landmarks": 48}
            if face_area_ratio >= 0.06 and mean_intensity >= 90:
                return {"pain_level": "Level 1 (Mild Pain)", "model_type": "Heuristic Fallback", "landmarks_detected": 0, "expected_landmarks": 48}
            return {"pain_level": "Level 2 (Moderate/Severe Pain)", "model_type": "Heuristic Fallback", "landmarks_detected": 0, "expected_landmarks": 48}
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Fallback detection error: {e}")
            raise HTTPException(status_code=500, detail="Failed to process image")
        
    except HTTPException as e:
        # Do not convert explicit HTTP errors into 500s
        raise e
    except Exception as e:
        logging.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

# Password reset endpoints
class ForgotPasswordRequest(BaseModel):
    email: str

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset for a user"""
    try:
        # Check if user exists
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            # Don't reveal if user exists or not for security
            return {"message": "If an account with this email exists, you will receive password reset instructions shortly."}
        
        # Generate reset token
        reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)  # 1 hour expiry
        
        # Store reset token in database
        user.reset_token = reset_token
        user.reset_token_expiry = reset_token_expiry
        db.commit()
        
        # Send email with reset link
        reset_link = f"pawthos://reset-password?token={reset_token}"
        
        message = MessageSchema(
            subject="Password Reset Request - Pawthos",
            recipients=[request.email],
            body=f"""
            Hello,
            
            You have requested to reset your password for your Pawthos account.
            
            Click the following link to reset your password:
            {reset_link}
            
            This link will expire in 1 hour.
            
            If you did not request this password reset, please ignore this email.
            
            Best regards,
            The Pawthos Team
            """,
            subtype=MessageType.html
        )
        
        fm = FastMail(conf)
        fm.send_message(message)
        
        return {"message": "If an account with this email exists, you will receive password reset instructions shortly."}
        
    except Exception as e:
        logging.error(f"Password reset request error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process password reset request")

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using reset token"""
    try:
        # Find user with valid reset token
        user = db.query(User).filter(
            User.reset_token == request.token,
            User.reset_token_expiry > datetime.now(timezone.utc)
        ).first()
        
        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Validate new password
        if len(request.new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Hash new password
        hashed_password = pwd_context.hash(request.new_password)
        
        # Update user password and clear reset token
        user.password_hash = hashed_password
        user.reset_token = None
        user.reset_token_expiry = None
        db.commit()
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset password")

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "eld_model_available": ELD_AVAILABLE and eld_model is not None,
        "torch_available": TORCH_AVAILABLE,
        "version": "2.0.0"
    }

@app.get("/api/vaccination-events/scheduled", response_model=List[VaccinationEventResponse])
def get_scheduled_vaccination_events(db: Session = Depends(get_db)):
    """Get all scheduled vaccination events"""
    try:
        print("Fetching scheduled vaccination events...")
        events = db.query(VaccinationEvent).filter(
            VaccinationEvent.status == "Scheduled"
        ).order_by(VaccinationEvent.event_date.asc()).all()
        
        print(f"Found {len(events)} scheduled events")
        return events
    except Exception as e:
        print(f"Error in get_scheduled_vaccination_events: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch vaccination events: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
