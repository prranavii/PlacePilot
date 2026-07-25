import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.interview import Interview
from app.models.application import Application
from app.models.application_event import ApplicationEvent
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.interview import InterviewOut
from app.services.groq_service import groq_service
from app.rag.memory import save_memory



router = APIRouter(prefix="/journal", tags=["journal"])

@router.get("", response_model=List[InterviewOut])
def read_journal_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Returns both mock and real logged interviews
    entries = db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()
    return entries

class FeedbackSubmission(BaseModel):
    application_id: uuid.UUID
    messy_text: str
    round_type: str = "Technical"

class ParsedFeedbackOut(BaseModel):
    round_type: str
    technical_score: float
    communication_score: float
    strengths: List[str]
    weaknesses: List[str]
    recommendations: str

@router.post("/feedback", response_model=ParsedFeedbackOut)
def parse_messy_feedback(
    submission: FeedbackSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify application ownership
    app = db.query(Application).filter(Application.id == submission.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Construct a descriptive parsing prompt for Groq
    prompt = (
        f"Parse the following messy interview or assessment feedback notes for a "
        f"'{app.role}' role at '{app.company_name}'. Extrapolate technical and communication scores "
        f"on a scale of 0.0 to 10.0. Extract a list of strengths, weaknesses/knowledge gaps, "
        f"and specific preparation recommendations.\n\n"
        f"Student Raw Journal Log:\n"
        f"\"\"\"\n{submission.messy_text}\n\"\"\""
    )

    # Invoke Groq API with structured JSON output enforcement
    parsed = groq_service.structured_generate(
        prompt=prompt,
        response_model=ParsedFeedbackOut,
        system_prompt=(
            f"You are an expert technical recruiter analyzing interview feedback journals for "
            f"'{app.company_name}' placement evaluation. Make constructive, objective, and realistic assessments."
        )
    )

    # 2. Save structured interview to database
    db_interview = Interview(
        application_id=app.id,
        user_id=current_user.id,
        round_number=len(app.interviews) + 1,
        round_type=submission.round_type,
        status="Completed",
        notes=f"Parsed from messy journal notes: {submission.messy_text[:100]}...",
        feedback=submission.messy_text,
        technical_score=parsed.technical_score,
        communication_score=parsed.communication_score,
        conceptual_depth=7.5,
        problem_solving_score=parsed.technical_score,
        strengths=parsed.strengths,
        weaknesses=parsed.weaknesses,
        missed_concepts=parsed.weaknesses,
        recommendations=parsed.recommendations,
        is_mock=False
    )
    db.add(db_interview)
    db.commit()
    
    # Log timeline event
    evt = ApplicationEvent(
        application_id=app.id,
        event_type=f"{submission.round_type} Feedback Logged",
        event_date=db_interview.created_at,
        status="Completed",
        details=f"Messy feedback processed by AI. Tech Score: {parsed.technical_score}/10."
    )
    db.add(evt)
    db.commit()
    
    # RAG vector memory storage hook
    try:
        memory_content = (
            f"Interview Log for {app.company_name} ({app.role}) - {submission.round_type} Round.\n"
            f"Messy Text: {submission.messy_text}\n"
            f"Parsed Technical Score: {parsed.technical_score}/10, Communication Score: {parsed.communication_score}/10.\n"
            f"Strengths: {', '.join(parsed.strengths)}\n"
            f"Weaknesses: {', '.join(parsed.weaknesses)}\n"
            f"Action Recommendations: {parsed.recommendations}"
        )
        save_memory(
            db=db,
            user_id=current_user.id,
            content_type="interview_feedback",
            content=memory_content,
            application_id=app.id,
            metadata_info={"company": app.company_name, "technical_score": parsed.technical_score}
        )
    except Exception as e:
        # Graceful logging in case embedding generation fails
        import logging
        logging.getLogger(__name__).error(f"Failed to log vector memory: {e}")

    
    return ParsedFeedbackOut(
        round_type=submission.round_type,
        technical_score=parsed.technical_score,
        communication_score=parsed.communication_score,
        strengths=parsed.strengths,
        weaknesses=parsed.weaknesses,
        recommendations=parsed.recommendations
    )
