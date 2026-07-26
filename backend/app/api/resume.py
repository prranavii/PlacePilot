from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import io
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader
from pydantic import BaseModel, Field


from app.services.groq_service import groq_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/resume", tags=["resume"])

class ParsedResumeOut(BaseModel):
    text: str


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

@router.post("/parse", response_model=ParsedResumeOut)
async def parse_resume_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    filename = file.filename.lower()
    extracted_text = ""

    if filename.endswith(".pdf"):
        try:
            pdf_file = io.BytesIO(contents)
            reader = PdfReader(pdf_file)
            text_list = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text_list.append(t)
            extracted_text = "\n".join(text_list)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse PDF file: {str(e)}"
            )
    elif filename.endswith(".docx"):
        try:
            docx_file = io.BytesIO(contents)
            with zipfile.ZipFile(docx_file) as docx:
                xml_content = docx.read('word/document.xml')
                root = ET.fromstring(xml_content)
                text_list = []
                for elem in root.iter():
                    if elem.tag.endswith('t') and elem.text:
                        text_list.append(elem.text)
                extracted_text = " ".join(text_list)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse Word Document: {str(e)}"
            )
    elif filename.endswith((".txt", ".md")):
        try:
            extracted_text = contents.decode("utf-8")
        except UnicodeDecodeError:
            try:
                extracted_text = contents.decode("latin-1")
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to decode text file: {str(e)}"
                )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload .pdf, .docx, or .txt files."
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parsed file content is empty."
        )

    return ParsedResumeOut(text=extracted_text)

