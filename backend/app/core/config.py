import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    DATABASE_URL: str = "postgresql://postgres:postgrespassword@localhost:5432/placepilot"
    
    SECRET_KEY: str = "supersecretjwtkeychangeitinproduction123456"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TEMPERATURE: float = 0.7
    
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

settings = Settings()
