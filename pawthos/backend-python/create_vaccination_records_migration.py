from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:pawthos@localhost/cityvet_db')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# VaccinationRecord model
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

def create_vaccination_records_table():
    """Create the vaccination_records table"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Vaccination records table created successfully!")
        
        # Create sample data
        create_sample_vaccination_records()
        
    except Exception as e:
        print(f"❌ Error creating vaccination records table: {e}")

def create_sample_vaccination_records():
    """Create sample vaccination records for testing"""
    db = SessionLocal()
    try:
        # Check if sample data already exists
        existing_records = db.query(VaccinationRecord).count()
        if existing_records > 0:
            print("Sample vaccination records already exist, skipping...")
            return
        
        # Sample vaccination records
        sample_records = [
            {
                'pet_id': 1,
                'user_id': 1,
                'vaccine_name': '5in1 (Anti-Parvo)',
                'vaccination_date': '2024-01-15',
                'expiration_date': '2025-01-15',
                'next_vaccination_date': '2025-01-15',
                'veterinarian': 'Dr. Smith',
                'notes': 'Annual vaccination completed successfully'
            },
            {
                'pet_id': 1,
                'user_id': 1,
                'vaccine_name': 'Rabies Vaccine',
                'vaccination_date': '2024-02-20',
                'expiration_date': '2025-02-20',
                'next_vaccination_date': '2025-02-20',
                'veterinarian': 'Dr. Johnson',
                'notes': 'Rabies vaccination administered'
            },
            {
                'pet_id': 2,
                'user_id': 1,
                'vaccine_name': 'FVRCP (Feline)',
                'vaccination_date': '2024-03-10',
                'expiration_date': '2025-03-10',
                'next_vaccination_date': '2025-03-10',
                'veterinarian': 'Dr. Williams',
                'notes': 'Cat vaccination series completed'
            }
        ]
        
        for record_data in sample_records:
            record = VaccinationRecord(**record_data)
            db.add(record)
        
        db.commit()
        print("✅ Sample vaccination records created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating sample vaccination records: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_vaccination_records_table()
