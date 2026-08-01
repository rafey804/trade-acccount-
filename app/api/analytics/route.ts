// =============================================================================
// API Route: /api/analytics
// Aggregated analytics from journal data
// =============================================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { checkRateLimit, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limiter';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit('analytics', RATE_LIMITS.analytics);
  if (!allowed) return rateLimitResponse(retryAfter);

  try {
    const supabase = createServerSupabaseClient();

    // Fetch all journal entries
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('trade_date', { ascending: true });

    if (error) throw error;
    if (!entries || entries.length === 0) {
      return NextResponse.json({
        weeklyPnl: [],
        dailyPnl: [],
        dayOfWeek: [],
        setupStats: [],
        overallWinRate: 0,
        overallWinRateTrend: [],
        totalTrades: 0,
        avgRiskReward: 0,
        mostCommonMistake: null,
        bestTradingDay: null,
        worstTradingDay: null,
        mostProfitableSetup: null,
      });
    }

    // === Overall Stats ===
    const totalTrades = entries.length;
    const wins = entries.filter(e => e.result === 'Win').length;
    const overallWinRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    // Helper to get UTC+8 Date object from ISO string
    const getUtc8Date = (isoString: string) => {
      const d = new Date(isoString);
      return new Date(d.getTime() + (8 * 60 * 60 * 1000));
    };

    // === Daily PnL (for heatmap) ===
    const dailyMap = new Map<string, { pnl: number; trades: number }>();
    entries.forEach(entry => {
      const tradeUtc8 = getUtc8Date(entry.trade_date);
      const date = tradeUtc8.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { pnl: 0, trades: 0 };
      existing.pnl += entry.pnl || 0;
      existing.trades += 1;
      dailyMap.set(date, existing);
    });
    const dailyPnl = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      pnl: data.pnl,
      trades: data.trades,
    }));

    // === Weekly PnL (for bar chart) ===
    const weeklyMap = new Map<string, { netPnl: number; trades: number; wins: number; losses: number; startDate: string }>();
    entries.forEach(entry => {
      const tradeUtc8 = getUtc8Date(entry.trade_date);
      const startOfWeek = new Date(tradeUtc8);
      const day = startOfWeek.getUTCDay();
      const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
      startOfWeek.setUTCDate(diff);
      startOfWeek.setUTCHours(0, 0, 0, 0);
      const weekKey = startOfWeek.toISOString().split('T')[0];
      
      const existing = weeklyMap.get(weekKey) || { netPnl: 0, trades: 0, wins: 0, losses: 0, startDate: weekKey };
      existing.netPnl += entry.pnl || 0;
      existing.trades += 1;
      if (entry.result === 'Win') existing.wins += 1;
      if (entry.result === 'Loss') existing.losses += 1;
      weeklyMap.set(weekKey, existing);
    });
    const weeklyPnl = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => {
        const start = new Date(week);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 6);
        return {
          week,
          weekLabel: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`,
          netPnl: Math.round(data.netPnl * 100) / 100,
          trades: data.trades,
          wins: data.wins,
          losses: data.losses,
        };
      });

    // === Win Rate Trend (last 8 weeks) ===
    const overallWinRateTrend = weeklyPnl.slice(-8).map(w => {
      return w.trades > 0 ? Math.round((w.wins / w.trades) * 100) : 0;
    });

    // === Day of Week Stats ===
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayMap = new Map<number, { totalPnl: number; trades: number; wins: number }>();
    entries.forEach(entry => {
      const tradeUtc8 = getUtc8Date(entry.trade_date);
      const day = tradeUtc8.getUTCDay();
      const existing = dayMap.get(day) || { totalPnl: 0, trades: 0, wins: 0 };
      existing.totalPnl += entry.pnl || 0;
      existing.trades += 1;
      if (entry.result === 'Win') existing.wins += 1;
      dayMap.set(day, existing);
    });
    const dayOfWeek = Array.from(dayMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([dayIndex, data]) => ({
        day: dayNames[dayIndex],
        dayIndex,
        totalPnl: Math.round(data.totalPnl * 100) / 100,
        avgPnl: data.trades > 0 ? Math.round((data.totalPnl / data.trades) * 100) / 100 : 0,
        trades: data.trades,
        winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      }));

    // Best/worst trading day
    const bestDay = dayOfWeek.length > 0
      ? dayOfWeek.reduce((best, curr) => curr.avgPnl > best.avgPnl ? curr : best).day
      : null;
    const worstDay = dayOfWeek.length > 0
      ? dayOfWeek.reduce((worst, curr) => curr.avgPnl < worst.avgPnl ? curr : worst).day
      : null;

    // === Setup Stats ===
    const setupMap = new Map<string, { trades: number; wins: number; totalPnl: number }>();
    entries.forEach(entry => {
      if (!entry.setup) return;
      const existing = setupMap.get(entry.setup) || { trades: 0, wins: 0, totalPnl: 0 };
      existing.trades += 1;
      if (entry.result === 'Win') existing.wins += 1;
      existing.totalPnl += entry.pnl || 0;
      setupMap.set(entry.setup, existing);
    });
    const setupStats = Array.from(setupMap.entries())
      .map(([setup, data]) => ({
        setup,
        trades: data.trades,
        wins: data.wins,
        winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
        totalPnl: Math.round(data.totalPnl * 100) / 100,
        avgPnl: data.trades > 0 ? Math.round((data.totalPnl / data.trades) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.totalPnl - a.totalPnl);

    const mostProfitableSetup = setupStats.length > 0 ? setupStats[0].setup : null;

    // === Most Common Mistake ===
    const mistakeMap = new Map<string, number>();
    entries.forEach(entry => {
      if (!entry.mistake || entry.mistake.trim() === '') return;
      const key = entry.mistake.trim().toLowerCase();
      mistakeMap.set(key, (mistakeMap.get(key) || 0) + 1);
    });
    let mostCommonMistake: string | null = null;
    let maxMistakeCount = 0;
    mistakeMap.forEach((count, mistake) => {
      if (count > maxMistakeCount) {
        maxMistakeCount = count;
        mostCommonMistake = mistake;
      }
    });

    // === Average Risk-Reward ===
    const entriesWithRR = entries.filter(e => e.pnl && e.result === 'Win' && e.entry_price && e.exit_price);
    const avgRiskReward = entriesWithRR.length > 0
      ? entriesWithRR.reduce((sum, e) => {
          const rr = Math.abs((e.exit_price - e.entry_price) / e.entry_price);
          return sum + rr;
        }, 0) / entriesWithRR.length
      : 0;

    // === Realized PnL (Today, Week, Month) - UTC+8 Aligned ===
    // MEXC resets "Today" at UTC+8 00:00. We do the same.
    const nowUtc = new Date();
    // Offset by +8 hours
    const nowUtc8 = new Date(nowUtc.getTime() + (8 * 60 * 60 * 1000));
    
    const todayStrUtc8 = nowUtc8.toISOString().split('T')[0];
    
    // Start of current week in UTC+8 (Monday)
    const startOfThisWeekUtc8 = new Date(nowUtc8);
    const day = startOfThisWeekUtc8.getUTCDay();
    const diff = startOfThisWeekUtc8.getUTCDate() - day + (day === 0 ? -6 : 1);
    startOfThisWeekUtc8.setUTCDate(diff);
    startOfThisWeekUtc8.setUTCHours(0, 0, 0, 0);

    // Start of current month in UTC+8
    const startOfThisMonthUtc8 = new Date(Date.UTC(nowUtc8.getUTCFullYear(), nowUtc8.getUTCMonth(), 1));

    let realizedToday = 0;
    let realizedWeek = 0;
    let realizedMonth = 0;

    entries.forEach(entry => {
      if (!entry.pnl) return;
      const tradeUtc = new Date(entry.trade_date);
      // Convert trade time to UTC+8
      const tradeUtc8 = new Date(tradeUtc.getTime() + (8 * 60 * 60 * 1000));
      const dateStr = tradeUtc8.toISOString().split('T')[0];
      
      if (dateStr === todayStrUtc8) realizedToday += entry.pnl;
      if (tradeUtc8 >= startOfThisWeekUtc8) realizedWeek += entry.pnl;
      if (tradeUtc8 >= startOfThisMonthUtc8) realizedMonth += entry.pnl;
    });

    return NextResponse.json({
      weeklyPnl,
      dailyPnl,
      dayOfWeek,
      setupStats,
      overallWinRate: Math.round(overallWinRate * 10) / 10,
      overallWinRateTrend,
      totalTrades,
      avgRiskReward: Math.round(avgRiskReward * 100) / 100,
      mostCommonMistake,
      bestTradingDay: bestDay,
      worstTradingDay: worstDay,
      mostProfitableSetup,
      realizedToday,
      realizedWeek,
      realizedMonth,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compute analytics' },
      { status: 500 }
    );
  }
}
