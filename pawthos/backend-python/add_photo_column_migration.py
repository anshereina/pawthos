#!/usr/bin/env python3
"""
Migration script to add photo_url column to pets table
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    # Database configuration
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:pawthos@localhost/cityvet_db')
    
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            # Check if photo_url column already exists
            check_column_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'pets' AND column_name = 'photo_url'
            """)
            
            result = connection.execute(check_column_query)
            column_exists = result.fetchone()
            
            if column_exists:
                print("✅ photo_url column already exists in pets table")
                return True
            
            # Add photo_url column to pets table
            alter_table_query = text("""
                ALTER TABLE pets 
                ADD COLUMN photo_url VARCHAR(500) NULL
            """)
            
            connection.execute(alter_table_query)
            connection.commit()
            
            print("✅ Successfully added photo_url column to pets table")
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Running database migration to add photo_url column...")
    success = run_migration()
    
    if success:
        print("🎉 Migration completed successfully!")
        sys.exit(0)
    else:
        print("💥 Migration failed!")
        sys.exit(1)
