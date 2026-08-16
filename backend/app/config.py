from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    app_name: str = 'UG Voting Backend'
    api_prefix: str = '/api'
    database_url: str = 'sqlite:///./ug_voting.db'
    jwt_secret_key: str = Field(default='change-this-secret-in-production')
    jwt_algorithm: str = 'HS256'
    jwt_expire_minutes: int = 60 * 12
    otp_expire_minutes: int = 5
    voting_session_expire_minutes: int = 30
    cors_origins: str = 'http://localhost:3000,http://127.0.0.1:3000,https://ug-voting-system.vercel.app,https://ug-voting-system-16h5.vercel.app/api/voter/request-otp'

    smtp_host: str = ''
    smtp_port: int = 587
    smtp_username: str = ''
    smtp_password: str = ''
    smtp_from_email: str = 'noreply@ug.edu.gh'
    smtp_use_tls: bool = True
    smtp_enabled: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
