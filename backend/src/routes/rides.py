from contextlib import asynccontextmanager
import asyncpg
from fastapi import APIRouter, HTTPException
from ..core.db import get_pool
from ..models.schemas import Ride, RideCreate

router = APIRouter()

_COLUMNS = (
    "ride_id, title, start_location, end_location, "
    "distance_km, difficulty, avg_pace, max_riders"
)


@router.get("/", response_model=list[Ride])
async def list_rides() -> list[Ride]:
    pool = await get_pool()
    rows = await pool.fetch(f"SELECT {_COLUMNS} FROM ride ORDER BY ride_id")
    return [Ride(**dict(row)) for row in rows]


@router.post("/", response_model=Ride, status_code=201)
async def create_ride(body: RideCreate) -> Ride:
    pool = await get_pool()
    try:
        row = await pool.fetchrow(
            """INSERT INTO ride
                   (title, start_location, end_location, distance_km,
                    difficulty, avg_pace, max_riders)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               RETURNING ride_id, title, start_location, end_location,
                         distance_km, difficulty, avg_pace, max_riders""",
            body.title,
            body.start_location,
            body.end_location,
            body.distance_km,
            body.difficulty,
            body.avg_pace,
            body.max_riders,
        )
    except asyncpg.CheckViolationError as exc:
        raise HTTPException(
            status_code=400, detail="ride violates a constraint"
        ) from exc
    assert row is not None
    return Ride(**dict(row))


@router.get("/{ride_id}", response_model=Ride)
async def get_ride(ride_id: int) -> Ride:
    pool = await get_pool()
    row = await pool.fetchrow(
        f"SELECT {_COLUMNS} FROM ride WHERE ride_id = $1", ride_id
    )
    if row is None:
        raise HTTPException(status_code=404, detail="ride not found")
    return Ride(**dict(row))
