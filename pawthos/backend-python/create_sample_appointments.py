#!/usr/bin/env python3
"""
Script to create sample appointments for testing
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:pawthos@localhost/cityvet_db')

def create_sample_appointments():
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as connection:
            # Get the user ID (we know from previous check it's ID 5)
            user_id = 5
            
            # Create sample appointments
            sample_appointments = [
                {
                    'user_id': user_id,
                    'pet_id': None,  # No pets created yet
                    'type': 'Vaccination',
                    'date': (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                    'time': '10:00:00',
                    'veterinarian': 'Dr. Smith',
                    'notes': 'Annual vaccination appointment',
                    'location': 'City Veterinary Office',
                    'status': 'scheduled'
                },
                {
                    'user_id': user_id,
                    'pet_id': None,
                    'type': 'Check-up',
                    'date': (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d'),
                    'time': '14:30:00',
                    'veterinarian': 'Dr. Johnson',
                    'notes': 'Regular health checkup',
                    'location': 'City Veterinary Office',
                    'status': 'scheduled'
                },
                {
                    'user_id': user_id,
                    'pet_id': None,
                    'type': 'Consultation',
                    'date': (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
                    'time': '09:00:00',
                    'veterinarian': 'Dr. Brown',
                    'notes': 'Behavioral consultation completed',
                    'location': 'City Veterinary Office',
                    'status': 'completed'
                },
                {
                    'user_id': user_id,
                    'pet_id': None,
                    'type': 'Emergency Visit',
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'time': '16:00:00',
                    'veterinarian': 'Dr. Davis',
                    'notes': 'Emergency consultation needed',
                    'location': 'City Veterinary Office',
                    'status': 'pending'
                }
            ]
            
            for appt in sample_appointments:
                connection.execute(text("""
                    INSERT INTO appointments (user_id, pet_id, type, date, time, veterinarian, notes, location, status, created_at)
                    VALUES (:user_id, :pet_id, :type, :date, :time, :veterinarian, :notes, :location, :status, NOW())
                """), appt)
            
            connection.commit()
            
            print(f"✅ Created {len(sample_appointments)} sample appointments!")
            
            # Verify creation
            result = connection.execute(text("SELECT COUNT(*) FROM appointments WHERE user_id = :user_id"), {'user_id': user_id})
            count = result.fetchone()[0]
            print(f"📊 Total appointments for user {user_id}: {count}")
            
            # Show the created appointments
            result = connection.execute(text("""
                SELECT id, type, date, time, status, veterinarian
                FROM appointments 
                WHERE user_id = :user_id
                ORDER BY date ASC
            """), {'user_id': user_id})
            
            appointments = result.fetchall()
            print("\n📋 Created appointments:")
            print("-" * 80)
            for appt in appointments:
                print(f"ID: {appt[0]} | {appt[1]} | {appt[2]} {appt[3]} | {appt[4]} | Dr: {appt[5]}")
                
    except Exception as e:
        print(f"❌ Error creating sample appointments: {e}")

if __name__ == "__main__":
    print("🏥 Creating sample appointments...")
    create_sample_appointments()

