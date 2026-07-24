import asyncio
import websockets
import json

async def run():
    async with websockets.connect('wss://contract.mexc.com/edge') as ws:
        await ws.send(json.dumps({"method": "sub.tickers", "param": {}}))
        print("Connected and subscribed!")
        msg1 = await ws.recv()
        print("MSG1:", msg1)
        msg2 = await ws.recv()
        print("MSG2:", msg2)

asyncio.run(run())
