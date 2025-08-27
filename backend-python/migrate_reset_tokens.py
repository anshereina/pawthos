#!/usr/bin/env python3
"""
Database migration script to add reset token columns to users table
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:pawthos@localhost/cityvet_db')

def migrate_database():
    """Add reset token columns to users table if they don't exist"""
    try:
        # Create database engine
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Check if reset_token column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'reset_token'
            """))
            
            if not result.fetchone():
                print("Adding reset_token column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))
                print("✓ reset_token column added")
            else:
                print("✓ reset_token column already exists")
            
            # Check if reset_token_expiry column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'reset_token_expiry'
            """))
            
            if not result.fetchone():
                print("Adding reset_token_expiry column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP"))
                print("✓ reset_token_expiry column added")
            else:
                print("✓ reset_token_expiry column already exists")
            
            conn.commit()
            print("\n✅ Database migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🔄 Starting database migration for password reset functionality...")
    migrate_database()




