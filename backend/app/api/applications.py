import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.application import Application
from app.models.application_event import ApplicationEvent
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut
from app.schemas.event import ApplicationEventOut
from app.api.deps import get_current_user
from app.models.user import User
from app.services.groq_service import groq_service
from app.models.topic_performance import TopicPerformance
from app.models.interview import Interview
from app.models.assessment import Assessment
from app.models.study_plan import StudyPlan
from app.models.study_task import StudyTask
from app.schemas.study import StudyPlanOut
from pydantic import BaseModel
from typing import Dict


router = APIRouter(prefix="/applications", tags=["applications"])

@router.get("", response_model=List[ApplicationOut])
def read_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    return apps

@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_app = Application(
        user_id=current_user.id,
        company_name=app_in.company_name,
        role=app_in.role,
        job_description=app_in.job_description,
        package_ctc=app_in.package_ctc,
        location=app_in.location,
        job_type=app_in.job_type,
        application_source=app_in.application_source,
        application_url=app_in.application_url,
        date_applied=app_in.date_applied,
        deadline=app_in.deadline,
        current_stage=app_in.current_stage,
        notes=app_in.notes,
        priority=app_in.priority,
        resume_version=app_in.resume_version,
        skills_required=app_in.skills_required,
        personal_readiness=app_in.personal_readiness
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    
    # Proactively log an event
    event = ApplicationEvent(
        application_id=db_app.id,
        event_type="Application Created",
        event_date=db_app.created_at,
        status="Completed",
        details=f"Job application added to stage: {db_app.current_stage}."
    )
    db.add(event)
    db.commit()
    
    return db_app

@router.get("/{id}", response_model=ApplicationOut)
def read_application(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this application")
    return app

@router.put("/{id}", response_model=ApplicationOut)
def update_application(
    id: uuid.UUID,
    app_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this application")
    
    # Store old stage to see if it changed
    old_stage = app.current_stage
    
    # Update fields
    update_data = app_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(app, field, value)
        
    db.commit()
    db.refresh(app)
    
    # Log stage change event if stage was updated
    if app_in.current_stage and app_in.current_stage != old_stage:
        event = ApplicationEvent(
            application_id=app.id,
            event_type="Stage Changed",
            event_date=app.updated_at,
            status="Completed",
            details=f"Stage changed from '{old_stage}' to '{app.current_stage}'."
        )
        db.add(event)
        db.commit()
        
    return app

@router.delete("/{id}", response_model=ApplicationOut)
def delete_application(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this application")
    
    db.delete(app)
    db.commit()
    return app

@router.get("/{id}/events", response_model=List[ApplicationEventOut])
def read_application_events(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    events = db.query(ApplicationEvent).filter(ApplicationEvent.application_id == id).order_by(ApplicationEvent.event_date.asc()).all()
    return events

class PrepareMeStrategyOut(BaseModel):
    estimated_days_remaining: int
    overall_readiness: float
    topic_readiness: Dict[str, float]
    high_priority_topics: List[str]
    study_plan: List[dict]
    ai_insight: str

@router.post("/{id}/prepare", response_model=StudyPlanOut)
def prepare_application_strategy(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # 1. Retrieve Candidate Placement History Context
    topics = db.query(TopicPerformance).filter(TopicPerformance.user_id == current_user.id).all()
    # 3. Execute the Multi-Agent State Machine Graph Orchestration (Weakness Analyzer -> Planner -> Validator)
    from app.rag.agent_graph import prepare_agent_graph
    strategy = prepare_agent_graph.run(db=db, user_id=current_user.id, application_id=id)


    # 4. Deactivate old plans
    db.query(StudyPlan).filter(StudyPlan.application_id == id).update({"active": False})
    db.commit()

    # 5. Save Study Plan to database
    flat_today_mission = [t for phase in strategy.study_plan for t in phase.concrete_tasks][:4]
    db_plan = StudyPlan(
        application_id=app.id,
        user_id=current_user.id,
        title=f"Strategy for {app.company_name}",
        target_date=app.deadline,
        readiness_at_generation=strategy.overall_readiness,
        weak_areas=strategy.high_priority_topics,
        today_mission=flat_today_mission,
        study_plan=[phase.model_dump() for phase in strategy.study_plan],
        ai_insight=strategy.ai_insight,
        active=True
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    # 6. Save Study Tasks to database
    all_tasks = [t for phase in strategy.study_plan for t in phase.concrete_tasks]
    for idx, task_title in enumerate(all_tasks):
        # Extract a topic from task title if possible
        topic_match = "DSA"
        for t in topics:
            if t.topic_name.lower() in task_title.lower():
                topic_match = t.topic_name
                break
                
        db_task = StudyTask(
            user_id=current_user.id,
            study_plan_id=db_plan.id,
            application_id=app.id,
            title=task_title,
            topic=topic_match,
            company_name=app.company_name,
            priority="High" if idx < 2 else "Medium",
            status="Todo",
            source_reason=f"AI recommended for {app.company_name} prep",
            ai_generated=True
        )
        db.add(db_task)
        
    db.commit()
    
    # Reload study plan to fetch relationships (tasks)
    db.refresh(db_plan)
    
    # Log stage event
    event = ApplicationEvent(
        application_id=app.id,
        event_type="Prep Strategy Generated",
        event_date=db_plan.created_at,
        status="Completed",
        details=f"AI Copilot generated a multi-phase strategy plan with {len(strategy.study_plan)} phases. Readiness estimated at {strategy.overall_readiness}%."
    )
    db.add(event)
    db.commit()
    
    return db_plan


