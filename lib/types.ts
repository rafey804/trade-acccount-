// =============================================================================
// Trader Command Center — Core Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// MEXC API Types
// -----------------------------------------------------------------------------

/** MEXC Futures account asset summary */
export interface MexcAccountAsset {
  currency: string;
  availableBalance: number;
  frozenBalance: number;
  positionMargin: number;
  equity: number;
  unrealizedPnl: number;
}

/** MEXC Futures open position */
export interface MexcPosition {
  positionId: string;
  symbol: string;
  holdVol: number;        // Position size (contracts)
  holdAvgPrice: number;   // Average entry price
  openType: number;       // 1 = isolated, 2 = cross
  positionType: number;   // 1 = long, 2 = short
  leverage: number;
  state: number;
  unrealizedPnl: number;
  liquidatePrice: number;
  markPrice?: number;     // Populated from WebSocket
  im: number;             // Initial margin
  autoAddIm: boolean;
}

/** MEXC Futures open order */
export interface MexcOrder {
  orderId: string;
  symbol: string;
  price: number;
  vol: number;            // Order quantity
  dealVol: number;        // Filled quantity
  orderType: number;      // 1=limit, 2=PostOnly, 3=IOC, 4=FOK, 5=market
  side: number;           // 1=open long, 2=close short, 3=open short, 4=close long
  state: number;          // Order state
  createTime: number;     // Timestamp ms
  leverage: number;
}

/** MEXC contract/symbol info */
export interface MexcContract {
  symbol: string;
  displayName: string;
  baseCoin: string;
  quoteCoin: string;
  contractSize: number;
  priceUnit: number;
  minVol: number;
  maxVol: number;
  isOpenApi: boolean;
}

/** WebSocket ticker update from MEXC */
export interface MexcTickerUpdate {
  symbol: string;
  lastPrice: number;
  fairPrice: number;
  bid1: number;
  ask1: number;
  volume24: number;
  riseFallRate: number;  // 24h price change rate
  timestamp: number;
}

// -----------------------------------------------------------------------------
// Dashboard Types
// -----------------------------------------------------------------------------

/** Processed account overview for the dashboard */
export interface AccountOverview {
  totalEquity: number;
  availableBalance: number;
  marginUsed: number;
  unrealizedPnl: number;
  currency: string;
}

/** Realized PnL for different time periods */
export interface RealizedPnlSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

/** Equity snapshot for charting */
export interface EquitySnapshot {
  id: string;
  recordedAt: string;
  totalEquity: number;
  availableBalance: number;
  unrealizedPnl: number;
}

/** Asset allocation entry for donut chart */
export interface AssetAllocation {
  symbol: string;
  value: number;
  percentage: number;
  side: 'Long' | 'Short';
}

// -----------------------------------------------------------------------------
// Trading Journal Types
// -----------------------------------------------------------------------------

/** Setup types for journal entries */
export type TradeSetup =
  | 'Liquidity Sweep'
  | 'Order Block'
  | 'FVG'
  | 'Breakout'
  | 'Custom';

/** Trade result */
export type TradeResult = 'Win' | 'Loss' | 'Breakeven';

/** Trade direction */
export type TradeDirection = 'Long' | 'Short';

/** Journal entry — matches Supabase schema */
export interface JournalEntry {
  id: string;
  created_at: string;
  trade_date: string;
  symbol: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number | null;
  position_size: number;
  leverage: number;
  result: TradeResult | null;
  pnl: number | null;
  setup: TradeSetup | string | null;
  reasoning: string | null;
  mistake: string | null;
  lesson: string | null;
  emotion_rating: number | null;
  before_screenshot_url: string | null;
  after_screenshot_url: string | null;
  updated_at: string;
}

/** Form data for creating/editing a journal entry */
export interface JournalFormData {
  trade_date: string;
  symbol: string;
  direction: TradeDirection;
  entry_price: string;
  exit_price: string;
  position_size: string;
  leverage: string;
  result: TradeResult | null;
  pnl: string;
  setup: string;
  reasoning: string;
  mistake: string;
  lesson: string;
  emotion_rating: number;
  before_screenshot: File | null;
  after_screenshot: File | null;
  before_screenshot_url: string | null;
  after_screenshot_url: string | null;
}

/** Filters for journal list */
export interface JournalFilters {
  search: string;
  symbol: string;
  result: TradeResult | '';
  setup: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'trade_date' | 'pnl' | 'symbol';
  sortOrder: 'asc' | 'desc';
}

// -----------------------------------------------------------------------------
// Analytics Types
// -----------------------------------------------------------------------------

/** Weekly PnL data point for bar chart */
export interface WeeklyPnl {
  week: string;       // e.g., "2024-W03"
  weekLabel: string;  // e.g., "Jan 15 - Jan 21"
  netPnl: number;
  trades: number;
  wins: number;
  losses: number;
}

/** Daily PnL for heatmap */
export interface DailyPnl {
  date: string;       // YYYY-MM-DD
  pnl: number;
  trades: number;
}

/** Day-of-week analysis */
export interface DayOfWeekStats {
  day: string;         // "Monday", "Tuesday", etc.
  dayIndex: number;
  totalPnl: number;
  avgPnl: number;
  trades: number;
  winRate: number;
}

/** Setup performance stats */
export interface SetupStats {
  setup: string;
  trades: number;
  wins: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
}

/** Aggregated analytics response */
export interface AnalyticsData {
  weeklyPnl: WeeklyPnl[];
  dailyPnl: DailyPnl[];
  dayOfWeek: DayOfWeekStats[];
  setupStats: SetupStats[];
  overallWinRate: number;
  overallWinRateTrend: number[];  // Last 8 weeks
  totalTrades: number;
  avgRiskReward: number;
  mostCommonMistake: string | null;
  bestTradingDay: string | null;
  worstTradingDay: string | null;
  mostProfitableSetup: string | null;
}

// -----------------------------------------------------------------------------
// WebSocket Bridge Types
// -----------------------------------------------------------------------------

/** Message from the Python WebSocket bridge */
export interface WsBridgeMessage {
  type: 'ticker' | 'connected' | 'error' | 'ping';
  data?: MexcTickerUpdate | MexcTickerUpdate[];
  message?: string;
  timestamp?: number;
}

/** WebSocket connection status */
export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// -----------------------------------------------------------------------------
// UI State Types
// -----------------------------------------------------------------------------

/** Theme preference */
export type Theme = 'dark' | 'light';

/** Time period selector */
export type TimePeriod = '30d' | '60d' | '90d';

/** Navigation items */
export interface NavItem {
  name: string;
  href: string;
  icon: string;
}
