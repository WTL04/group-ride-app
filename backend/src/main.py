from contextlib import asynccontextmanager

from fastapi import FastAPI

from .core.db import close_pool
from .routes import live, rides


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    await close_pool()


app = FastAPI(title="group-ride", lifespan=lifespan)
app.include_router(rides.router, prefix="/rides", tags=["rides"])
app.include_router(live.router)


@app.get("/", tags=["health"])
async def root() -> dict[str, str]:
    return {"hello": "world"}
