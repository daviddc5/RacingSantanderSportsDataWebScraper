import os
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = Field(alias='SUPABASE_PROJECT_URL')
    supabase_key: str = Field(alias='SUPABASE_API_KEY')
    supabase_password: Optional[str] = Field(default=None, alias='SUPABASE_PW')
    
    class Config:
        env_file = ".env"


# Global settings instance
settings = Settings() 