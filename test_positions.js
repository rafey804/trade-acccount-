const crypto = require('crypto');
async function test() {
  const apiKey = 'mx0vgl6hCaHSM1s0xM';
  const apiSecret = '6c3b1f6570314beeb0a72cdb466d182b';
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac('sha256', apiSecret).update(`${apiKey}${timestamp}`).digest('hex');
  const res = await fetch(`https://contract.mexc.com/api/v1/private/position/open_positions`, {
    headers: { 'ApiKey': apiKey, 'Request-Time': timestamp, 'Signature': signature }
  });
  console.log(await res.json());
}
test();
