'use client';

// =============================================================================
// PAGE 1: Live Dashboard
// Real-time account overview with MEXC data
// =============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import BalanceCards from '@/components/dashboard/BalanceCards';
import PnLCards from '@/components/dashboard/PnLCards';
import PositionsTable from '@/components/dashboard/PositionsTable';
import OrdersTable from '@/components/dashboard/OrdersTable';
import EquityCurve from '@/components/dashboard/EquityCurve';
import WinRateCard from '@/components/dashboard/WinRateCard';
import AllocationChart from '@/components/dashboard/AllocationChart';
import LiveIndicator from '@/components/dashboard/LiveIndicator';
import type {
  AccountOverview,
  EquitySnapshot,
  WsConnectionStatus,
  MexcTickerUpdate,
} from '@/lib/types';
import { getPositionSide } from '@/lib/utils';

export default function DashboardPage() {
  const [account, setAccount] = useState<AccountOverview | null>(null);
  const [positions, setPositions] = useState<Array<{
    positionId: string;
    symbol: string;
    holdVol: number;
    holdAvgPrice: number;
    positionType: number;
    leverage: number;
    unrealizedPnl: number;
    liquidatePrice: number;
    im: number;
    autoAddIm: boolean;
    markPrice?: number;
  }>>([]);
  const [orders, setOrders] = useState<Array<{
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
  }>>([]);
  const [equitySnapshots, setEquitySnapshots] = useState<EquitySnapshot[]>([]);
  const [winRate, setWinRate] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [realizedToday, setRealizedToday] = useState(0);
  const [realizedWeek, setRealizedWeek] = useState(0);
  const [realizedMonth, setRealizedMonth] = useState(0);
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>('disconnected');
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch account data from our API
  const fetchAccountData = useCallback(async () => {
    try {
      const [accountRes, ordersRes] = await Promise.all([
        fetch('/api/mexc/account'),
        fetch('/api/mexc/orders'),
      ]);

      if (accountRes.ok) {
        const data = await accountRes.json();
        setAccount(data.account);
        setPositions(data.positions || []);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch journal stats for win rate and realized PnL cards
  const fetchJournalStats = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setWinRate(data.overallWinRate || 0);
        setTotalTrades(data.totalTrades || 0);
        setRealizedToday(data.realizedToday || 0);
        setRealizedWeek(data.realizedWeek || 0);
        setRealizedMonth(data.realizedMonth || 0);
      }
    } catch (error) {
      console.error('Failed to fetch journal stats:', error);
    }
  }, []);

  // Connect to WebSocket bridge for live ticker data
  const connectWebSocket = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_BRIDGE_URL;
    if (!wsUrl) return;

    setWsStatus('connecting');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ticker' && msg.data) {
          const tickers: MexcTickerUpdate[] = Array.isArray(msg.data) ? msg.data : [msg.data];
          // Update position mark prices and calculate real-time PnL
          setPositions(prev =>
            prev.map(pos => {
              const ticker = tickers.find(t => t.symbol === pos.symbol);
              if (ticker) {
                const markPrice = ticker.lastPrice;
                // Dynamically reverse-engineer the contract multiplier from margin and leverage
                // Position Value (USDT) = IM * Leverage = holdAvgPrice * holdVol * Multiplier
                const positionValueUsdt = pos.im * pos.leverage;
                const multiplier = positionValueUsdt / (pos.holdAvgPrice * pos.holdVol);
                
                const sideMulti = pos.positionType === 1 ? 1 : -1;
                const pnl = (markPrice - pos.holdAvgPrice) * pos.holdVol * multiplier * sideMulti;
                
                return { ...pos, markPrice, unrealizedPnl: pnl };
              }
              return pos;
            })
          );
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      // Auto-reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = () => {
      setWsStatus('error');
    };
  }, []);

  // Subscribe to high-frequency tickers for active positions
  useEffect(() => {
    if (wsStatus === 'connected' && wsRef.current && positions.length > 0) {
      const symbols = positions.map(p => p.symbol);
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        symbols
      }));
    }
  }, [wsStatus, positions.length]);

  // Cancel order handler
  const handleCancelOrder = async (symbol: string, orderId: string) => {
    const res = await fetch('/api/mexc/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, orderId }),
    });

    if (res.ok) {
      // Remove from local state
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to cancel order');
    }
  };

  useEffect(() => {
    fetchAccountData();
    fetchJournalStats();
    connectWebSocket();

    // Poll account data every 10 seconds
    const interval = setInterval(fetchAccountData, 10000);

    return () => {
      clearInterval(interval);
      wsRef.current?.close();
    };
  }, [fetchAccountData, fetchJournalStats, connectWebSocket]);

  // Compute allocation from positions
  const allocation = positions.map(pos => {
    const totalMargin = positions.reduce((sum, p) => sum + p.im, 0);
    return {
      symbol: pos.symbol,
      value: pos.im,
      percentage: totalMargin > 0 ? (pos.im / totalMargin) * 100 : 0,
      side: getPositionSide(pos.positionType) as 'Long' | 'Short',
    };
  });

  // Calculate dynamic real-time totals
  const realTimeUnrealizedPnl = positions.reduce((sum, pos) => sum + (pos.unrealizedPnl || 0), 0);
  const walletBalance = account ? (account.totalEquity - account.unrealizedPnl) : 0;
  const realTimeEquity = walletBalance + realTimeUnrealizedPnl;

  const liveAccount = account ? {
    ...account,
    totalEquity: realTimeEquity,
    unrealizedPnl: realTimeUnrealizedPnl,
  } : null;

  return (
    <PageTransition>
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-primary)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-secondary)] opacity-[0.03] blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="relative">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight drop-shadow-md">
              Dashboard
            </h1>
            <div className="h-1 w-12 bg-gradient-to-r from-[var(--accent-primary)] to-transparent rounded-full mt-2" />
            <p className="text-sm font-semibold tracking-wider uppercase text-[var(--muted-fg)] mt-2">
              Real-time account overview
            </p>
          </div>
          <LiveIndicator status={wsStatus} />
        </div>

        {/* Balance Cards */}
        <BalanceCards data={liveAccount} loading={loading} />

        {/* PnL Cards */}
        <PnLCards
          unrealizedPnl={realTimeUnrealizedPnl}
          realizedToday={realizedToday}
          realizedWeek={realizedWeek}
          realizedMonth={realizedMonth}
          loading={loading}
        />

        {/* Positions & Orders */}
        <div className="space-y-6">
          <PositionsTable positions={positions} loading={loading} />
          <OrdersTable
            orders={orders}
            loading={loading}
            onCancelOrder={handleCancelOrder}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <EquityCurve snapshots={equitySnapshots} loading={loading} />
          </div>
          <div className="space-y-6 flex flex-col justify-between">
            <WinRateCard winRate={winRate} totalTrades={totalTrades} loading={loading} />
            <AllocationChart data={allocation} loading={loading} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
