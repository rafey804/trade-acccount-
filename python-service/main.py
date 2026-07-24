"""
Trader Command Center — Python FastAPI WebSocket Bridge
Maintains a persistent connection to MEXC Futures WebSocket and relays
live ticker data to the Next.js frontend. Also snapshots account balance
to Supabase for the equity curve.
"""

import asyncio
import json
import os
import time
import logging
from datetime import datetime, timedelta, timezone
from typing import Set

from dotenv import load_dotenv
load_dotenv()

import httpx
import hmac
import hashlib
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from mexc_ws import MexcWebSocketClient

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Global state
connected_clients: Set[WebSocket] = set()
mexc_client: MexcWebSocketClient | None = None
snapshot_task: asyncio.Task | None = None


async def snapshot_balance():
    """Periodically snapshot account balance to Supabase for equity curve."""
    api_key = os.getenv("MEXC_API_KEY", "")
    api_secret = os.getenv("MEXC_API_SECRET", "")
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")

    if not all([api_key, api_secret, supabase_url, supabase_key]):
        logger.warning("Missing env vars for balance snapshots — skipping")
        return

    while True:
        try:
            # Fetch balance from MEXC
            timestamp = str(int(time.time() * 1000))
            sign_str = f"{api_key}{timestamp}"
            signature = hmac.new(
                api_secret.encode(), sign_str.encode(), hashlib.sha256
            ).hexdigest()

            headers = {
                "ApiKey": api_key,
                "Request-Time": timestamp,
                "Signature": signature,
                "Content-Type": "application/json",
            }

            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://contract.mexc.com/api/v1/private/account/assets",
                    headers=headers,
                    timeout=10,
                )
                data = resp.json()

            if data.get("success") and data.get("data"):
                usdt = next(
                    (a for a in data["data"] if a.get("currency") == "USDT"),
                    None,
                )
                if usdt:
                    # Insert into Supabase
                    async with httpx.AsyncClient() as client:
                        await client.post(
                            f"{supabase_url}/rest/v1/equity_snapshots",
                            headers={
                                "apikey": supabase_key,
                                "Authorization": f"Bearer {supabase_key}",
                                "Content-Type": "application/json",
                                "Prefer": "return=minimal",
                            },
                            json={
                                "total_equity": usdt.get("equity", 0),
                                "available_balance": usdt.get("availableBalance", 0),
                                "unrealized_pnl": usdt.get("unrealizedPnl", 0),
                            },
                            timeout=10,
                        )
                    logger.info(
                        f"Balance snapshot: equity={usdt.get('equity', 0)}"
                    )

        except Exception as e:
            logger.error(f"Snapshot error: {e}")

        # Sleep 15 minutes between snapshots
        await asyncio.sleep(15 * 60)


async def broadcast_ticker(data: dict):
    """Broadcast ticker data to all connected WebSocket clients."""
    if not connected_clients:
        return
    message = json.dumps({"type": "ticker", "data": data, "timestamp": int(time.time() * 1000)})
    disconnected = set()
    for client in connected_clients:
        try:
            await client.send_text(message)
        except Exception:
            disconnected.add(client)
    connected_clients.difference_update(disconnected)


async def sync_closed_positions():
    """Periodically fetch closed positions from MEXC and sync them to Supabase journal_entries."""
    api_key = os.getenv("MEXC_API_KEY", "")
    api_secret = os.getenv("MEXC_API_SECRET", "")
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")

    if not all([api_key, api_secret, supabase_url, supabase_key]):
        logger.warning("Missing env vars for auto-sync — skipping")
        return

    while True:
        try:
            timestamp = str(int(time.time() * 1000))
            params = "page_num=1&page_size=100&state=3"
            sign_str = f"{api_key}{timestamp}{params}"
            signature = hmac.new(
                api_secret.encode(), sign_str.encode(), hashlib.sha256
            ).hexdigest()

            headers = {
                "ApiKey": api_key,
                "Request-Time": timestamp,
                "Signature": signature,
                "Content-Type": "application/json",
            }

            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://contract.mexc.com/api/v1/private/order/list/history_orders?{params}",
                    headers=headers,
                    timeout=10,
                )
                data = resp.json()

            if data.get("success") and data.get("data"):
                history = data["data"]
                close_orders = [o for o in history if o.get("openType") == 2 and o.get("profit", 0) != 0]
                inserted_count = 0

                now_utc = datetime.now(timezone.utc)
                yesterday = (now_utc - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
                cutoff_ms = yesterday.timestamp() * 1000

                async with httpx.AsyncClient() as client:
                    for order in close_orders:
                        if order.get("createTime", 0) < cutoff_ms:
                            continue
                        
                        side = order.get("side")
                        is_long = (side == 2 or side == 4)
                        direction = "Long" if is_long else "Short"

                        # Convert MEXC timestamp to ISO string for Supabase
                        trade_date = datetime.utcfromtimestamp(order.get("createTime") / 1000.0).isoformat() + "Z"
                        # Include estimated round-trip fee
                        pnl = order.get("profit", 0) + (order.get("fee", 0) * 2)
                        
                        result = "Breakeven"
                        if pnl > 0: result = "Win"
                        elif pnl < 0: result = "Loss"
                        
                        symbol = order.get("symbol")
                        position_size = order.get("dealVol")

                        # Deduplication check
                        query_url = f"{supabase_url}/rest/v1/journal_entries?trade_date=eq.{trade_date}&symbol=eq.{symbol}&position_size=eq.{position_size}&direction=eq.{direction}&select=id"
                        check_resp = await client.get(
                            query_url,
                            headers={
                                "apikey": supabase_key,
                                "Authorization": f"Bearer {supabase_key}",
                            },
                            timeout=10
                        )
                        existing = check_resp.json()
                        
                        if not existing:
                            insert_url = f"{supabase_url}/rest/v1/journal_entries"
                            await client.post(
                                insert_url,
                                headers={
                                    "apikey": supabase_key,
                                    "Authorization": f"Bearer {supabase_key}",
                                    "Content-Type": "application/json",
                                    "Prefer": "return=minimal"
                                },
                                json={
                                    "trade_date": trade_date,
                                    "symbol": symbol,
                                    "direction": direction,
                                    "entry_price": order.get("dealAvgPrice"),
                                    "exit_price": order.get("dealAvgPrice"),
                                    "position_size": position_size,
                                    "leverage": order.get("leverage", 1),
                                    "result": result,
                                    "pnl": pnl,
                                    "setup": "Auto-Synced",
                                    "reasoning": f"Auto-synced from MEXC. Order ID: {order.get('orderId')}"
                                },
                                timeout=10
                            )
                            inserted_count += 1

                if inserted_count > 0:
                    logger.info(f"Auto-synced {inserted_count} new closed positions to journal")

        except Exception as e:
            logger.error(f"Auto-sync error: {e}")

        # Sleep 5 minutes between syncs
        await asyncio.sleep(5 * 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start MEXC WebSocket and balance snapshot on app startup."""
    global mexc_client, snapshot_task, sync_task

    # Start MEXC WebSocket
    mexc_client = MexcWebSocketClient(on_ticker=broadcast_ticker)
    asyncio.create_task(mexc_client.connect())

    # Start balance snapshot
    snapshot_task = asyncio.create_task(snapshot_balance())
    
    # Start auto-sync for closed positions
    sync_task = asyncio.create_task(sync_closed_positions())

    logger.info("WebSocket bridge started")
    yield

    # Cleanup
    if mexc_client:
        await mexc_client.disconnect()
    if snapshot_task:
        snapshot_task.cancel()
    if sync_task:
        sync_task.cancel()
    logger.info("WebSocket bridge stopped")


app = FastAPI(title="Trader Command Center — WebSocket Bridge", lifespan=lifespan)

# CORS — allow the frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "connected_clients": len(connected_clients),
        "mexc_connected": mexc_client.is_connected if mexc_client else False,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for frontend clients."""
    await websocket.accept()
    connected_clients.add(websocket)
    logger.info(f"Client connected. Total: {len(connected_clients)}")

    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to MEXC WebSocket Bridge",
            "timestamp": int(time.time() * 1000),
        })

        # Keep connection alive and handle pings/subscriptions
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
            else:
                try:
                    parsed = json.loads(data)
                    if parsed.get("type") == "subscribe" and "symbols" in parsed:
                        if mexc_client:
                            await mexc_client.subscribe_tickers(parsed["symbols"])
                except json.JSONDecodeError:
                    pass

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        connected_clients.discard(websocket)
        logger.info(f"Client disconnected. Total: {len(connected_clients)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8765")))
