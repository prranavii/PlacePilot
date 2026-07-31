# 🚀 PlacePilot AI

> **AI-Powered Placement Tracker & Agentic Interview Preparation Copilot**

PlacePilot AI is a premium, state-of-the-art web application designed for students and job seekers. It features a modern, warm minimalist **Sand, Cocoa & Electric Vermilion Orange** glassmorphic interface with a bottom macOS-style dock and floating 3D ambient background blobs. 

The application tracks job applications across Kanban stages, parses resume uploads (PDF/Word/Text) against target Job Descriptions, generates recruiter scoring metrics, and conducts custom AI mock interviews based on the job requirements.

---

## 🤖 Generative AI & Agentic AI Capabilities

PlacePilot AI leverages advanced AI workflows to act as a personalized placement companion:

* 🎙️ **Generative AI Mock Interview Studio:** Uses Large Language Models (LLMs) to dynamically synthesize and voice custom, job-specific technical and behavioral questions. It simulates active audio mock interviews, captures your responses, and provides comprehensive scoring metrics, communication feedback, and strengths/weaknesses scorecards.
* 📋 **Agentic Study Planner:** Analyzes your job description requirements, resume match gaps, and recent mock interview performance to autonomously generate prioritized study checklist milestones and weekly study intensity recommendations.
* 📄 **ATS Match Engine:** Automatically parses resume uploads (`.pdf`, `.docx`, `.txt`), maps them semantically against target job descriptions, identifies structural gaps (missing keywords/skills), and advises on critical revision topics.
* 💾 **Semantic Preparation Memory (RAG):** Integrates a Retrieval-Augmented Generation (RAG) vector interface. PlacePilot stores preparation facts, DSA solution approaches, and projects in a local semantic vector database, allowing you to query, edit, and debug your placement memory vault.
* 📊 **Recruiter Narrative Synthesizer:** Aggregates weekly attempt logs, confidence parameters, and mock scores to write a natural-language recruiter critique summarizing improvement paths.

---

## ✨ Core Features

* 📊 **Command Center Dashboard:** Dynamic Bento UI layout showcasing application statistics, prep mission lists, weekly preparation intensity logs, and ambient dissolving background animations.
* 📋 **Visual Pipeline (Kanban):** Drag-and-drop boards to track applications across stages (Wishlist, Applied, OA, Technical Interview, Offer) with priority indicators and active stage lights.
* 🤖 **AI Mock Interview Simulator:** Chat-based audio/text interview simulator that grills you on target company specs and grades your answers with custom performance scorecards.
* 📄 **Resume Matcher Pipeline:** Upload resumes to parse and match them against target Job Descriptions, returning recruiter scores, matched skills, keyword gaps, and interview topics.
* 💾 **RAG Preparation Memory:** Built-in semantic RAG debugger for searching and editing cached placement preparation facts.
* 🌓 **Responsive Aesthetics:** Floating glassmorphic headers and nav docks supporting fully customized high-contrast light and dark modes.

---

## 💻 Tech Stack

### Frontend
* **Core:** React.js 18 + TypeScript + Vite + Framer Motion
* **Styling:** TailwindCSS + Custom CSS glassmorphism animations
* **Telemetry Charts:** Recharts
* **Icons:** Lucide React

### Backend
* **Core:** FastAPI (Python 3.13)
* **Database:** SQLite + SQLAlchemy ORM
* **Resume Parsers:** `pypdf` for binary PDF structures, built-in XML zip-decoders for Word documents
* **Security:** JWT authentication tokens + salted bcrypt hashing

---

## 🛠️ Getting Started

### 1. Prerequisites
* Python 3.10+ installed
* Node.js v18+ installed

### 2. Backend Setup
Navigate to the `backend` directory, initialize a virtual environment, install requirements, and seed the database:

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed database with sample jobs, user credentials, and mock topics
python -m app.utils.seed

# Launch the FastAPI app using Uvicorn
uvicorn app.main:app --reload
```
*The FastAPI backend will spin up at `http://127.0.0.1:8000`.*

### 3. Frontend Setup
Navigate to the `frontend` directory, install package dependencies, and launch the Vite development server:

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*The client application will spin up at `http://localhost:5173`.*

---

## 📂 Project Structure

```text
placement-tracker/
├── backend/
│   ├── app/
│   │   ├── api/             # API routes (Auth, Resume, Applications, Mock Interviews)
│   │   ├── core/            # Configuration and database connection setup
│   │   ├── models/          # SQLAlchemy Database schemas
│   │   └── schemas/         # Pydantic validation schemas
│   ├── placepilot.db        # SQLite database
│   ├── seed.py              # Sample database seeder script
│   └── run.py               # Backend main launcher
├── frontend/
│   ├── src/
│   │   ├── components/      # Glassmorphic Sidebar (Header & Dock)
│   │   ├── context/         # React Auth context provider
│   │   ├── pages/           # Dashboard, Kanban, Applications, Resume Matcher views
│   │   ├── App.tsx          # Main routing & layout controller
│   │   └── index.css        # Core stylesheet & ambient animations
│   ├── tailwind.config.js   # Custom HSL Sand, Cocoa & Vermilion configuration
│   └── package.json
└── README.md
```

---

## 🔒 Default Test Credentials
Use these seeded credentials to log in and preview placement tracking analytics immediately:
* **Email:** `student@placepilot.ai`
* **Password:** `password123`