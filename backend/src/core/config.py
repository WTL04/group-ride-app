# TODO: Set up redis configuration
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    redis_url: str


def load_settings() -> Settings:
    return Settings(redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"))


settings = load_settings()
