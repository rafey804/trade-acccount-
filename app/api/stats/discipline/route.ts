import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 1. Get today's start and end in UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's trades
    const { data: todayTrades, error: todayError } = await supabase
      .from('journal_entries')
      .select('*')
      .gte('trade_date', today.toISOString())
      .lt('trade_date', tomorrow.toISOString())
      .order('trade_date', { ascending: false });

    if (todayError) throw todayError;

    const sessionTradesCount = todayTrades?.length || 0;
    
    // Calculate daily loss limit (sum of all losing trades today)
    const dailyLoss = todayTrades
      ?.filter((t) => t.result === 'Loss' && t.pnl < 0)
      .reduce((sum, t) => sum + Math.abs(t.pnl), 0) || 0;

    // Check cooldown (if last trade was a loss within the last 2 hours)
    let cooldownActive = false;
    if (todayTrades && todayTrades.length > 0) {
      const lastTrade = todayTrades[0];
      if (lastTrade.result === 'Loss') {
        const lastTradeTime = new Date(lastTrade.trade_date).getTime();
        const nowTime = new Date().getTime();
        const diffHours = (nowTime - lastTradeTime) / (1000 * 60 * 60);
        if (diffHours < 2) {
          cooldownActive = true;
        }
      }
    }

    // 2. Fetch last 7 days for weekly discipline
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: weekTrades, error: weekError } = await supabase
      .from('journal_entries')
      .select('*')
      .gte('trade_date', sevenDaysAgo.toISOString())
      .lt('trade_date', tomorrow.toISOString())
      .order('trade_date', { ascending: true });

    if (weekError) throw weekError;

    // Group trades by day (0 = Sunday, 1 = Monday ... 6 = Saturday)
    // Actually we want the last 7 days array based on Date
    const dailyStatus = Array(7).fill(null); // null = no trades, true = clean, false = rule broken
    
    // Get the current day index (0-6)
    const currentDayOfWeek = today.getDay(); // 0 is Sunday
    
    // We want to order dailyStatus [S, M, T, W, T, F, S]
    // To calculate if a day was clean: 
    // - Less than 5 trades
    // - Max loss did not exceed $5
    
    const tradesByDay = new Map<string, any[]>();
    weekTrades?.forEach((t) => {
      const dateKey = new Date(t.trade_date).toISOString().split('T')[0];
      if (!tradesByDay.has(dateKey)) tradesByDay.set(dateKey, []);
      tradesByDay.get(dateKey)!.push(t);
    });

    let cleanDays = 0;
    let totalTradedDays = 0;
    let currentStreak = 0;

    // Check past 7 days up to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      
      const dayTrades = tradesByDay.get(dateKey) || [];
      if (dayTrades.length > 0) {
        totalTradedDays++;
        const dayLoss = dayTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + Math.abs(t.pnl), 0);
        const rulesBroken = dayTrades.length > 4 || dayLoss >= 5;
        
        dailyStatus[dayOfWeek] = !rulesBroken;
        if (!rulesBroken) {
          cleanDays++;
          currentStreak++;
        } else {
          currentStreak = 0;
        }
      } else {
        // Did not trade, doesn't break streak but doesn't add to it? 
        // We'll mark as null
      }
    }

    const weeklyScore = totalTradedDays > 0 ? Math.round((cleanDays / totalTradedDays) * 100) : 0;

    return NextResponse.json({
      sessionTrades: sessionTradesCount,
      dailyLoss,
      cooldownActive,
      weeklyScore,
      longestStreak: currentStreak,
      dailyStatus, // Array of 7, [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
