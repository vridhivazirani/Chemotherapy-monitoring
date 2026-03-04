import sqlite3
import os

DB_NAME = 'oncomonitor.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Create Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        extra_info TEXT,
        clinical_review TEXT
    )
    ''')

    # Create Medications Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        dose TEXT NOT NULL,
        timing TEXT NOT NULL,
        taken BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Create Vitals Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS vitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        unit TEXT,
        detail TEXT,
        icon TEXT,
        color TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Create Symptoms Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS symptoms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        nausea INTEGER,
        fatigue INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Seed initial data if empty
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        # Seed a doctor
        cursor.execute("INSERT INTO users (name, email, password, role, extra_info) VALUES (?, ?, ?, ?, ?)",
                       ('Dr. Sarah Mitchell', 'sarah@hospital.com', 'admin123', 'doctor', 'MD-99821-XX'))
        
        # Seed a patient
        cursor.execute("INSERT INTO users (name, email, password, role, extra_info, clinical_review) VALUES (?, ?, ?, ?, ?, ?)",
                       ('John Doe', 'john@onco.com', 'patient123', 'patient', 'ID-8821', 
                        'Dr. Mitchell reviewed your vitals at 09:00 AM. Your white blood cell count is recovering well. Maintain current hydration levels and continue the anti-emetic schedule.'))
        
        patient_id = cursor.lastrowid

        # Seed medications for patient
        meds = [
            ('Ondansetron', '8mg', 'Take before meals', 'pill'),
            ('Dexamethasone', '4mg', 'After breakfast', 'pill'),
            ('Pantoprazole', '40mg', 'Empty stomach', 'pill')
        ]
        for name, dose, timing, icon in meds:
            cursor.execute("INSERT INTO medications (user_id, name, dose, timing, taken) VALUES (?, ?, ?, ?, ?)",
                           (patient_id, name, dose, timing, 0))

    conn.commit()
    conn.close()
    print(f"Database {DB_NAME} initialized.")

if __name__ == '__main__':
    init_db()
