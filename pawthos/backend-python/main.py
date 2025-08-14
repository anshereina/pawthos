from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from pydantic import BaseModel
from typing import List
import os
import random
import string
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

# --- START NEW ADDITIONS FOR MODEL INTEGRATION ---
import torch
from torchvision import transforms
from PIL import Image
import io
import efficientnet_pytorch
import cv2
import numpy as np
# --- END NEW ADDITIONS ---

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

# --- START NEW ADDITIONS FOR MODEL INTEGRATION ---
# Model and pre-processing details from your notebook
IMG_SIZE = 300
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]

# Define the transformations for the input image
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
])

# Load the trained model
def load_model():
    # Load the checkpoint first to see the structure
    checkpoint = torch.load('best_efficientnet_model.pth', map_location=torch.device('cpu'))
    
    # Create a simple model that matches the saved structure
    model = efficientnet_pytorch.EfficientNet.from_name('efficientnet-b3', num_classes=3)
    
    # Try to load the state dict with strict=False to ignore mismatched keys
    if 'model_state_dict' in checkpoint:
        state_dict = checkpoint['model_state_dict']
    else:
        state_dict = checkpoint
    
    # Load with strict=False to handle architecture differences
    model.load_state_dict(state_dict, strict=False)
    model.eval()
    return model

model = load_model()

# Load the Haar Cascade for cat face detection
cascades_path = "haarcascade_frontalcatface_extended.xml"
face_cascade = cv2.CascadeClassifier(cascades_path)
# --- END NEW ADDITIONS ---

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    is_confirmed = Column(Integer, default=0)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
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
    photo_url = Column(String, nullable=True)  # Photo URL field

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
    pet_name = Column(String, nullable=False)
    pet_type = Column(String, nullable=False)
    pain_level = Column(String, nullable=False)
    assessment_date = Column(String, nullable=False)
    recommendations = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    # New fields for storing question answers
    basic_answers = Column(Text, nullable=True)  # JSON string of basic question answers
    assessment_answers = Column(Text, nullable=True)  # JSON string of assessment question answers
    questions_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    vaccine_name = Column(String, nullable=False)
    vaccination_date = Column(String, nullable=False)
    expiration_date = Column(String, nullable=True)
    next_vaccination_date = Column(String, nullable=True)
    veterinarian = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models for API
class UserCreate(BaseModel):
    name: Optional[str] = None
    email: str
    password: str
    phoneNumber: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: Optional[str]
    email: str
    phoneNumber: Optional[str]
    address: Optional[str]
    createdAt: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class OTPVerify(BaseModel):
    email: str
    otp_code: str

class AuthResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    token: Optional[str] = None
    user: Optional[UserResponse] = None

class PetCreate(BaseModel):
    pet_id: str
    name: str
    owner_name: str
    species: str
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

    created_at: Optional[datetime]

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

class DashboardResponse(BaseModel):
    user: UserResponse
    pets_count: int
    upcoming_appointments: List[AppointmentResponse]
    recent_pets: List[PetResponse]

class PainAssessmentCreate(BaseModel):
    pet_id: int
    pet_name: str
    pet_type: str
    pain_level: str
    assessment_date: str
    recommendations: Optional[str] = None
    image_url: Optional[str] = None
    basic_answers: Optional[str] = None
    assessment_answers: Optional[str] = None
    questions_completed: Optional[bool] = False

class PainAssessmentResponse(BaseModel):
    id: int
    pet_id: int
    user_id: int
    pet_name: str
    pet_type: str
    pain_level: str
    assessment_date: str
    recommendations: Optional[str] = None
    image_url: Optional[str] = None
    basic_answers: Optional[str] = None
    assessment_answers: Optional[str] = None
    questions_completed: Optional[bool] = None
    created_at: datetime

class VaccinationRecordCreate(BaseModel):
    pet_id: int
    vaccine_name: str
    vaccination_date: str
    expiration_date: Optional[str] = None
    next_vaccination_date: Optional[str] = None
    veterinarian: Optional[str] = None
    notes: Optional[str] = None

class VaccinationRecordResponse(BaseModel):
    id: int
    pet_id: int
    user_id: int
    vaccine_name: str
    vaccination_date: str
    expiration_date: Optional[str] = None
    next_vaccination_date: Optional[str] = None
    veterinarian: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

async def send_otp_email(email: str, otp: str, name: str = "User"):
    """Send OTP email to user"""
    html_template = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #045b26; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Pawthos</h1>
            <p style="margin: 5px 0 0 0;">Email Verification</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #045b26; margin-top: 0;">Hello {name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
                Thank you for signing up with Pawthos! To complete your registration, please verify your email address using the OTP code below:
            </p>
            
            <div style="background-color: #045b26; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 8px;">
                {otp}
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 0;">
                This OTP is valid for 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                © 2024 Pawthos - Pet Management System
            </p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject="Pawthos - Email Verification",
        recipients=[email],
        body=html_template,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("userId")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# API Routes
@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Pawthos Python Backend API is running"}

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    """
    Endpoint to receive a cat image, detect the face, and predict pain level.
    """
    try:
        # Read the image file
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Debug: Print image info
        print(f"Image received - Shape: {img.shape}, Type: {img.dtype}")
        if img is None:
            raise HTTPException(status_code=400, detail="Failed to read image file.")
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces with stricter parameters to avoid false positives
        print(f"Attempting primary detection with strict parameters...")
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
        print(f"Primary detection found {len(faces)} faces")
        
        if len(faces) == 0:
            # Try with slightly more flexible parameters as fallback
            print(f"Attempting fallback detection with moderate parameters...")
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=4, minSize=(40, 40))
            print(f"Fallback detection found {len(faces)} faces")
            
        if len(faces) == 0:
            print(f"No cat face detected - Image shape: {img.shape}")
            raise HTTPException(status_code=400, detail="No cat face detected in the image. Please ensure the cat's face is clearly visible and well-lit.")
        else:
            print(f"Cat face detected - Found {len(faces)} face(s)")
            
        # Get the first detected face
        (x, y, w, h) = faces[0]
        
        # Crop the image to the detected face
        cropped_face = img[y:y+h, x:x+w]
        
        # Convert the cropped OpenCV image (BGR) to PIL image (RGB)
        pil_image = Image.fromarray(cv2.cvtColor(cropped_face, cv2.COLOR_BGR2RGB))

        # Apply the PyTorch transformations
        input_tensor = transform(pil_image).unsqueeze(0)

        # Make a prediction
        with torch.no_grad():
            outputs = model(input_tensor)
            _, predicted_idx = torch.max(outputs, 1)
            
            # Map the index to a pain level string
            class_mapping = {
                0: 'Level 0 (No Pain)',
                1: 'Level 1 (Mild Pain)',
                2: 'Level 2 (Moderate/Severe Pain)'
            }
            pain_level = class_mapping.get(predicted_idx.item(), 'Unknown')
            
            return {"pain_level": pain_level}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Server error during prediction")

@app.get("/api/routes")
def list_routes():
    """Debug endpoint to list all available routes"""
    routes = []
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            routes.append({
                "path": route.path,
                "methods": list(route.methods)
            })
    return {"routes": routes}

@app.post("/api/auth/signup", response_model=AuthResponse)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            if existing_user.is_confirmed == 1:
                return AuthResponse(
                    success=False,
                    message="Email already exists and is verified."
                )
            else:
                # User exists but not confirmed, update their info and resend OTP
                existing_user.name = user.name or ""
                existing_user.password_hash = get_password_hash(user.password)
                existing_user.phone_number = user.phoneNumber or ""
                existing_user.address = user.address or ""
                existing_user.otp_code = generate_otp()
                existing_user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
                
                db.commit()
                
                # Send OTP email
                await send_otp_email(user.email, existing_user.otp_code, user.name or "User")
                
                return AuthResponse(
                    success=True,
                    message="OTP has been sent to your email. Please verify to complete registration."
                )
        
        # Generate OTP
        otp_code = generate_otp()
        otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Create user (unconfirmed)
        db_user = User(
            name=user.name or "",
            email=user.email,
            password_hash=hashed_password,
            phone_number=user.phoneNumber or "",
            address=user.address or "",
            is_confirmed=0,
            otp_code=otp_code,
            otp_expires_at=otp_expires_at
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Send OTP email
        await send_otp_email(user.email, otp_code, user.name or "User")
        
        return AuthResponse(
            success=True,
            message="Account created! OTP has been sent to your email. Please verify to complete registration."
        )
        
    except Exception as e:
        print(f"Signup error: {e}")
        return AuthResponse(
            success=False,
            message="Server error during registration"
        )

@app.post("/api/auth/verify-otp", response_model=AuthResponse)
def verify_otp(otp_data: OTPVerify, db: Session = Depends(get_db)):
    try:
        # Find user
        user = db.query(User).filter(User.email == otp_data.email).first()
        if not user:
            return AuthResponse(
                success=False,
                message="User not found."
            )
        
        # Check if already confirmed
        if user.is_confirmed == 1:
            return AuthResponse(
                success=False,
                message="Email already verified."
            )
        
        # Check OTP
        if not user.otp_code or user.otp_code != otp_data.otp_code:
            return AuthResponse(
                success=False,
                message="Invalid OTP code."
            )
        
        # Check if OTP expired
        if not user.otp_expires_at or datetime.now(timezone.utc) > user.otp_expires_at:
            return AuthResponse(
                success=False,
                message="OTP has expired. Please request a new one."
            )
        
        # Confirm user
        user.is_confirmed = 1
        user.otp_code = None
        user.otp_expires_at = None
        db.commit()
        
        # Generate token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"userId": user.id, "email": user.email},
            expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            phoneNumber=user.phone_number,
            address=user.address,
            createdAt=user.created_at
        )
        
        return AuthResponse(
            success=True,
            message="Email verified successfully! You are now logged in.",
            token=access_token,
            user=user_response
        )
        
    except Exception as e:
        print(f"OTP verification error: {e}")
        return AuthResponse(
            success=False,
            message="Server error during verification"
        )

@app.post("/api/auth/login", response_model=AuthResponse)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    try:
        # Find user
        user = db.query(User).filter(User.email == user_login.email).first()
        if not user:
            return AuthResponse(
                success=False,
                message="Invalid email or password."
            )
        
        # Check if user is confirmed
        if user.is_confirmed == 0:
            return AuthResponse(
                success=False,
                message="Please verify your email before logging in. Check your inbox for the OTP."
            )
        
        # Verify password
        if not verify_password(user_login.password, user.password_hash):
            return AuthResponse(
                success=False,
                message="Invalid email or password."
            )
        
        # Generate token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"userId": user.id, "email": user.email},
            expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            phoneNumber=user.phone_number,
            address=user.address,
            createdAt=user.created_at
        )
        
        return AuthResponse(
            success=True,
            message="Login successful",
            token=access_token,
            user=user_response
        )
        
    except Exception as e:
        print(f"Login error: {e}")
        return AuthResponse(
            success=False,
            message="Server error during login"
        )

@app.get("/api/auth/profile", response_model=AuthResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    user_response = UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phoneNumber=current_user.phone_number,
        address=current_user.address,
        createdAt=current_user.created_at
    )
    
    return AuthResponse(
        success=True,
        user=user_response
    )

# Dashboard endpoint
@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Get user's pets
        pets = db.query(Pet).all()
        pets_count = len(pets)
        
        # Get recent pets (last 3)
        recent_pets = db.query(Pet).order_by(Pet.created_at.desc()).limit(3).all()
        
        # Get upcoming appointments (next 5)
        upcoming_appointments = db.query(Appointment).filter(
            Appointment.user_id == current_user.id,
            Appointment.status == "scheduled"
        ).order_by(Appointment.date.asc()).limit(5).all()
        
        user_response = UserResponse(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            phoneNumber=current_user.phone_number,
            address=current_user.address,
            createdAt=current_user.created_at
        )
        
        recent_pets_response = [
            PetResponse(
                id=pet.id,
                pet_id=pet.pet_id,
                name=pet.name,
                owner_name=pet.owner_name,
                species=pet.species,
                date_of_birth=str(pet.date_of_birth) if pet.date_of_birth else None,
                color=pet.color,
                breed=pet.breed,
                gender=pet.gender,
                reproductive_status=pet.reproductive_status,
                photo_url=pet.photo_url,
                created_at=pet.created_at
            ) for pet in recent_pets
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
                created_at=appt.created_at
            ) for appt in upcoming_appointments
        ]
        
        return DashboardResponse(
            user=user_response,
            pets_count=pets_count,
            upcoming_appointments=upcoming_appointments_response,
            recent_pets=recent_pets_response
        )
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail="Server error retrieving dashboard data")

# Pet endpoints
@app.get("/api/pets", response_model=List[PetResponse])
def get_pets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pets = db.query(Pet).all()
    return [
        PetResponse(
            id=pet.id,
            pet_id=pet.pet_id,
            name=pet.name,
            owner_name=pet.owner_name,
            species=pet.species,
            date_of_birth=str(pet.date_of_birth) if pet.date_of_birth else None,
            color=pet.color,
            breed=pet.breed,
            gender=pet.gender,
            reproductive_status=pet.reproductive_status,
            photo_url=pet.photo_url,
            created_at=pet.created_at
        ) for pet in pets
    ]

@app.post("/api/pets", response_model=PetResponse)
def create_pet(pet_data: PetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db_pet = Pet(
            pet_id=pet_data.pet_id,
            name=pet_data.name,
            owner_name=pet_data.owner_name,
            species=pet_data.species,
            date_of_birth=pet_data.date_of_birth,
            color=pet_data.color,
            breed=pet_data.breed,
            gender=pet_data.gender,
            reproductive_status=pet_data.reproductive_status,
            photo_url=pet_data.photo_url,

            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(db_pet)
        db.commit()
        db.refresh(db_pet)
        
        return PetResponse(
            id=db_pet.id,
            pet_id=db_pet.pet_id,
            name=db_pet.name,
            owner_name=db_pet.owner_name,
            species=db_pet.species,
            date_of_birth=str(db_pet.date_of_birth) if db_pet.date_of_birth else None,
            color=db_pet.color,
            breed=db_pet.breed,
            gender=db_pet.gender,
            reproductive_status=db_pet.reproductive_status,
            photo_url=db_pet.photo_url,

            created_at=db_pet.created_at
        )
        
    except Exception as e:
        print(f"Create pet error: {e}")
        raise HTTPException(status_code=500, detail="Server error creating pet")

@app.get("/api/pets/{pet_id}", response_model=PetResponse)
def get_pet_by_id(pet_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        pet = db.query(Pet).filter(
            Pet.id == pet_id
        ).first()
        
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        
        return PetResponse(
            id=pet.id,
            pet_id=pet.pet_id,
            name=pet.name,
            owner_name=pet.owner_name,
            species=pet.species,
            date_of_birth=str(pet.date_of_birth) if pet.date_of_birth else None,
            color=pet.color,
            breed=pet.breed,
            gender=pet.gender,
            reproductive_status=pet.reproductive_status,
            photo_url=pet.photo_url,
            created_at=pet.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get pet by ID error: {e}")
        raise HTTPException(status_code=500, detail="Server error retrieving pet")

# Appointment endpoints
@app.get("/api/appointments", response_model=List[AppointmentResponse])
def get_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(Appointment.user_id == current_user.id).all()
    return [
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
            created_at=appt.created_at
        ) for appt in appointments
    ]

@app.post("/api/appointments", response_model=AppointmentResponse)
def create_appointment(appointment_data: AppointmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db_appointment = Appointment(
            user_id=current_user.id,
            pet_id=appointment_data.pet_id,
            type=appointment_data.type,
            date=appointment_data.date,
            time=appointment_data.time,
            veterinarian=appointment_data.veterinarian,
            notes=appointment_data.notes,

            status="pending",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(db_appointment)
        db.commit()
        db.refresh(db_appointment)
        
        return AppointmentResponse(
            id=db_appointment.id,
            pet_id=db_appointment.pet_id,
            user_id=db_appointment.user_id,
            type=db_appointment.type,
            date=str(db_appointment.date) if db_appointment.date else "",
            time=str(db_appointment.time) if db_appointment.time else "",
            veterinarian=db_appointment.veterinarian,
            notes=db_appointment.notes,

            status=db_appointment.status,
            created_at=db_appointment.created_at
        )
        
    except Exception as e:
        print(f"Create appointment error: {e}")
        raise HTTPException(status_code=500, detail="Server error creating appointment")

@app.patch("/api/appointments/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(appointment_id: int, status_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Find the appointment
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id,
            Appointment.user_id == current_user.id
        ).first()
        
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Update the status
        appointment.status = status_data.get("status", appointment.status)
        appointment.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(appointment)
        
        return AppointmentResponse(
            id=appointment.id,
            pet_id=appointment.pet_id,
            user_id=appointment.user_id,
            type=appointment.type,
            date=str(appointment.date) if appointment.date else "",
            time=str(appointment.time) if appointment.time else "",
            veterinarian=appointment.veterinarian,
            notes=appointment.notes,
            status=appointment.status,
            created_at=appointment.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update appointment status error: {e}")
        raise HTTPException(status_code=500, detail="Server error updating appointment status")

# Pain Assessment endpoints
@app.get("/api/pain-assessments", response_model=List[PainAssessmentResponse])
def get_pain_assessments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all pain assessments for the current user"""
    try:
        assessments = db.query(PainAssessment).filter(PainAssessment.user_id == current_user.id).order_by(PainAssessment.created_at.desc()).all()
        return [
            PainAssessmentResponse(
                id=assessment.id,
                pet_id=assessment.pet_id,
                user_id=assessment.user_id,
                pet_name=assessment.pet_name,
                pet_type=assessment.pet_type,
                pain_level=assessment.pain_level,
                assessment_date=assessment.assessment_date,
                recommendations=assessment.recommendations,
                image_url=assessment.image_url,
                basic_answers=assessment.basic_answers,
                assessment_answers=assessment.assessment_answers,
                questions_completed=assessment.questions_completed,
                created_at=assessment.created_at
            ) for assessment in assessments
        ]
    except Exception as e:
        print(f"Get pain assessments error: {e}")
        raise HTTPException(status_code=500, detail="Server error fetching pain assessments")

@app.post("/api/pain-assessments", response_model=PainAssessmentResponse)
def create_pain_assessment(assessment_data: PainAssessmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new pain assessment"""
    try:
        db_assessment = PainAssessment(
            user_id=current_user.id,
            pet_id=assessment_data.pet_id,
            pet_name=assessment_data.pet_name,
            pet_type=assessment_data.pet_type,
            pain_level=assessment_data.pain_level,
            assessment_date=assessment_data.assessment_date,
            recommendations=assessment_data.recommendations,
            image_url=assessment_data.image_url,
            basic_answers=assessment_data.basic_answers,
            assessment_answers=assessment_data.assessment_answers,
            questions_completed=assessment_data.questions_completed,
            created_at=datetime.utcnow()
        )
        
        db.add(db_assessment)
        db.commit()
        db.refresh(db_assessment)
        
        return PainAssessmentResponse(
            id=db_assessment.id,
            pet_id=db_assessment.pet_id,
            user_id=db_assessment.user_id,
            pet_name=db_assessment.pet_name,
            pet_type=db_assessment.pet_type,
            pain_level=db_assessment.pain_level,
            assessment_date=db_assessment.assessment_date,
            recommendations=db_assessment.recommendations,
            image_url=db_assessment.image_url,
            basic_answers=db_assessment.basic_answers,
            assessment_answers=db_assessment.assessment_answers,
            questions_completed=db_assessment.questions_completed,
            created_at=db_assessment.created_at
        )
        
    except Exception as e:
        print(f"Create pain assessment error: {e}")
        raise HTTPException(status_code=500, detail="Server error creating pain assessment")

@app.get("/api/pain-assessments/{assessment_id}", response_model=PainAssessmentResponse)
def get_pain_assessment(assessment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a specific pain assessment by ID"""
    try:
        assessment = db.query(PainAssessment).filter(
            PainAssessment.id == assessment_id,
            PainAssessment.user_id == current_user.id
        ).first()
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Pain assessment not found")
        
        return PainAssessmentResponse(
            id=assessment.id,
            pet_id=assessment.pet_id,
            user_id=assessment.user_id,
            pet_name=assessment.pet_name,
            pet_type=assessment.pet_type,
            pain_level=assessment.pain_level,
            assessment_date=assessment.assessment_date,
            recommendations=assessment.recommendations,
            image_url=assessment.image_url,
            basic_answers=assessment.basic_answers,
            assessment_answers=assessment.assessment_answers,
            questions_completed=assessment.questions_completed,
            created_at=assessment.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get pain assessment error: {e}")
        raise HTTPException(status_code=500, detail="Server error fetching pain assessment")

@app.delete("/api/pain-assessments/{assessment_id}")
def delete_pain_assessment(assessment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a pain assessment"""
    try:
        assessment = db.query(PainAssessment).filter(
            PainAssessment.id == assessment_id,
            PainAssessment.user_id == current_user.id
        ).first()
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Pain assessment not found")
        
        db.delete(assessment)
        db.commit()
        
        return {"message": "Pain assessment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete pain assessment error: {e}")
        raise HTTPException(status_code=500, detail="Server error deleting pain assessment")

@app.patch("/api/pain-assessments/{assessment_id}", response_model=PainAssessmentResponse)
def update_pain_assessment(assessment_id: int, update_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update a pain assessment"""
    try:
        assessment = db.query(PainAssessment).filter(
            PainAssessment.id == assessment_id,
            PainAssessment.user_id == current_user.id
        ).first()
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Pain assessment not found")
        
        # Update fields if provided
        if 'pet_id' in update_data:
            assessment.pet_id = update_data['pet_id']
        if 'pet_name' in update_data:
            assessment.pet_name = update_data['pet_name']
        if 'pet_type' in update_data:
            assessment.pet_type = update_data['pet_type']
        if 'pain_level' in update_data:
            assessment.pain_level = update_data['pain_level']
        if 'assessment_date' in update_data:
            assessment.assessment_date = update_data['assessment_date']
        if 'recommendations' in update_data:
            assessment.recommendations = update_data['recommendations']
        if 'image_url' in update_data:
            assessment.image_url = update_data['image_url']
        if 'basic_answers' in update_data:
            assessment.basic_answers = update_data['basic_answers']
        if 'assessment_answers' in update_data:
            assessment.assessment_answers = update_data['assessment_answers']
        if 'questions_completed' in update_data:
            assessment.questions_completed = update_data['questions_completed']
        
        db.commit()
        db.refresh(assessment)
        
        return PainAssessmentResponse(
            id=assessment.id,
            pet_id=assessment.pet_id,
            user_id=assessment.user_id,
            pet_name=assessment.pet_name,
            pet_type=assessment.pet_type,
            pain_level=assessment.pain_level,
            assessment_date=assessment.assessment_date,
            recommendations=assessment.recommendations,
            image_url=assessment.image_url,
            created_at=assessment.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update pain assessment error: {e}")
        raise HTTPException(status_code=500, detail="Server error updating pain assessment")

# Vaccination Records Endpoints
@app.get("/api/vaccination-records", response_model=List[VaccinationRecordResponse])
def get_vaccination_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all vaccination records for the current user's pets"""
    try:
        # Get all pets owned by the current user
        user_pets = db.query(Pet).filter(Pet.id.in_(
            db.query(Pet.id).filter(Pet.owner_name == current_user.name)
        )).all()
        
        pet_ids = [pet.id for pet in user_pets]
        
        # Get vaccination records for user's pets
        vaccination_records = db.query(VaccinationRecord).filter(
            VaccinationRecord.pet_id.in_(pet_ids),
            VaccinationRecord.user_id == current_user.id
        ).all()
        
        return [
            VaccinationRecordResponse(
                id=record.id,
                pet_id=record.pet_id,
                user_id=record.user_id,
                vaccine_name=record.vaccine_name,
                vaccination_date=record.vaccination_date,
                expiration_date=record.expiration_date,
                next_vaccination_date=record.next_vaccination_date,
                veterinarian=record.veterinarian,
                notes=record.notes,
                created_at=record.created_at
            )
            for record in vaccination_records
        ]
        
    except Exception as e:
        print(f"Get vaccination records error: {e}")
        raise HTTPException(status_code=500, detail="Server error fetching vaccination records")

@app.post("/api/vaccination-records", response_model=VaccinationRecordResponse)
def create_vaccination_record(
    vaccination_data: VaccinationRecordCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Create a new vaccination record"""
    try:
        # Verify the pet belongs to the current user
        pet = db.query(Pet).filter(
            Pet.id == vaccination_data.pet_id,
            Pet.owner_name == current_user.name
        ).first()
        
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found or not owned by user")
        
        # Create new vaccination record
        vaccination_record = VaccinationRecord(
            pet_id=vaccination_data.pet_id,
            user_id=current_user.id,
            vaccine_name=vaccination_data.vaccine_name,
            vaccination_date=vaccination_data.vaccination_date,
            expiration_date=vaccination_data.expiration_date,
            next_vaccination_date=vaccination_data.next_vaccination_date,
            veterinarian=vaccination_data.veterinarian,
            notes=vaccination_data.notes
        )
        
        db.add(vaccination_record)
        db.commit()
        db.refresh(vaccination_record)
        
        return VaccinationRecordResponse(
            id=vaccination_record.id,
            pet_id=vaccination_record.pet_id,
            user_id=vaccination_record.user_id,
            vaccine_name=vaccination_record.vaccine_name,
            vaccination_date=vaccination_record.vaccination_date,
            expiration_date=vaccination_record.expiration_date,
            next_vaccination_date=vaccination_record.next_vaccination_date,
            veterinarian=vaccination_record.veterinarian,
            notes=vaccination_record.notes,
            created_at=vaccination_record.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create vaccination record error: {e}")
        raise HTTPException(status_code=500, detail="Server error creating vaccination record")

@app.get("/api/vaccination-records/{record_id}", response_model=VaccinationRecordResponse)
def get_vaccination_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a specific vaccination record"""
    try:
        record = db.query(VaccinationRecord).filter(
            VaccinationRecord.id == record_id,
            VaccinationRecord.user_id == current_user.id
        ).first()
        
        if not record:
            raise HTTPException(status_code=404, detail="Vaccination record not found")
        
        return VaccinationRecordResponse(
            id=record.id,
            pet_id=record.pet_id,
            user_id=record.user_id,
            vaccine_name=record.vaccine_name,
            vaccination_date=record.vaccination_date,
            expiration_date=record.expiration_date,
            next_vaccination_date=record.next_vaccination_date,
            veterinarian=record.veterinarian,
            notes=record.notes,
            created_at=record.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get vaccination record error: {e}")
        raise HTTPException(status_code=500, detail="Server error fetching vaccination record")

@app.delete("/api/vaccination-records/{record_id}")
def delete_vaccination_record(record_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a vaccination record"""
    try:
        record = db.query(VaccinationRecord).filter(
            VaccinationRecord.id == record_id,
            VaccinationRecord.user_id == current_user.id
        ).first()
        
        if not record:
            raise HTTPException(status_code=404, detail="Vaccination record not found")
        
        db.delete(record)
        db.commit()
        
        return {"message": "Vaccination record deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete vaccination record error: {e}")
        raise HTTPException(status_code=500, detail="Server error deleting vaccination record")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
