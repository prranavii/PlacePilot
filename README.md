# PlacePilot

> **A smart, minimalist placement tracker and mock interview practice companion.**

Placement season is stressful. Between managing spreadsheets, keeping track of deadlines, tailoring resumes for ATS scanners, and preparing for technical rounds, it is easy to get overwhelmed. 

PlacePilot was built to bring all of these moving parts into one clean, warm-beige workspace. It helps you track your applications on a Kanban pipeline, matches your resume directly to job postings, and lets you practice mock interviews with an AI tutor that reviews your answers.

---

## 🤖 How the AI Features Work
 
Instead of just tracking dates, PlacePilot acts as an active preparation partner using practical AI features: 

* 🎙️ **Mock Interview Studio:** Practice live behavioral or technical loops tailored to specific companies. The AI generates relevant questions, simulates a voice round, and scores your answers on technical depth and communication style.
* 📄 **ATS Resume Matcher:** Upload your resume (PDF/Word) and paste any job description. The parser identifies missing keyword tags and skill gaps, giving you a match score before you submit.
* 💾 **Semantic Memory Vault (RAG):** Keep a personal vector vault of study notes, project details, and coding concepts. The AI mock interviewer queries this memory during practice rounds to reference your actual achievements.
* 📋 **Personalized Study Planner:** Based on your resume matching results and past mock interviews, PlacePilot automatically generates a tailored study checklist with target tasks (like revising B+ Trees or practicing cycle detection).
* 📊 **Weekly Recruiter Reviews:** Get a simple, natural-language review every week summarizing your progress, confidence trends, and what you should focus on next.

---

## ✨ Features

* 📊 **Bento Dashboard:** A clean, centralized dashboard displaying application stats, streaks, weekly study times, and upcoming interviews.
* 📋 **Kanban Pipeline:** A drag-and-drop board to track where each application stands (Wishlist, Applied, OA, Interview, or Offer).
* 🌓 **Clean Sand Theme:** A responsive, warm-minimalist Sand, Cocoa, and Vermilion palette that supports both light and dark modes.

---

## 💻 Tech Stack

### Frontend
* **Core:** React.js 18 + TypeScript + Vite + Framer Motion
* **Styling:** TailwindCSS + Custom CSS animations
* **Telemetry Charts:** Recharts
* **Icons:** Lucide React

### Backend
* **Core:** FastAPI (Python 3.13)
* **Database:** SQLite + SQLAlchemy ORM
* **Resume Parsers:** `pypdf` (for PDF structures) and built-in XML decoders (for Word docs)
* **Security:** JWT authentication + salted bcrypt passwords

---

## 🛠️ Getting Started

### 1. Prerequisites
* Python 3.10+
* Node.js v18+

### 2. Backend Setup
Navigate to the `backend` directory, set up a virtual environment, install dependencies, and run the server:

```bash
# Go to the backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with default test accounts
python -m app.utils.seed

# Run the FastAPI server
uvicorn app.main:app --reload
```
*The backend API will run at `http://127.0.0.1:8000`.*

### 3. Frontend Setup
Navigate to the `frontend` directory, install package dependencies, and run the Vite dev server:

```bash
# Go to the frontend folder
cd ../frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The client app will open at `http://localhost:5173`.*

---

## 📂 Project Structure

```text
placement-tracker/
├── backend/
│   ├── app/
│   │   ├── api/             # API routes (Auth, Resume, Applications, Mock Interviews)
│   │   ├── core/            # Database and security configurations
│   │   ├── models/          # SQLAlchemy schemas (users, applications, events)
│   │   └── schemas/         # Pydantic validation structures
│   ├── placepilot.db        # SQLite database
│   ├── seed.py              # Sample database seeder
│   └── run.py               # Launcher script
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar and floating dock navigation
│   │   ├── context/         # Auth Context provider
│   │   ├── pages/           # Dashboard, Kanban Pipeline, Resume Matcher, Journal, Memory Vault
│   │   ├── App.tsx          # Router layout controller
│   │   └── index.css        # Theme styles & custom wave animations
│   ├── tailwind.config.js   # Sand, Cocoa, and Vermilion Tailwind color themes
│   └── package.json
└── README.md
```

---

## 🔒 Test Account Credentials
To test out the analytics dashboard immediately without signing up, use these seeded credentials:
* **Email:** `student@placepilot.ai`
* **Password:** `password123`
