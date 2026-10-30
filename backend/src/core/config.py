from dotenv import load_dotenv

load_dotenv()

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    redis_url: str


def load_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")
    return Settings(
        database_url=database_url,
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
    )


settings = load_settings()
