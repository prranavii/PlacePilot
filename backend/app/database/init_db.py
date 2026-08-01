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
