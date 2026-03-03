from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import database

app = Flask(__name__)
CORS(app)
DB_NAME = 'oncomonitor.db'

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    extra_info = data.get('extra_info')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (name, email, password, role, extra_info) VALUES (?, ?, ?, ?, ?)",
                       (name, email, password, role, extra_info))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "user": {"id": user_id, "name": name, "role": role}}), 201
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Email already exists"}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
    conn.close()

    if user:
        return jsonify({
            "success": True, 
            "user": {
                "id": user['id'], 
                "name": user['name'], 
                "role": user['role'],
                "extra_info": user['extra_info']
            }
        })
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/patient/meds/<int:user_id>', methods=['GET'])
def get_meds(user_id):
    conn = get_db_connection()
    meds = conn.execute('SELECT * FROM medications WHERE user_id = ?', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in meds])

@app.route('/api/patient/meds/mark', methods=['POST'])
def mark_med_taken():
    data = request.json
    user_id = data.get('user_id')
    med_name = data.get('name')

    conn = get_db_connection()
    conn.execute('UPDATE medications SET taken = 1 WHERE user_id = ? AND name = ?', (user_id, med_name))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/patient/stats/<int:user_id>', methods=['GET'])
def get_patient_stats(user_id):
    # For now return static mock as we haven't connected device real data yet, but could be dynamic
    return jsonify([
        { "label": 'Heart Rate', "value": '72', "detail": '↑ Stable', "unit": 'BPM', "icon": 'heart', "color": 'var(--danger)' },
        { "label": 'Body Temp', "value": '98.6', "detail": 'Normal', "unit": '°F', "icon": 'thermometer', "color": 'var(--warning)' },
        { "label": 'Toxicity Grade', "value": 'G2', "detail": 'Nausea Reported', "unit": 'Moderate', "icon": 'alert-triangle', "color": 'var(--accent)' },
        { "label": 'Cycle Progress', "value": '3/6', "detail": 'Day 12 of 21', "unit": 'Cycle', "icon": 'refresh-cw', "color": 'var(--primary)' }
    ])

@app.route('/api/doctor/stats', methods=['GET'])
def get_doctor_stats():
    return jsonify([
        { "label": 'Active Patients', "value": '42', "detail": '↑ 3 this week', "icon": 'users', "color": 'var(--primary)' },
        { "label": 'Critical Alerts', "value": '5', "detail": 'Action Required', "icon": 'zap', "color": 'var(--danger)' },
        { "label": 'Avg Toxicity', "value": 'G1.2', "detail": 'Stable across cohort', "icon": 'alert-triangle', "color": 'var(--warning)' },
        { "label": 'Clinic Capacity', "value": '85%', "detail": 'Day unit load', "icon": 'activity', "color": 'var(--secondary)' }
    ])

if __name__ == '__main__':
    # Ensure DB is initialized
    database.init_db()
    app.run(debug=True, port=5000)
