import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionOut
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/questions", tags=["questions"])

@router.get("", response_model=List[QuestionOut])
def read_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    questions = db.query(Question).filter(Question.user_id == current_user.id).order_by(Question.created_at.desc()).all()
    return questions

@router.post("", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(
    question_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_question = Question(
        user_id=current_user.id,
        **question_in.model_dump()
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question
