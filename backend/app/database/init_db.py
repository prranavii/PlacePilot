import logging
from sqlalchemy import text
from app.database.session import engine, Base
from app.core.config import settings
import app.models # Import all models to register them on Base


logger = logging.getLogger(__name__)

def init_db():
    try:
        # Only run pgvector setup if we are not using SQLite
        if not settings.DATABASE_URL.startswith("sqlite"):
            with engine.connect() as conn:
                # Enable the pgvector extension if not already present
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
            logger.info("pgvector extension initialized.")
        else:
            logger.info("Using SQLite fallback - skipping pgvector initialization.")
            
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")

        # Ensure users table columns exist for email verification and password resets
        from sqlalchemy import inspect
        inspector = inspect(engine)
        columns = [col["name"] for col in inspector.get_columns("users")]

        # 1. is_verified
        if "is_verified" not in columns:
            try:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT TRUE;"))
                logger.info("Migrated: Added is_verified column to users table.")
            except Exception as e:
                logger.error(f"Failed to add is_verified: {e}")

        # 2. verification_token
        if "verification_token" not in columns:
            try:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);"))
                logger.info("Migrated: Added verification_token column to users table.")
            except Exception as e:
                logger.error(f"Failed to add verification_token: {e}")

        # 3. reset_token
        if "reset_token" not in columns:
            try:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);"))
                logger.info("Migrated: Added reset_token column to users table.")
            except Exception as e:
                logger.error(f"Failed to add reset_token: {e}")

        # 4. reset_expires
        if "reset_expires" not in columns:
            try:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN reset_expires TIMESTAMP;"))
                logger.info("Migrated: Added reset_expires column to users table.")
            except Exception as e:
                logger.error(f"Failed to add reset_expires: {e}")

        # Seed default student user if database is empty
        from app.models.user import User
        from app.core import security
        from sqlalchemy.orm import Session
        
        try:
            with Session(engine) as session:
                student_exists = session.query(User).filter(User.email == "student@placepilot.ai").first()
                if not student_exists:
                    default_student = User(
                        email="student@placepilot.ai",
                        hashed_password=security.get_password_hash("password123"),
                        full_name="Student Pilot",
                        is_verified=True
                    )
                    session.add(default_student)
                    session.commit()
                    logger.info("Seeded default student user: student@placepilot.ai")
        except Exception as seed_err:
            logger.error(f"Could not auto-seed default user: {seed_err}")

        # Ensure study_plan column exists in SQLite database
        if settings.DATABASE_URL.startswith("sqlite"):
            with engine.connect() as conn:
                try:
                    conn.execute(text("SELECT study_plan FROM study_plans LIMIT 1;"))
                except Exception:
                    conn.execute(text("ALTER TABLE study_plans ADD COLUMN study_plan JSON;"))
                    conn.commit()
                    logger.info("Executed SQLite migration: Added study_plan column to study_plans table.")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise e
