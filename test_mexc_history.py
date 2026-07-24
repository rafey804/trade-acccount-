import os
import time
import hmac
import hashlib
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv('.env.local')

async def main():
    api_key = os.getenv("MEXC_API_KEY")
    api_secret = os.getenv("MEXC_API_SECRET")

    timestamp = str(int(time.time() * 1000))
    params = "page_num=1&page_size=50&state=3"
    sign_str = f"{api_key}{timestamp}{params}"
    signature = hmac.new(api_secret.encode(), sign_str.encode(), hashlib.sha256).hexdigest()

    headers = {
        "ApiKey": api_key,
        "Request-Time": timestamp,
        "Signature": signature,
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://contract.mexc.com/api/v1/private/order/list/history_orders?{params}", headers=headers)
        print(resp.json())

if __name__ == "__main__":
    asyncio.run(main())
