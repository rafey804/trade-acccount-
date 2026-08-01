'use client';
import { useEffect, useState } from 'react';

interface FFEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

export default function EconomicCalendar() {
  const [events, setEvents] = useState<FFEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch('/api/calendar');
        if (res.ok) {
          const data = await res.json();
          // Sort by date just in case
          data.sort((a: FFEvent, b: FFEvent) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Filter out past events to only show upcoming news
          const now = new Date();
          const upcomingEvents = data.filter((e: FFEvent) => new Date(e.date) >= now);
          setEvents(upcomingEvents);
        }
      } catch (err) {
        console.error('Failed to load calendar', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
    // Refresh every 1 hour
    const interval = setInterval(fetchCalendar, 3600_000);
    return () => clearInterval(interval);
  }, []);

  // Group by day
  const grouped = events.reduce((acc, event) => {
    const d = new Date(event.date);
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!acc[dayStr]) acc[dayStr] = [];
    acc[dayStr].push(event);
    return acc;
  }, {} as Record<string, FFEvent[]>);

  const getImpactColor = (impact: string) => {
    if (impact === 'High') return 'var(--loss)';
    if (impact === 'Medium') return 'var(--warning)';
    return 'var(--info)';
  };

  return (
    <div className="card h-[450px] p-0 flex flex-col overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-[var(--border)] shrink-0 flex justify-between items-center" style={{ background: 'var(--surface)' }}>
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--fg)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--loss)', boxShadow: '0 0 8px var(--loss)' }}></span>
          ForexFactory News
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full text-xs" style={{ color: 'var(--fg-3)' }}>
            Fetching live data...
          </div>
        ) : events.length === 0 ? (
          <div className="flex justify-center items-center h-full text-xs" style={{ color: 'var(--fg-3)' }}>
            No important news this week.
          </div>
        ) : (
          <div className="flex flex-col">
            {Object.entries(grouped).map(([day, dayEvents]) => (
              <div key={day} className="mb-0">
                <div 
                  className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-[var(--border)]" 
                  style={{ background: 'var(--surface-2)', color: 'var(--fg-2)' }}
                >
                  {day}
                </div>
                <div>
                  {dayEvents.map((ev, i) => {
                    const time = new Date(ev.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    return (
                      <div 
                        key={i} 
                        className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] transition-colors"
                        style={{ cursor: 'default' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div className="w-14 shrink-0 flex flex-col items-start gap-1">
                          <span className="text-xs font-mono font-medium" style={{ color: 'var(--fg-2)' }}>{time}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 w-10 shrink-0">
                          <span 
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded" 
                            style={{ background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)' }}
                          >
                            {ev.country}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: getImpactColor(ev.impact) }}></span>
                            <span className="text-xs font-semibold truncate" style={{ color: 'var(--fg)' }} title={ev.title}>
                              {ev.title}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 hidden sm:flex w-16">
                          <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>
                            F: <span className="font-medium" style={{ color: 'var(--fg-2)' }}>{ev.forecast || '-'}</span>
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>
                            P: {ev.previous || '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
