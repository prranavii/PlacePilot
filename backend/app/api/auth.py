from datetime import timedelta, datetime, timezone
import secrets
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from app.api.deps import get_current_user
from app.services.email import email_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Generate verification token
    verification_token = secrets.token_urlsafe(32)
    
    # Create new user
    db_user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_verified=False,
        verification_token=verification_token
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send verification email asynchronously
    background_tasks.add_task(
        email_service.send_verification_email,
        db_user.email,
        db_user.full_name,
        db_user.verification_token
    )
    
    return db_user

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your email address before logging in."
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login_json(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your email address before logging in."
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/verify", status_code=status.HTTP_200_OK)
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token."
        )
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully. You can now log in."}

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        reset_token = secrets.token_urlsafe(32)
        reset_expires = (datetime.now(timezone.utc) + timedelta(minutes=30)).replace(tzinfo=None)
        
        user.reset_token = reset_token
        user.reset_expires = reset_expires
        db.commit()
        
        background_tasks.add_task(
            email_service.send_password_reset_email,
            user.email,
            user.full_name,
            user.reset_token
        )
    # Always return success to prevent user enumeration
    return {"message": "If this email is registered, a password reset link has been sent."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    user = db.query(User).filter(
        User.reset_token == payload.token,
        User.reset_expires > now
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )
        
    user.hashed_password = security.get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_expires = None
    db.commit()
    
    return {"message": "Password reset successfully. You can now log in with your new password."}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/auto-verify-all")
def auto_verify_all(db: Session = Depends(get_db)):
    db.query(User).update({User.is_verified: True})
    db.commit()
    return {"message": "All users in database verified successfully."}

@router.get("/clear-db")
def clear_db(db: Session = Depends(get_db)):
    from app.models.user import User
    from app.database.init_db import init_db
    
    # Delete all users (cascade deletes applications, questions, weekly reports, resumes, etc.)
    db.query(User).delete()
    db.commit()
    
    # Re-run seeder to recreate the default student account
    init_db()
    
    return {"message": "Database wiped successfully. You can now register a fresh account or log in with the default test user."}

@router.get("/debug-db")
def debug_db(db: Session = Depends(get_db)):
    from sqlalchemy import inspect, text
    from app.database.session import engine
    import traceback
    
    try:
        inspector = inspect(engine)
        columns = [{"name": col["name"], "type": str(col["type"])} for col in inspector.get_columns("users")]
        
        # Test executing a migration inside the request to catch the traceback
        migration_results = {}
        for col_name, col_sql in [
            ("is_verified", "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT TRUE;"),
            ("verification_token", "ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);"),
            ("reset_token", "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);"),
            ("reset_expires", "ALTER TABLE users ADD COLUMN reset_expires TIMESTAMP;")
        ]:
            if col_name not in [c["name"] for c in columns]:
                try:
                    with engine.begin() as conn:
                        conn.execute(text(col_sql))
                    migration_results[col_name] = "Success"
                except Exception as ex:
                    migration_results[col_name] = f"Failed: {str(ex)}\n{traceback.format_exc()}"
                    
        return {
            "status": "success",
            "columns": columns,
            "migrations_attempted": migration_results
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }
