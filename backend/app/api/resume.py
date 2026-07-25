from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.services.groq_service import groq_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/resume", tags=["resume"])

class ResumeJDMatchIn(BaseModel):
    resume_text: str
    jd_text: str

class ResumeJDMatchOut(BaseModel):
    match_percentage: float = Field(..., description="Calculated matching ratio on a scale of 0.0 to 100.0")
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    keyword_gaps: List[str] = Field(default_factory=list)
    likely_interview_areas: List[str] = Field(default_factory=list)
    explanation: str = Field(..., description="Explain details on how the match ratio was calculated")

@router.post("/match", response_model=ResumeJDMatchOut)
def calculate_resume_jd_match(
    payload: ResumeJDMatchIn,
    current_user: User = Depends(get_current_user)
):
    if not payload.resume_text.strip() or not payload.jd_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text and Job description text cannot be empty."
        )

    # Prompt constructing the matching agent logic
    prompt = (
        f"You are a Resume Matching Agent. Analyze the following candidate Resume Text "
        f"against the target Job Description (JD). Calculate a structured Resume-Role Match percentage. "
        f"Extract matched skills, missing skills/preferred skills gaps, keyword gaps, likely interview areas, "
        f"and provide a detailed explanation of your calculations.\n\n"
        f"Candidate Resume Text:\n\"\"\"\n{payload.resume_text}\n\"\"\"\n\n"
        f"Target Job Description:\n\"\"\"\n{payload.jd_text}\n\"\"\""
    )

    # Invoke Groq API with structured JSON output enforcement
    match_result = groq_service.structured_generate(
        prompt=prompt,
        response_model=ResumeJDMatchOut,
        system_prompt=(
            "You are a Senior Technical Recruiter and Career Coach. Be honest, objective, "
            "and constructive in your matching calculations. Avoid overly generous scores."
        )
    )

    return match_result
