'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Helper to draw SVG arcs
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y, 
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

type Session = {
  name: string;
  label: string;
  color: string;
  startHour: number; // 0 to 24
  endHour: number;
};

// PKT Hours (UTC+5) roughly
const sessions: Session[] = [
  { name: 'Asia', label: '04:00 - 12:00', color: 'var(--fg-3)', startHour: 4, endHour: 12 },
  { name: 'London', label: '12:00 - 21:00', color: '#8B5CF6', startHour: 12, endHour: 21 },
  { name: 'New York', label: '17:00 - 02:00', color: '#10B981', startHour: 17, endHour: 26 }, // 26 = 2am next day
];

export default function SessionClocks() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return (
      <div className="card h-[200px] flex items-center justify-center">
        <span className="text-xs" style={{ color: 'var(--fg-3)' }}>Loading Sessions...</span>
      </div>
    );
  }

  // Calculate current time in PKT
  // (Assuming system time is PKT or we offset from UTC. Let's use local time for now since user is in PKT)
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const timeString = now.toTimeString().slice(0, 5);
  
  // Angle for the dot (0 to 360)
  const currentAngle = (currentHour / 24) * 360;

  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-8">
        
        {/* Ring Container */}
        <div className="relative w-[180px] h-[180px]">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background Track */}
            <circle cx="90" cy="90" r="75" fill="none" stroke="var(--surface-2)" strokeWidth="12" />
            
            {/* Session Arcs */}
            {!isWeekend && sessions.map((s) => {
              // start/end to angles
              const startA = (s.startHour / 24) * 360;
              let endA = (s.endHour / 24) * 360;
              if (endA < startA) endA += 360;
              
              const d = describeArc(90, 90, 75, startA, endA);
              
              return (
                <path
                  key={s.name}
                  d={d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  style={{ opacity: 0.9 }}
                />
              );
            })}
          </svg>
          
          {/* Current Time Dot */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            initial={{ rotate: 0 }}
            animate={{ rotate: currentAngle }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute top-[8px] left-[83px] w-[14px] h-[14px] rounded-full" 
                 style={{ background: 'var(--gold)', border: '3px solid var(--surface)', boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)' }} />
          </motion.div>

          {/* Center Text */}
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>{timeString}</span>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-0.5" style={{ color: 'var(--fg-3)' }}>PKT NOW</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--fg)' }}>24H Session Ring</h3>
          {sessions.map((s) => {
            let active = false;
            let current = currentHour;
            let start = s.startHour;
            let end = s.endHour;
            
            if (!isWeekend) {
               if (end > 24) {
                 if (current >= start || current < (end - 24)) active = true;
               } else {
                 if (current >= start && current < end) active = true;
               }
            }

            return (
              <div key={s.name} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-24">
                  <span className="w-3 h-3 rounded" style={{ background: s.color, opacity: active ? 1 : 0.5 }} />
                  <span className="text-xs font-medium" style={{ color: active ? 'var(--fg)' : 'var(--fg-3)' }}>{s.name}</span>
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: active ? 'var(--fg)' : 'var(--fg-3)' }}>
                  {active ? 'ACTIVE' : s.label}
                </span>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}
