# OncoMonitor

OncoMonitor is a full-stack, personalized digital health dashboard designed for oncology patients and healthcare providers. It provides real-time monitoring, symptom tracking, and AI-driven insights to improve chemotherapy outcomes.

## 🚀 Features

### For Patients
- **Personal Wellness Dashboard**: Track heart rate, body temp, and toxicity grades.
- **AI Health Assistant**: Ask questions about side effects and treatment in real-time.
- **Medication Buddy**: Stay on top of your schedule with a persistent checklist.
- **Device Sync**: Connect Apple Watch or Oura Ring for automated vital tracking.

### For Doctors
- **Clinic Overview**: Monitor patient cohorts and critical alerts at a glance.
- **Toxicity Analytics**: View cohort-wide toxicity trends to optimize care.
- **Risk Engine**: Automated alerts for high-risk flags like sepsis or abnormal labs.

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), JavaScript (SPA architecture)
- **Backend**: Python 3, Flask, Flask-CORS
- **Database**: SQLite (Persistent data for users, medications, and health logs)
- **Icons**: Lucide
- **Charts**: Chart.js

## 📦 Getting Started

### Prerequisites
- Python 3.x
- Anaconda (optional but recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd "cn implementation"
   ```
2. Install dependencies:
   ```bash
   pip install flask flask-cors
   ```
3. Run the backend:
   ```bash
   python app.py
   ```
4. Open `index.html` in your browser.

## 📄 Project Structure
- `index.html`: Main frontend entry point.
- `style.css`: Premium Glassmorphism UI styling.
- `main.js`: Frontend logic and API integration.
- `app.py`: Flask REST API server.
- `database.py`: Database schema and initialization logic.
- `oncomonitor.db`: SQLite database file (ignored in git).

---
*Developed as a Data-Driven Chemotherapy Monitoring System © 2026*
