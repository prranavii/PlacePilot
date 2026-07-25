import uuid
import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.interview import Interview
from app.models.application import Application
from app.models.application_event import ApplicationEvent
from app.models.topic_performance import TopicPerformance
from app.api.deps import get_current_user
from app.models.user import User
from app.services.groq_service import groq_service

router = APIRouter(prefix="/mock-interviews", tags=["mock-interviews"])
logger = logging.getLogger(__name__)

# --- Pydantic Schemas ---

class MockStartIn(BaseModel):
    application_id: uuid.UUID

class MockStartOut(BaseModel):
    session_id: uuid.UUID
    question: str
    question_number: int
    total_questions: int

class MockAnswerIn(BaseModel):
    answer_text: str

class MockEvaluationOut(BaseModel):
    technical_score: float = Field(..., description="Technical depth evaluation score on scale of 0.0 to 10.0")
    communication_score: float = Field(..., description="Communication clarity evaluation score on scale of 0.0 to 10.0")
    strengths: List[str] = Field(..., description="Key strengths demonstrated during the interview")
    weaknesses: List[str] = Field(..., description="Identified technical/knowledge gaps or communication issues")
    recommendations: str = Field(..., description="Actionable recommendations for improvement")

class MockAnswerOut(BaseModel):
    completed: bool
    question: Optional[str] = None
    question_number: Optional[int] = None
    total_questions: Optional[int] = None
    scorecard: Optional[MockEvaluationOut] = None

# --- Router Endpoints ---

@router.post("/start", response_model=MockStartOut)
def start_mock_interview(
    payload: MockStartIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify application context
    app = db.query(Application).filter(Application.id == payload.application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application context not found.")
    if app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    # Retrieve weaknesses to adjust question selection
    topics = db.query(TopicPerformance).filter(TopicPerformance.user_id == current_user.id).all()
    weak_topics = [t.topic_name for t in topics if t.readiness_score < 70]

    # Generate first adaptive question using Groq
    prompt = (
        f"You are the Mock Interviewer Agent for PlacePilot AI. Generate the first single, high-yield technical "
        f"or behavioral question for a candidate applying for the '{app.role}' role at '{app.company_name}'.\n\n"
        f"Job Description (JD):\n{app.job_description or 'SDE entry level role.'}\n\n"
        f"Candidate Weak Areas to target: {', '.join(weak_topics) or 'No highlighted gaps.'}\n\n"
        f"Output ONLY a single question string. Do not append pleasantries or introduction."
    )
    
    first_question = groq_service.generate(
        prompt=prompt,
        system_prompt="You are a Senior Technical Lead at a top software corporation conducting a screening interview."
    ).strip()

    if not first_question or len(first_question) < 10:
        first_question = f"Tell me about a challenging project you built, and how you resolved system design constraints."

    # Create new mock interview session in DB
    db_interview = Interview(
        application_id=app.id,
        user_id=current_user.id,
        round_number=len(app.interviews) + 1,
        round_type="AI Mock Interview",
        status="In_Progress",
        is_mock=True,
        notes=json.dumps({
            "history": [],
            "current_question": first_question,
            "question_number": 1,
            "total_questions": 3
        })
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)

    return MockStartOut(
        session_id=db_interview.id,
        question=first_question,
        question_number=1,
        total_questions=3
    )

@router.post("/{session_id}/answer", response_model=MockAnswerOut)
def submit_mock_answer(
    session_id: uuid.UUID,
    payload: MockAnswerIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch interview session
    session = db.query(Interview).filter(Interview.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if session.status != "In_Progress":
        raise HTTPException(status_code=400, detail="This interview session is already completed or inactive.")

    # Parse state notes
    try:
        state = json.loads(session.notes)
    except Exception:
        raise HTTPException(status_code=500, detail="Corrupted interview session logs.")

    history = state.get("history", [])
    current_q = state.get("current_question", "")
    q_num = state.get("question_number", 1)
    tot_q = state.get("total_questions", 3)

    # Append response
    history.append({
        "question": current_q,
        "answer": payload.answer_text
    })

    # Case A: Generate Next Question
    if q_num < tot_q:
        history_text = "\n".join([f"Q: {h['question']}\nA: {h['answer']}" for h in history])
        prompt = (
            f"You are the Mock Interviewer Agent. Based on the previous Q&As, generate the next "
            f"single technical or behavioral question for the candidate.\n\n"
            f"Session Transcript History:\n{history_text}\n\n"
            f"Acknowledge their last response briefly (under 15 words) and ask the next question. "
            f"Output only the conversational question text."
        )
        
        next_q = groq_service.generate(
            prompt=prompt,
            system_prompt="You are a Senior Technical Lead conducting a mock interview. Be direct, professional, and follow up on gaps."
        ).strip()

        if not next_q or len(next_q) < 10:
            next_q = "Explain the concurrency implications of your preferred language's memory safety model."

        # Save updated state
        state["current_question"] = next_q
        state["question_number"] = q_num + 1
        state["history"] = history
        session.notes = json.dumps(state)
        db.commit()

        return MockAnswerOut(
            completed=False,
            question=next_q,
            question_number=q_num + 1,
            total_questions=tot_q
        )

    # Case B: End Session & Evaluate
    else:
        history_text = "\n".join([f"Q: {h['question']}\nA: {h['answer']}" for h in history])
        eval_prompt = (
            f"Evaluate the following complete mock interview transcript. "
            f"Analyze candidate's technical correctness, conceptual depth, communication clarity, "
            f"and overall response delivery.\n\n"
            f"Full Interview Transcript:\n\"\"\"\n{history_text}\n\"\"\""
        )

        evaluation = groq_service.structured_generate(
            prompt=eval_prompt,
            response_model=MockEvaluationOut,
            system_prompt="You are a Senior Technical Recruiter. Provide an honest, detailed, and structured scorecard review."
        )

        # Update SQL columns for the completed session
        session.status = "Completed"
        session.technical_score = evaluation.technical_score
        session.communication_score = evaluation.communication_score
        session.conceptual_depth = (evaluation.technical_score + evaluation.communication_score) / 2
        session.problem_solving_score = evaluation.technical_score
        session.strengths = evaluation.strengths
        session.weaknesses = evaluation.weaknesses
        session.missed_concepts = evaluation.weaknesses
        session.recommendations = evaluation.recommendations
        session.feedback = f"AI Mock Scorecard generated. Tech Score: {evaluation.technical_score}/10."
        session.notes = json.dumps({
            "history": history,
            "completed": True
        })
        db.commit()

        # Log timeline event
        app = db.query(Application).filter(Application.id == session.application_id).first()
        event = ApplicationEvent(
            application_id=session.application_id,
            event_type="AI Mock Interview Completed",
            event_date=session.created_at,
            status="Completed",
            details=f"Completed {session.round_type} session. Tech Score: {evaluation.technical_score}/10. Comm Score: {evaluation.communication_score}/10."
        )

        db.add(event)
        db.commit()

        # Index interview outcome summary to RAG Placement Memory
        try:
            from app.rag.memory import save_memory
            rag_content = (
                f"Completed AI Mock Interview for {app.company_name if app else 'General'} ({app.role if app else 'SDE'}).\n"
                f"Transcript Transcript Summary:\n{history_text[:500]}...\n"
                f"Technical Score: {evaluation.technical_score}/10. Communication Score: {evaluation.communication_score}/10.\n"
                f"Missed Concepts: {', '.join(evaluation.weaknesses)}\n"
                f"Prep Guidance: {evaluation.recommendations}"
            )
            save_memory(
                db=db,
                user_id=current_user.id,
                content_type="mock_interview",
                content=rag_content,
                application_id=session.application_id,
                metadata_info={"score": evaluation.technical_score, "is_mock": True}
            )
        except Exception as e:
            logger.error(f"Failed to log mock result to RAG memory: {e}")

        return MockAnswerOut(
            completed=True,
            scorecard=evaluation
        )
