import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

# Calculate absolute path to the backend directory
core_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.dirname(core_dir)
backend_dir = os.path.dirname(app_dir)
env_path = os.path.join(backend_dir, ".env")

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=env_path, case_sensitive=True, extra="ignore")

    DATABASE_URL: str = "postgresql://postgres:postgrespassword@localhost:5432/placepilot"
    
    SECRET_KEY: str = "supersecretjwtkeychangeitinproduction123456"
    print(f"Loading env from {env_path}")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TEMPERATURE: float = 0.7
    
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    def __init__(self, **values):
        super().__init__(**values)
        # Resolve relative SQLite path to absolute path inside backend directory
        if self.DATABASE_URL.startswith("sqlite:///./"):
            db_name = self.DATABASE_URL.replace("sqlite:///./", "")
            self.DATABASE_URL = f"sqlite:///{os.path.join(backend_dir, db_name)}"

settings = Settings()

