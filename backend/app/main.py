from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.init_db import init_db
from app.api import auth, applications, journal, resume, memory, mock_interview, analytics, questions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database and tables on startup
    logger.info("Initializing database...")
    init_db()
    
    # Pre-initialize embedding model on main thread to prevent AnyIO worker thread access violations on Windows
    try:
        from app.rag.embeddings import embedding_service
        logger.info("Pre-initializing embedding model on main thread...")
        _ = embedding_service.model
    except Exception as e:
        logger.error(f"Failed to pre-initialize embedding model on startup: {e}")
        
    yield
    logger.info("Shutting down application...")


app = FastAPI(
    title="PlacePilot AI API",
    description="Placement Tracker & AI Copilot Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include API Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(journal.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")
app.include_router(memory.router, prefix="/api/v1")
app.include_router(mock_interview.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(questions.router, prefix="/api/v1")


@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy", "service": "PlacePilot AI API"}
