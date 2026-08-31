import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Travel Copilot - AI Travel Planner"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "development_secret_key_super_secure_travel_copilot_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # AI and Mock Flags
    USE_MOCK_DATA: bool = True
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Database
    DATABASE_URL: str = "sqlite:///./travel_planner.db"

    # External APIs
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    WEATHER_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
