'use client';
import { useEffect, useRef, useState, memo } from 'react';

function MarketNews() {
  const container = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    // Get initial theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(currentTheme);

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!theme || !container.current) return;
    
    // Clear the container to force widget reload when theme changes
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: 'all_symbols',
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      colorTheme: theme,
      locale: 'en'
    });
    
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget h-full w-full';
    container.current.appendChild(widgetDiv);
    container.current.appendChild(script);
  }, [theme]);

  return (
    <div className="card h-[450px] p-0 overflow-hidden flex flex-col">
      <div className="px-5 pt-4 pb-3 border-b border-[var(--border)] shrink-0">
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--gold)' }}></span>
          Live Market News
        </h2>
      </div>
      <div className="flex-1 w-full tradingview-widget-container" ref={container}></div>
    </div>
  );
}

export default memo(MarketNews);
