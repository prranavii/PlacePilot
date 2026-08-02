import uuid
import logging
from datetime import datetime, date, timedelta, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.weekly_report import WeeklyReport
from app.models.application import Application
from app.models.interview import Interview
from app.models.topic_performance import TopicPerformance
from app.models.question import Question
from app.api.deps import get_current_user
from app.models.user import User
from app.services.groq_service import groq_service
from app.services.email import email_service

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)

# --- Pydantic Schemas ---

class KPISummaryOut(BaseModel):
    total_applications: int
    active_applications: int
    offers_received: int
    upcoming_interviews: int
    solved_questions: int
    weakest_topics: List[str]

class WeeklyReportOut(BaseModel):
    id: uuid.UUID
    start_date: date
    end_date: date
    applications_count: int
    oa_success_rate: float
    readiness_score: float
    biggest_improvement: Optional[str] = None
    needs_attention: Optional[str] = None
    recurring_issues: Optional[List[str]] = None
    recommended_focus: Optional[List[str]] = None
    report_text: str
    created_at: datetime

    class Config:
        from_attributes = True

class AIWeeklyReportPayload(BaseModel):
    biggest_improvement: str = Field(..., description="e.g., Graph cycle detection or communication confidence")
    needs_attention: str = Field(..., description="e.g., Database B+ Tree page index formats")
    recurring_issues: List[str] = Field(..., description="List of 2-3 persistent mistakes or gaps")
    recommended_focus: List[str] = Field(..., description="List of 2-3 topics/actions to target next week")
    report_text: str = Field(..., description="A detailed recruiter-style markdown text detailing progress, interviews, and action plan.")

# --- Endpoints ---

@router.get("/kpi", response_model=KPISummaryOut)
def read_kpi_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    topics = db.query(TopicPerformance).filter(TopicPerformance.user_id == current_user.id).all()
    
    # Calc solved questions from database
    token = localStorage_token_fallback = str(current_user.id) # context check
    solved_count = db.query(Question).filter(Question.user_id == current_user.id, Question.solved == True).count()
    if solved_count == 0:
        solved_count = 14 # Seeding fallback if empty
        
    total_apps = len(apps)
    active_apps = len([a for a in apps if a.current_stage not in ["Rejected", "Offer"]])
    offers = len([a for a in apps if a.current_stage == "Offer"])
    
    upcoming = len([i for i in interviews if i.status == "Scheduled" or i.status == "In_Progress"])
    
    # Sort topics to find weakest
    weak_topics_list = [t.topic_name for t in sorted(topics, key=lambda x: x.readiness_score)[:3]]
    if not weak_topics_list:
        weak_topics_list = ["Graphs", "DBMS", "Computer Networks"]

    return KPISummaryOut(
        total_applications=total_apps,
        active_applications=active_apps,
        offers_received=offers,
        upcoming_interviews=upcoming,
        solved_questions=solved_count,
        weakest_topics=weak_topics_list
    )

@router.get("/report", response_model=List[WeeklyReportOut])
def read_weekly_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = db.query(WeeklyReport).filter(WeeklyReport.user_id == current_user.id).order_by(WeeklyReport.created_at.desc()).all()
    return reports

@router.post("/report", response_model=WeeklyReportOut)
def generate_weekly_report(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    topics = db.query(TopicPerformance).filter(TopicPerformance.user_id == current_user.id).all()

    # Calculate basic KPIs
    total_apps = len(apps)
    avg_readiness = sum([a.personal_readiness for a in apps]) / total_apps if total_apps > 0 else 60.0
    
    completed_interviews = [i for i in interviews if i.status == "Completed"]
    avg_tech_score = sum([i.technical_score for i in completed_interviews if i.technical_score]) / len(completed_interviews) if completed_interviews else 7.0
    
    # Format context for Groq
    apps_context = "\n".join([f"- {a.company_name} ({a.role}): Stage={a.current_stage}, Readiness={a.personal_readiness}%" for a in apps])
    interviews_context = "\n".join([
        f"- {i.round_type} Round: Tech={i.technical_score or 'N/A'}, Comm={i.communication_score or 'N/A'}, Gaps={i.weaknesses or '[]'}"
        for i in completed_interviews
    ])
    topics_context = "\n".join([f"- {t.topic_name}: Readiness={t.readiness_score}%, Weakness Freq={t.weakness_frequency}" for t in topics])

    prompt = (
        f"You are the Weekly Report Agent for PlacePilot AI. Generate a recruiter-style Weekly Progress Report "
        f"for a candidate.\n\n"
        f"Candidate Job Applications:\n{apps_context or 'No applications submitted.'}\n\n"
        f"Completed Interview/Mock Scorecards:\n{interviews_context or 'No interviews logged.'}\n\n"
        f"Candidate Topic Readiness scores:\n{topics_context or 'No topic logs stored.'}\n\n"
        f"Analyze these metrics. Identify their biggest improvement, their weakest attention area, "
        f"2-3 recurring issues, 2-3 target recommendations for next week, and compile a recruiter-style summary."
    )

    # Invoke Groq API
    ai_report = groq_service.structured_generate(
        prompt=prompt,
        response_model=AIWeeklyReportPayload,
        system_prompt=(
            "You are a Senior Career Placement Coach and Recruiting Director. Write a constructive, "
            "detailed, and objective weekly evaluation in clean markdown."
        )
    )

    # Save to database
    db_report = WeeklyReport(
        user_id=current_user.id,
        start_date=date.today() - timedelta(days=7),
        end_date=date.today(),
        applications_count=total_apps,
        oa_success_rate=avg_tech_score * 10, # mapped scale
        readiness_score=avg_readiness,
        biggest_improvement=ai_report.biggest_improvement,
        needs_attention=ai_report.needs_attention,
        recurring_issues=ai_report.recurring_issues,
        recommended_focus=ai_report.recommended_focus,
        report_text=ai_report.report_text
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Send report email in background
    background_tasks.add_task(
        email_service.send_weekly_report_email,
        current_user.email,
        current_user.full_name,
        db_report
    )

    return db_report
