from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/rides/{ride_id}/live")
async def live(websocket: WebSocket, ride_id: int) -> None:
    """Live position channel (skeleton: echo only).

    TODO (core loop): verify ride-scoped guest token on connect,
    publish positions to Redis pub/sub for cross-instance fan-out,
    track last-seen per rider so stale positions never look live.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            await websocket.send_json({"ride_id": ride_id, "echo": data})
    except WebSocketDisconnect:
        pass
