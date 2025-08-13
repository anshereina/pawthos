import sqlite3
import os
from datetime import datetime

def create_pain_assessment_table():
    """Create the pain_assessments table in the database"""
    
    # Database file path
    db_path = 'pawthos.db'
    
    # Check if database exists
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create pain_assessments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pain_assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pet_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                pet_name TEXT NOT NULL,
                pet_type TEXT NOT NULL,
                pain_level TEXT NOT NULL,
                assessment_date TEXT NOT NULL,
                recommendations TEXT,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (pet_id) REFERENCES pets (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create index for better query performance
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_pain_assessments_pet_id 
            ON pain_assessments (pet_id)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_pain_assessments_user_id 
            ON pain_assessments (user_id)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_pain_assessments_date 
            ON pain_assessments (assessment_date)
        ''')
        
        # Commit the changes
        conn.commit()
        
        print("✅ Pain Assessment table created successfully!")
        print("✅ Indexes created for better performance!")
        
        # Verify the table was created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='pain_assessments'")
        table_exists = cursor.fetchone()
        
        if table_exists:
            print("✅ Table verification successful!")
            
            # Show table structure
            cursor.execute("PRAGMA table_info(pain_assessments)")
            columns = cursor.fetchall()
            print("\n📋 Table structure:")
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def insert_sample_data():
    """Insert sample pain assessment data for testing"""
    
    db_path = 'pawthos.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Sample data
        sample_assessments = [
            {
                'pet_id': 1,
                'user_id': 1,
                'pet_name': 'Maku',
                'pet_type': 'Dog',
                'pain_level': 'Level 1 (Mild Pain)',
                'assessment_date': '2025-01-15',
                'recommendations': 'Monitor closely for changes in behavior or appetite. Consider consulting with a veterinarian if symptoms persist.'
            },
            {
                'pet_id': 2,
                'user_id': 1,
                'pet_name': 'Whiskers',
                'pet_type': 'Cat',
                'pain_level': 'Level 0 (No Pain)',
                'assessment_date': '2025-01-12',
                'recommendations': 'Continue monitoring behavior and well-being.'
            },
            {
                'pet_id': 3,
                'user_id': 1,
                'pet_name': 'Buddy',
                'pet_type': 'Dog',
                'pain_level': 'Level 2 (Moderate Pain)',
                'assessment_date': '2025-01-10',
                'recommendations': 'Seek immediate veterinary attention to ensure your pet\'s comfort and health.'
            }
        ]
        
        # Insert sample data
        for assessment in sample_assessments:
            cursor.execute('''
                INSERT INTO pain_assessments 
                (pet_id, user_id, pet_name, pet_type, pain_level, assessment_date, recommendations)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                assessment['pet_id'],
                assessment['user_id'],
                assessment['pet_name'],
                assessment['pet_type'],
                assessment['pain_level'],
                assessment['assessment_date'],
                assessment['recommendations']
            ))
        
        conn.commit()
        print("✅ Sample pain assessment data inserted successfully!")
        
        # Verify data insertion
        cursor.execute("SELECT COUNT(*) FROM pain_assessments")
        count = cursor.fetchone()[0]
        print(f"✅ Total pain assessments in database: {count}")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Pain Assessment Migration...")
    print("=" * 50)
    
    # Create table
    if create_pain_assessment_table():
        print("\n📝 Do you want to insert sample data? (y/n): ", end="")
        response = input().lower().strip()
        
        if response in ['y', 'yes']:
            print("\n📊 Inserting sample data...")
            insert_sample_data()
    
    print("\n✅ Migration completed!")
