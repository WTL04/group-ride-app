from typing import Literal

from pydantic import BaseModel, Field

Difficulty = Literal["challenging", "intermediate", "casual"]


class RideCreate(BaseModel):
    title: str = Field(min_length=1, max_length=50)
    start_location: str | None = Field(default=None, max_length=50)
    end_location: str | None = Field(default=None, max_length=50)
    distance_km: float | None = None
    difficulty: Difficulty | None = None
    avg_pace: float | None = None
    max_riders: int | None = Field(default=None, ge=1, le=50)


class Ride(RideCreate):
    ride_id: int
