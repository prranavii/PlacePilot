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

