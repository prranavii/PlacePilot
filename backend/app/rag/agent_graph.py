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

class DraftStrategyOut(BaseModel):
    estimated_days_remaining: int
    raw_tasks: List[str] = Field(..., description="Initial list of planned preparation tasks")
    readiness_estimation: float = Field(..., description="Initial readiness percentage draft")

class FinalStrategyPlanOut(BaseModel):
    estimated_days_remaining: int
    overall_readiness: float
    topic_readiness: Dict[str, float]
    high_priority_topics: List[str]
    today_mission: List[str] = Field(..., description="Pruned, high-yield tasks that are realistic for the timeline")
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
        logger.info(f"Node 2 (Strategy Planner) output: {len(draft_state.raw_tasks)} drafted tasks")

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
            f"You are the Strategy Planner Agent. Draft an initial list of preparation tasks "
            f"for a candidate applying for the '{app.role}' role at '{app.company_name}'.\n\n"
            f"Target Job Description:\n{app.job_description or 'No JD text.'}\n\n"
            f"Timeline: {days_remaining} days remaining.\n"
            f"Student Core Weaknesses to Target:\n" + "\n".join([f"- {w}" for w in weaknesses]) + "\n\n"
            f"Propose a list of coding, system design, or behavioral tasks. Be concrete."
        )

        return groq_service.structured_generate(
            prompt=prompt,
            response_model=DraftStrategyOut,
            system_prompt="You are an Expert Placement Strategist. Build high-yield, specific interview preparation lists."
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
        prompt = (
            f"You are the Reviewer/Validator Agent. Review the initial draft preparation plan "
            f"for a '{app.role}' role at '{app.company_name}'. Make sure the daily tasks are feasible "
            f"given the timeline constraint of {days_remaining} days remaining. "
            f"If the timeline is short (e.g. less than 3 days), restrict today's mission to a maximum of 2 highly impactful, high-priority tasks. "
            f"Provide constructive developer insights explaining the reasoning.\n\n"
            f"Core Weaknesses Targeted:\n" + "\n".join([f"- {w}" for w in weaknesses]) + "\n\n"
            f"Proposed Draft Tasks:\n" + "\n".join([f"- {t}" for t in draft.raw_tasks]) + "\n\n"
            f"Initial Readiness Draft: {draft.readiness_estimation}%\n\n"
            f"Output the final, polished, timeline-feasible study strategy."
        )

        return groq_service.structured_generate(
            prompt=prompt,
            response_model=FinalStrategyPlanOut,
            system_prompt="You are a Technical Placement Mentor. Refine preparation strategies to be realistic, high-yielding, and actionable."
        )

prepare_agent_graph = PrepareMeAgentGraph()
