// =============================================================================
// Trader Command Center — MEXC Futures REST API Client
// =============================================================================
// Handles all communication with MEXC Futures API endpoints.
// API keys are read from environment variables — NEVER hardcode them.
// =============================================================================

import crypto from 'crypto';

const MEXC_BASE_URL = 'https://contract.mexc.com';

// Rate limiting: MEXC allows ~20 requests per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 55; // ~18 req/s with safety margin

/**
 * Generate HMAC SHA256 signature for MEXC API authentication
 */
function generateSignature(
  apiKey: string,
  apiSecret: string,
  timestamp: string,
  queryString: string = ''
): string {
  const message = `${apiKey}${timestamp}${queryString}`;
  return crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');
}

/**
 * Rate-limited fetch with MEXC authentication headers
 */
async function mexcFetch(
  endpoint: string,
  method: string = 'GET',
  params: Record<string, string | number> = {},
  body?: Record<string, unknown>
): Promise<unknown> {
  const apiKey = process.env.MEXC_API_KEY;
  const apiSecret = process.env.MEXC_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('MEXC_API_KEY and MEXC_API_SECRET must be set in environment variables');
  }

  // Rate limiting
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();

  const timestamp = Date.now().toString();
  
  // Build query string for GET requests
  const queryString = Object.keys(params).length > 0
    ? Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
    : '';

  // Generate signature
  const signPayload = method === 'GET' || method === 'DELETE'
    ? queryString
    : JSON.stringify(body || {});
  
  const signature = generateSignature(apiKey, apiSecret, timestamp, signPayload);

  const url = queryString
    ? `${MEXC_BASE_URL}${endpoint}?${queryString}`
    : `${MEXC_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'ApiKey': apiKey,
    'Request-Time': timestamp,
    'Signature': signature,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MEXC API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

/**
 * Public (unsigned) API request
 */
async function mexcPublicFetch(endpoint: string): Promise<unknown> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();

  const response = await fetch(`${MEXC_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`MEXC API error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

// =============================================================================
// Account Endpoints
// =============================================================================

interface MexcApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  message?: string;
}

/**
 * Get account asset overview (balance, equity, margin)
 */
export async function getAccountAssets() {
  const result = await mexcFetch('/api/v1/private/account/assets') as MexcApiResponse<{
    currency: string;
    availableBalance: number;
    frozenBalance: number;
    positionMargin: number;
    equity: number;
    unrealized: number;
  }[]>;
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch account assets');
  }
  return result.data;
}

/**
 * Get all open positions
 */
export async function getOpenPositions() {
  const result = await mexcFetch('/api/v1/private/position/open_positions') as MexcApiResponse<{
    positionId: string;
    symbol: string;
    holdVol: number;
    holdAvgPrice: number;
    openType: number;
    positionType: number;
    leverage: number;
    state: number;
    unRealizedPnl: number;
    liquidatePrice: number;
    im: number;
    autoAddIm: boolean;
  }[]>;

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch open positions');
  }
  return result.data || [];
}

/**
 * Get all open orders (optionally filter by symbol)
 */
export async function getOpenOrders(symbol?: string) {
  const params: Record<string, string | number> = {};
  if (symbol) params.symbol = symbol;
  
  // Page through results
  params.page_num = 1;
  params.page_size = 50;

  const result = await mexcFetch('/api/v1/private/order/list/open_orders', 'GET', params) as MexcApiResponse<{
    orderId: string;
    symbol: string;
    price: number;
    vol: number;
    dealVol: number;
    orderType: number;
    side: number;
    state: number;
    createTime: number;
    leverage: number;
  }[]>;

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch open orders');
  }
  return result.data || [];
}

/**
 * Get historical closed orders (Filled)
 */
export async function getHistoryOrders(symbol?: string, limit: number = 50) {
  const params: Record<string, string | number> = {};
  if (symbol) params.symbol = symbol;
  
  params.page_num = 1;
  params.page_size = limit;
  params.state = 3; // 3 = Filled (Closed)

  const result = await mexcFetch('/api/v1/private/order/list/history_orders', 'GET', params) as MexcApiResponse<{
    orderId: string;
    symbol: string;
    price: number;
    vol: number;
    dealVol: number;
    orderType: number;
    side: number;
    state: number;
    createTime: number;
    leverage: number;
    openType: number; // 1 = Open position, 2 = Close position
    profit: number;   // Realized PnL
    dealAvgPrice: number; // Average fill price
    fee: number;      // Trading fee
  }[]>;

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch history orders');
  }
  return result.data || [];
}

/**
 * Cancel a specific order
 */
export async function cancelOrder(symbol: string, orderId: string) {
  const result = await mexcFetch(
    '/api/v1/private/order/cancel',
    'POST',
    {},
    { symbol, orderId }
  ) as MexcApiResponse<unknown>;

  if (!result.success) {
    throw new Error(result.message || 'Failed to cancel order');
  }
  return result.data;
}

/**
 * Get available contract/symbol list (public endpoint)
 */
export async function getContractList() {
  const result = await mexcPublicFetch('/api/v1/contract/detail') as MexcApiResponse<{
    symbol: string;
    displayName: string;
    baseCoin: string;
    quoteCoin: string;
    contractSize: number;
    priceUnit: number;
    minVol: number;
    maxVol: number;
    isOpenApi: boolean;
  }[]>;

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch contract list');
  }
  return result.data || [];
}

/**
 * Get ticker data for a symbol (public endpoint)
 */
export async function getTicker(symbol: string) {
  const result = await mexcPublicFetch(`/api/v1/contract/ticker?symbol=${symbol}`) as MexcApiResponse<{
    symbol: string;
    lastPrice: number;
    bid1: number;
    ask1: number;
    volume24: number;
    fairPrice: number;
    riseFallRate: number;
  }>;

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch ticker');
  }
  return result.data;
}

/**
 * Get all tickers (public endpoint)
 */
export async function getAllTickers() {
  const result = await mexcPublicFetch('/api/v1/contract/ticker') as MexcApiResponse<{
    symbol: string;
    lastPrice: number;
    bid1: number;
    ask1: number;
    volume24: number;
    fairPrice: number;
    riseFallRate: number;
  }[]>;

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch tickers');
  }
  return result.data || [];
}
