'use client';

import { useState, useEffect, useRef } from 'react';

type TickerItem = {
  id: string; // for WS matching
  symbol: string;
  price: number;
  change: number;
  isPositive: boolean;
  isCrypto: boolean;
};

// Initial base data
const initialData: TickerItem[] = [
  { id: 'btcusdt', symbol: 'BTC/USD', price: 64250.00, change: 1.25, isPositive: true, isCrypto: true },
  { id: 'xauusd', symbol: 'XAU/USD', price: 2415.30, change: 0.28, isPositive: true, isCrypto: false },
  { id: 'ethusdt', symbol: 'ETH/USD', price: 3140.50, change: 0.78, isPositive: true, isCrypto: true },
  { id: 'dxy', symbol: 'DXY', price: 104.22, change: 0.20, isPositive: true, isCrypto: false },
  { id: 'us10y', symbol: 'US10Y', price: 4.28, change: -0.09, isPositive: false, isCrypto: false },
  { id: 'spx', symbol: 'SPX', price: 5123.41, change: 0.45, isPositive: true, isCrypto: false },
  { id: 'ndx', symbol: 'NDX', price: 18234.12, change: 0.67, isPositive: true, isCrypto: false },
];

export default function Ticker() {
  const [data, setData] = useState<TickerItem[]>(initialData);
  const dataRef = useRef<TickerItem[]>(initialData);

  // Sync ref
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Real-time WebSocket for Crypto & Gold proxy (PAXG)
  useEffect(() => {
    // We use Binance WebSocket for real millisecond ticking
    // btcusdt@trade pushes on every single trade (milliseconds)
    // !miniTicker@arr updates 24h changes
    const streams = [
      'btcusdt@trade',
      'ethusdt@trade',
      'paxgusdt@trade', // Pax Gold tracks 1oz Gold
      '!miniTicker@arr'
    ].join('/');
    
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      // Trade stream (millisecond updates)
      if (msg.e === 'trade' && msg.p) {
        const symbol = msg.s.toLowerCase();
        const price = parseFloat(msg.p);
        
        setData(prev => prev.map(item => {
          if (item.id === symbol || (item.id === 'xauusd' && symbol === 'paxgusdt')) {
            return { ...item, price };
          }
          return item;
        }));
      }
      
      // miniTicker stream (for 24h changes)
      if (Array.isArray(msg)) {
        setData(prev => {
          let changed = false;
          const next = prev.map(item => {
            const targetSymbol = item.id === 'xauusd' ? 'PAXGUSDT' : item.id.toUpperCase();
            const ticker = msg.find((t: any) => t.s === targetSymbol);
            
            if (ticker) {
              const close = parseFloat(ticker.c);
              const open = parseFloat(ticker.o);
              const changePercent = ((close - open) / open) * 100;
              if (Math.abs(item.change - changePercent) > 0.01) {
                changed = true;
                return { 
                  ...item, 
                  change: Number(changePercent.toFixed(2)), 
                  isPositive: changePercent >= 0 
                };
              }
            }
            return item;
          });
          return changed ? next : prev;
        });
      }
    };

    return () => ws.close();
  }, []);

  // Fast simulated jitter for traditional markets (Forex/Indices)
  // Since we don't have a free millisecond WS for DXY/SPX
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => {
        if (!item.isCrypto && item.id !== 'xauusd') {
          // Extremely tiny micro-fluctuation every 300ms to make it look alive
          if (Math.random() > 0.4) {
            const jitter = item.price * (Math.random() * 0.0002 - 0.0001);
            return { ...item, price: item.price + jitter };
          }
        }
        return item;
      }));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Repeat the data so it fills ultra-wide screens, then double it for the marquee effect
  const repeatedData = [...data, ...data, ...data];
  const marqueeData = [...repeatedData, ...repeatedData];

  return (
    <div className="w-full h-9 flex items-center relative z-40 select-none bg-[var(--surface-2)]">
      <div className="animate-ticker">
        {marqueeData.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 px-6 whitespace-nowrap">
            <div 
              className={`w-1.5 h-1.5 rounded-full ${item.isPositive ? 'bg-[var(--profit)]' : 'bg-[var(--loss)]'}`}
              style={{ boxShadow: `0 0 6px ${item.isPositive ? 'var(--profit)' : 'var(--loss)'}` }}
            ></div>
            <span className="font-bold text-[var(--fg)] text-[0.8rem] tracking-wide">{item.symbol}</span>
            <span className="text-[var(--fg-2)] text-[0.8rem] font-medium font-mono">
              {item.price.toLocaleString('en-US', { 
                minimumFractionDigits: item.price < 100 ? 3 : 2, 
                maximumFractionDigits: item.price < 100 ? 3 : 2 
              })}
            </span>
            <span className={`text-[0.8rem] font-bold font-mono ${item.isPositive ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}`}>
              {item.isPositive ? '+' : ''}{item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
