# backend/app/core/config.py
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    ALLOWED_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://127.0.0.1:3000,https://ghostnet.vercel.app"
    
    # Model configuration
    MODEL_REPO: str = "zzephyrr/GhostNetyolo26m"
    MODEL_FILENAME: str = "best.pt"
    HF_TOKEN: str = ""
    CONF_THRESHOLD: float = 0.25
    IOU_THRESHOLD: float = 0.45
    IMG_SIZE: int = 640
    
    # Temporary frame storage directory
    UPLOAD_DIR: str = "uploads"
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
