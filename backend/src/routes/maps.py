from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def maps_health() -> dict[str, str]:
    return {"status": "maps stub"}


