import logging
import uuid
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.services.groq_service import groq_service
from app.models.application import Application
from app.models.topic_performance import TopicPerformance
from app.models.interview import Interview
from app.rag.memory import search_memory

logger = logging.getLogger(__name__)

# --- Graph Node Validation Schemas ---

class WeaknessAnalysisOut(BaseModel):
    weaknesses: List[str] = Field(..., description="List of specific technical, conceptual, or behavioral gaps identified")
    reasoning: str = Field(..., description="Explanation of why these weaknesses were highlighted")

class StudyPhase(BaseModel):
    phase_name: str = Field(..., description="Name of the preparation phase, e.g. Phase 1: Core Concept Revision")
    duration_days: int = Field(..., description="Number of days allocated to this phase")
    focus_areas: List[str] = Field(..., description="Focus skills, topics, or languages for this phase")
    concrete_tasks: List[str] = Field(..., description="Actionable tasks to complete during this phase")

class DraftStrategyOut(BaseModel):
    estimated_days_remaining: int
    study_plan: List[StudyPhase] = Field(..., description="Initial multi-phase study plan draft")
    readiness_estimation: float = Field(..., description="Initial readiness percentage draft")

class FinalStrategyPlanOut(BaseModel):
    estimated_days_remaining: int
    overall_readiness: float
    topic_readiness: Dict[str, float]
    high_priority_topics: List[str]
    study_plan: List[StudyPhase] = Field(..., description="Polished, multi-phase timeline study plan")
    ai_insight: str = Field(..., description="Recruiter-style insight explaining the structured plan")

# --- Agent Graph Orchestrator ---

class PrepareMeAgentGraph:
    """
    Executes a multi-agent orchestration state machine (equivalent to a LangGraph pipeline):
    Weakness Analyzer Node -> Strategy Planner Node -> Validator/Reviewer Node
    """
    
    def run(self, db: Session, user_id: uuid.UUID, application_id: uuid.UUID) -> FinalStrategyPlanOut:
        logger.info(f"Initiating Agentic Prepare Me graph run for application {application_id}")

        # 0. Retrieve Context
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise ValueError("Application not found")
            
        topics = db.query(TopicPerformance).filter(TopicPerformance.user_id == user_id).all()
        interviews = db.query(Interview).filter(Interview.user_id == user_id, Interview.application_id == application_id).all()
        
        # Pull RAG memories matching the company name
        memories = search_memory(db=db, user_id=user_id, query=app.company_name, limit=3)
        memories_text = "\n".join([f"- [{m.content_type}]: {m.content}" for m in memories])

        # Calculate days remaining in timeline
        days_remaining = 7 # default
        if app.deadline:
            import datetime
            if isinstance(app.deadline, datetime.datetime):
                deadline_date = app.deadline.date()
            else:
                deadline_date = app.deadline
            delta = deadline_date - datetime.date.today()
            days_remaining = max(1, delta.days)


        # ----------------------------------------------------
        # NODE 1: Weakness Analyzer Agent
        # ----------------------------------------------------
        weakness_state = self._node_weakness_analyzer(app, topics, interviews, memories_text)
        logger.info(f"Node 1 (Weakness Analyzer) output: {weakness_state.weaknesses}")

        # ----------------------------------------------------
        # NODE 2: Strategy Planner Agent
        # ----------------------------------------------------
        draft_state = self._node_strategy_planner(app, weakness_state.weaknesses, days_remaining)
        logger.info(f"Node 2 (Strategy Planner) output: {len(draft_state.study_plan)} drafted phases")

        # ----------------------------------------------------
        # NODE 3: Validator/Reviewer Agent
        # ----------------------------------------------------
        final_plan = self._node_reviewer_validator(app, weakness_state.weaknesses, draft_state, days_remaining)
        logger.info(f"Node 3 (Validator) output: Plan validated with readiness={final_plan.overall_readiness}%")

        return final_plan

    def _node_weakness_analyzer(
        self, 
        app: Application, 
        topics: List[TopicPerformance], 
        interviews: List[Interview], 
        memories_text: str
    ) -> WeaknessAnalysisOut:
        """
        Analyzes students' past metrics, RAG memories, and interview notes to extract core weakness trends.
        """
        topic_log = "\n".join([f"- {t.topic_name}: Readiness={t.readiness_score}%, Weakness Freq={t.weakness_frequency}" for t in topics])
        interview_log = "\n".join([f"- Round {i.round_number}: Score={i.technical_score}/10, Weaknesses={i.weaknesses}" for i in interviews])

        prompt = (
            f"You are the Weakness Analyzer Agent for SDE placements. Analyze the student's metrics "
            f"and RAG memories to identify their primary weaknesses and knowledge gaps.\n\n"
            f"Student Topic Performance logs:\n{topic_log or 'No performance logs stored.'}\n\n"
            f"Past Interview logs:\n{interview_log or 'No past interviews logged.'}\n\n"
            f"Historical Memory Logs:\n{memories_text or 'No RAG logs found.'}\n\n"
            f"Identify the top 3 weaknesses or topic gaps the candidate must improve for this role."
        )

        return groq_service.structured_generate(
            prompt=prompt,
            response_model=WeaknessAnalysisOut,
            system_prompt="You are a Senior Technical Screener. Analyze candidate histories to extract core technical skill gaps."
        )

    def _node_strategy_planner(
        self, 
        app: Application, 
        weaknesses: List[str], 
        days_remaining: int
    ) -> DraftStrategyOut:
        """
        Synthesizes target JD and identified weaknesses to draft initial study tasks.
        """
        prompt = (
            f"You are the Strategy Planner Agent. Draft a complete, structured, multi-phase preparation plan "
            f"for a candidate applying for the '{app.role}' role at '{app.company_name}'.\n\n"
            f"Target Job Description:\n{app.job_description or 'No JD text.'}\n\n"
            f"Timeline: {days_remaining} days remaining.\n"
            f"Student Core Weaknesses to Target:\n" + "\n".join([f"- {w}" for w in weaknesses]) + "\n\n"
            f"Partition the preparation timeline into logical, sequential preparation phases (e.g. Phase 1: Core Concept Revision, Phase 2: Implementation & Time-boxing, Phase 3: Mock practice & Final checks). "
            f"For each phase, specify the phase_name, duration_days, focus_areas, and a list of detailed, concrete_tasks to complete."
        )

        return groq_service.structured_generate(
            prompt=prompt,
            response_model=DraftStrategyOut,
            system_prompt="You are an Expert Placement Strategist. Build detailed, structured multi-phase preparation plans."
        )

    def _node_reviewer_validator(
        self, 
        app: Application, 
        weaknesses: List[str], 
        draft: DraftStrategyOut, 
        days_remaining: int
    ) -> FinalStrategyPlanOut:
        """
        Reviews draft strategy against the timeline constraint. Prunes excessive tasks to ensure feasibility.
        """
        draft_phases_text = ""
        for p in draft.study_plan:
            draft_phases_text += f"\n- {p.phase_name} ({p.duration_days} days):\n"
            draft_phases_text += "  Focus: " + ", ".join(p.focus_areas) + "\n"
            draft_phases_text += "  Tasks:\n" + "\n".join([f"    * {t}" for t in p.concrete_tasks]) + "\n"

        prompt = (
            f"You are the Reviewer/Validator Agent. Review the initial draft multi-phase preparation plan "
            f"for a '{app.role}' role at '{app.company_name}'. Make sure the daily tasks are feasible "
            f"given the timeline constraint of {days_remaining} days remaining. "
            f"Refine the phases and task details so they are realistic, actionable, and focus heavily on key developer readiness topics.\n\n"
            f"Core Weaknesses Targeted:\n" + "\n".join([f"- {w}" for w in weaknesses]) + "\n\n"
            f"Proposed Draft Phases Plan:\n{draft_phases_text}\n"
            f"Initial Readiness Draft: {draft.readiness_estimation}%\n\n"
            f"Output the final, polished, timeline-feasible structured study strategy containing all phases."
        )

        return groq_service.structured_generate(
            prompt=prompt,
            response_model=FinalStrategyPlanOut,
            system_prompt="You are a Technical Placement Mentor. Refine preparation plans to be realistic, structured, and highly actionable."
        )

prepare_agent_graph = PrepareMeAgentGraph()
