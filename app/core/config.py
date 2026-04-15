from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    APP_NAME: str = "MY TODO"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    DATABASE_URL: str = "postgresql://postgres:Qwe123Rty456@localhost:5432/todo_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()