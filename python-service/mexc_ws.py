"""
MEXC Futures WebSocket Client
Persistent connection to MEXC WebSocket for live ticker data.
Features: auto-reconnect, ping/pong keepalive, exponential backoff.
"""

import asyncio
import json
import logging
from typing import Callable, Awaitable, Optional

import websockets
from websockets.exceptions import ConnectionClosed

logger = logging.getLogger(__name__)

MEXC_WS_URL = "wss://contract.mexc.com/edge"


class MexcWebSocketClient:
    def __init__(self, on_ticker: Callable[[dict], Awaitable[None]]):
        self.on_ticker = on_ticker
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.is_connected = False
        self._reconnect_delay = 1  # Start at 1 second
        self._max_reconnect_delay = 60
        self._should_run = True
        self._subscribed_symbols = set()
        self._ping_task = None

    async def _ping_loop(self):
        """MEXC requires an application-level ping every 10-30 seconds."""
        logger.info("Started MEXC application-level ping loop")
        while self.is_connected and self.ws and self._should_run:
            try:
                await asyncio.sleep(15)
                if self.is_connected and self.ws:
                    logger.debug("Sending application-level ping...")
                    await self.ws.send(json.dumps({"method": "ping"}))
            except asyncio.CancelledError:
                logger.info("Ping loop cancelled")
                break
            except Exception as e:
                logger.error(f"Ping error: {e}")
                break

    async def connect(self):
        """Connect to MEXC WebSocket with auto-reconnect."""
        while self._should_run:
            try:
                logger.info(f"Connecting to MEXC WebSocket: {MEXC_WS_URL}")
                async with websockets.connect(
                    MEXC_WS_URL,
                    ping_interval=None, # Disable standard protocol pings as MEXC ignores them
                    close_timeout=5,
                ) as ws:
                    self.ws = ws
                    self.is_connected = True
                    self._reconnect_delay = 1  # Reset on success
                    logger.info("Connected to MEXC WebSocket")

                    # Start application-level ping task
                    self._ping_task = asyncio.create_task(self._ping_loop())

                    # Subscribe to all contract tickers
                    await ws.send(json.dumps({
                        "method": "sub.tickers",
                        "param": {}
                    }))
                    logger.info("Subscribed to global tickers")

                    # Resubscribe to individual high-frequency tickers if any
                    if self._subscribed_symbols:
                        for symbol in self._subscribed_symbols:
                            await ws.send(json.dumps({
                                "method": "sub.ticker",
                                "param": {"symbol": symbol}
                            }))
                        logger.info(f"Resubscribed to {len(self._subscribed_symbols)} high-frequency tickers")

                    # Listen for messages
                    await self._listen(ws)

            except ConnectionClosed as e:
                logger.warning(f"MEXC WebSocket closed: {e}")
            except Exception as e:
                logger.error(f"MEXC WebSocket error: {e}")
            finally:
                self.is_connected = False
                if self._ping_task:
                    self._ping_task.cancel()

            if not self._should_run:
                break

            # Exponential backoff reconnect
            logger.info(f"Reconnecting in {self._reconnect_delay}s...")
            await asyncio.sleep(self._reconnect_delay)
            self._reconnect_delay = min(
                self._reconnect_delay * 2,
                self._max_reconnect_delay
            )

    async def _listen(self, ws: websockets.WebSocketClientProtocol):
        """Listen for incoming messages and dispatch to handler."""
        async for message in ws:
            try:
                data = json.loads(message)
                channel = data.get("channel", "")

                if channel == "push.tickers":
                    # Batch format: list of tickers
                    ticker_data = data.get("data", {})
                    if isinstance(ticker_data, list):
                        formatted = []
                        for t in ticker_data:
                            formatted.append({
                                "symbol": t.get("symbol", ""),
                                "lastPrice": float(t.get("lastPrice", 0)),
                                "fairPrice": float(t.get("fairPrice", 0)),
                                "bid1": float(t.get("bid1", 0)),
                                "ask1": float(t.get("ask1", 0)),
                                "volume24": float(t.get("volume24", 0)),
                                "riseFallRate": float(t.get("riseFallRate", 0)),
                            })
                        await self.on_ticker(formatted)
                        
                elif channel == "push.ticker":
                    # Single real-time ticker
                    ticker_data = data.get("data", {})
                    if isinstance(ticker_data, dict):
                        formatted = {
                            "symbol": ticker_data.get("symbol", ""),
                            "lastPrice": float(ticker_data.get("lastPrice", 0) or 0),
                            "fairPrice": float(ticker_data.get("fairPrice", 0) or 0),
                            "bid1": float(ticker_data.get("bid1", 0) or 0),
                            "ask1": float(ticker_data.get("ask1", 0) or 0),
                            "volume24": float(ticker_data.get("volume24", 0) or 0),
                            "riseFallRate": float(ticker_data.get("riseFallRate", 0) or 0),
                        }
                        # We send it as a single-element list so the frontend sees it identically
                        await self.on_ticker([formatted])

                elif channel == "push.deal":
                    # Absolute lowest latency, real-time trade stream
                    trade_data = data.get("data", {})
                    symbol = data.get("symbol", "")
                    if isinstance(trade_data, dict) and symbol:
                        formatted = {
                            "symbol": symbol,
                            "lastPrice": float(trade_data.get("p", 0) or 0),
                        }
                        await self.on_ticker([formatted])

                elif channel == "pong":
                    pass  # Keepalive response

            except json.JSONDecodeError:
                logger.warning(f"Failed to parse message: {message[:100]}")
            except Exception as e:
                logger.error(f"Error processing message: {e}")

    async def subscribe_tickers(self, symbols: list[str]):
        """Subscribe to individual high-frequency tickers."""
        # Save them so we can resubscribe on reconnect
        for symbol in symbols:
            self._subscribed_symbols.add(symbol)
            
        if not self.ws or not self.is_connected:
            return
        
        for symbol in symbols:
            # Subscribe to the ticker (provides bid/ask/volume every ~500ms)
            await self.ws.send(json.dumps({
                "method": "sub.ticker",
                "param": {"symbol": symbol}
            }))
            # Subscribe to the deal stream (provides exact execution price every millisecond)
            await self.ws.send(json.dumps({
                "method": "sub.deal",
                "param": {"symbol": symbol}
            }))
            logger.info(f"Subscribed to millisecond trade stream (sub.deal): {symbol}")

    async def disconnect(self):
        """Gracefully disconnect."""
        self._should_run = False
        if self.ws:
            await self.ws.close()
        self.is_connected = False
        logger.info("Disconnected from MEXC WebSocket")
