// No dotenv
const crypto = require('crypto');

async function getHistoryOrders() {
  const apiKey = process.env.MEXC_API_KEY;
  const apiSecret = process.env.MEXC_API_SECRET;
  
  const params = {
    page_num: 1,
    page_size: 100,
    state: 3
  };
  
  const timestamp = Date.now().toString();
  const queryString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
    
  const signPayload = queryString;
  const message = `${apiKey}${timestamp}${signPayload}`;
  const signature = crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
  
  const url = `https://contract.mexc.com/api/v1/private/order/list/history_orders?${queryString}`;
  const headers = {
    'ApiKey': apiKey,
    'Request-Time': timestamp,
    'Signature': signature,
    'Content-Type': 'application/json',
  };
  
  const res = await fetch(url, { headers });
  const data = await res.json();
  console.log("Total orders response:", data);
  if (data.data) {
    let todayPnlUtc = 0;
    let todayPnlUtc8 = 0;

    data.data.forEach(o => {
      const t = new Date(o.createTime);
      const isUtcToday = t.toISOString().startsWith('2026-07-24');
      
      // UTC+8 today started at 2026-07-23 16:00:00 UTC
      const startUtc8 = new Date('2026-07-23T16:00:00Z');
      const isUtc8Today = t >= startUtc8;

      const pnlWithFee = (o.profit || 0) + (o.fee || 0);

      if (isUtcToday) todayPnlUtc += pnlWithFee;
      if (isUtc8Today) todayPnlUtc8 += pnlWithFee;
    });

    console.log("Total PNL (UTC Today, 2026-07-24):", todayPnlUtc);
    console.log("Total PNL (UTC+8 Today, since 23rd 16:00 UTC):", todayPnlUtc8);
  }
}
getHistoryOrders();
