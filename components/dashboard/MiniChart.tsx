'use client';

import { useEffect, useRef, useState, memo } from 'react';

function MiniChartComponent() {
  const container = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState('dark');
  const [symbol, setSymbol] = useState('OANDA:XAUUSD');

  // Watch for theme changes from the parent container or html tag
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(currentTheme);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') || 'dark';
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear previous widget on remount
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "15",
        "timezone": "Asia/Karachi",
        "theme": "${theme}",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com",
        "hide_top_toolbar": true,
        "hide_legend": true,
        "save_image": false,
        "backgroundColor": "rgba(0, 0, 0, 0)"
      }
    `;
    container.current.appendChild(script);
  }, [theme, symbol]); // Re-render when theme or symbol changes

  const displaySymbol = symbol.split(':')[1].replace('.P', '').replace('USB10YUSD', 'US10Y');

  const symbolsList = [
    { id: 'OANDA:XAUUSD', label: 'XAU' },
    { id: 'BINANCE:BTCUSDT.P', label: 'BTC' },
    { id: 'CAPITALCOM:DXY', label: 'DXY' },
    { id: 'OANDA:USB10YUSD', label: 'US10Y' }
  ];

  return (
    <div className="card h-full min-h-[400px] flex flex-col p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--fg)' }}>Live Chart</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg-3)' }}>{displaySymbol} / 15m</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {symbolsList.map((symObj) => {
            const sym = symObj.id;
            const label = symObj.label;
            const isActive = symbol === sym;
            return (
              <button
                key={sym}
                onClick={() => setSymbol(sym)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                style={{
                  background: isActive ? 'var(--gold-dim)' : 'var(--surface-2)',
                  color: isActive ? 'var(--gold)' : 'var(--fg-2)',
                  border: `1px solid ${isActive ? 'var(--gold-border)' : 'var(--border)'}`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="tradingview-widget-container" ref={container} style={{ height: '100%', width: '100%' }}>
          <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
}

export default memo(MiniChartComponent);
