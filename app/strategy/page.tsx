'use client';

// =============================================================================
// Strategy Page — Complete Visual Guide & Education
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import { 
  Target, 
  TrendingDown, 
  TrendingUp,
  Layers, 
  Crosshair, 
  AlertTriangle,
  Calculator,
  ShieldAlert,
  BarChart2,
  LineChart
} from 'lucide-react';

const BEARISH_CANDLES = [
  { x: 60, o: 300, c: 270, h: 265, l: 310 },
  { x: 80, o: 270, c: 240, h: 230, l: 275 },
  { x: 100, o: 240, c: 200, h: 190, l: 245 }, // Peak 1
  { x: 120, o: 200, c: 225, h: 195, l: 230 },
  { x: 140, o: 225, c: 250, h: 220, l: 255 }, // Low 1
  { x: 160, o: 250, c: 220, h: 215, l: 255 },
  { x: 180, o: 220, c: 180, h: 175, l: 225 },
  { x: 200, o: 180, c: 150, h: 145, l: 185 }, // Equal High 1 (y=150)
  { x: 220, o: 150, c: 180, h: 148, l: 185 },
  { x: 240, o: 180, c: 210, h: 175, l: 215 },
  { x: 260, o: 210, c: 180, h: 175, l: 215 },
  { x: 280, o: 180, c: 150, h: 145, l: 185 }, // Equal High 2 (y=150)
  { x: 300, o: 150, c: 190, h: 148, l: 195 },
  { x: 320, o: 190, c: 240, h: 185, l: 245 },
  { x: 340, o: 240, c: 280, h: 235, l: 285 }, // Swing Low
  { x: 360, o: 280, c: 230, h: 225, l: 285 },
  { x: 380, o: 230, c: 160, h: 155, l: 235 },
  { x: 400, o: 160, c: 100, h: 60, l: 165 }, // LIQUIDITY SWEEP! (Wick up to y=60)
  { x: 420, o: 100, c: 190, h: 95, l: 195 }, // Sharp rejection
  { x: 440, o: 190, c: 280, h: 185, l: 285 }, // MSS break (y=280)
  { x: 460, o: 280, c: 340, h: 275, l: 350 }, // Heavy drop
  { x: 480, o: 340, c: 290, h: 285, l: 345 },
  { x: 500, o: 290, c: 230, h: 225, l: 295 },
  { x: 520, o: 230, c: 185, h: 180, l: 235 }, // Return to FVG / OB (y=170-210)
  { x: 540, o: 185, c: 220, h: 180, l: 225 }, // Rejection from FVG
  { x: 560, o: 220, c: 260, h: 215, l: 265 },
  { x: 580, o: 260, c: 300, h: 255, l: 305 },
  { x: 600, o: 300, c: 320, h: 295, l: 325 },
  { x: 620, o: 320, c: 305, h: 300, l: 325 },
  { x: 640, o: 305, c: 335, h: 300, l: 340 },
  { x: 660, o: 335, c: 355, h: 330, l: 360 },
  { x: 680, o: 355, c: 345, h: 340, l: 360 },
  { x: 700, o: 345, c: 365, h: 340, l: 370 },
  { x: 720, o: 365, c: 380, h: 360, l: 385 }, // TAKE PROFIT (y=380)
];

const BULLISH_CANDLES = [
  { x: 60, o: 100, c: 130, h: 95, l: 135 },
  { x: 80, o: 130, c: 160, h: 125, l: 165 },
  { x: 100, o: 160, c: 200, h: 155, l: 205 }, // Low 1
  { x: 120, o: 200, c: 175, h: 170, l: 205 },
  { x: 140, o: 175, c: 150, h: 145, l: 180 },
  { x: 160, o: 150, c: 180, h: 145, l: 185 },
  { x: 180, o: 180, c: 220, h: 175, l: 225 },
  { x: 200, o: 220, c: 250, h: 215, l: 255 }, // Equal Low 1 (y=250)
  { x: 220, o: 250, c: 220, h: 215, l: 255 },
  { x: 240, o: 220, c: 190, h: 185, l: 225 },
  { x: 260, o: 190, c: 220, h: 185, l: 225 },
  { x: 280, o: 220, c: 250, h: 215, l: 255 }, // Equal Low 2 (y=250)
  { x: 300, o: 250, c: 210, h: 205, l: 255 },
  { x: 320, o: 210, c: 160, h: 155, l: 215 },
  { x: 340, o: 160, c: 120, h: 115, l: 165 }, // Swing High
  { x: 360, o: 120, c: 170, h: 115, l: 175 },
  { x: 380, o: 170, c: 240, h: 165, l: 245 },
  { x: 400, o: 240, c: 300, h: 235, l: 340 }, // LIQUIDITY SWEEP! (Wick down to y=340)
  { x: 420, o: 300, c: 210, h: 205, l: 305 }, // Sharp rejection
  { x: 440, o: 210, c: 120, h: 115, l: 215 }, // MSS break (y=120)
  { x: 460, o: 120, c: 60, h: 50, l: 125 }, // Heavy pump
  { x: 480, o: 60, c: 110, h: 55, l: 115 },
  { x: 500, o: 110, c: 170, h: 105, l: 175 },
  { x: 520, o: 170, c: 210, h: 165, l: 215 }, // Return to FVG / OB (y=190-230)
  { x: 540, o: 210, c: 175, h: 170, l: 215 }, // Rejection from FVG
  { x: 560, o: 175, c: 140, h: 135, l: 180 },
  { x: 580, o: 140, c: 100, h: 95, l: 145 },
  { x: 600, o: 100, c: 80, h: 75, l: 105 },
  { x: 620, o: 80, c: 95, h: 75, l: 100 },
  { x: 640, o: 95, c: 65, h: 60, l: 100 },
  { x: 660, o: 65, c: 45, h: 40, l: 70 },
  { x: 680, o: 45, c: 55, h: 40, l: 60 },
  { x: 700, o: 55, c: 35, h: 30, l: 60 },
  { x: 720, o: 35, c: 20, h: 15, l: 40 }, // TAKE PROFIT (y=20)
];

const FAKEOUT_CANDLES = [
  { x: 50, o: 300, c: 270, h: 265, l: 305 },
  { x: 70, o: 270, c: 240, h: 235, l: 275 },
  { x: 90, o: 240, c: 210, h: 205, l: 245 },
  { x: 110, o: 210, c: 180, h: 175, l: 215 },
  { x: 130, o: 180, c: 160, h: 155, l: 185 },
  { x: 150, o: 160, c: 150, h: 145, l: 165 }, // Hits Resistance (y=150)
  { x: 170, o: 150, c: 180, h: 148, l: 185 }, // Pullback
  { x: 190, o: 180, c: 210, h: 175, l: 215 },
  { x: 210, o: 210, c: 235, h: 205, l: 240 },
  { x: 230, o: 235, c: 250, h: 230, l: 255 }, // Low at y=250
  { x: 250, o: 250, c: 220, h: 215, l: 255 }, // Bounce
  { x: 270, o: 220, c: 190, h: 185, l: 225 },
  { x: 290, o: 190, c: 160, h: 155, l: 195 },
  { x: 310, o: 160, c: 150, h: 145, l: 165 }, // Hits Resistance (y=150)
  { x: 330, o: 150, c: 175, h: 148, l: 180 }, // Dip
  { x: 350, o: 175, c: 200, h: 170, l: 205 }, // Dip low y=200
  { x: 370, o: 200, c: 160, h: 155, l: 205 }, // Pumping back
  { x: 390, o: 160, c: 140, h: 135, l: 165 }, // Breaking resistance!
  { x: 410, o: 140, c: 110, h: 105, l: 145 }, // Big green breakout!
  { x: 430, o: 110, c: 80, h: 70, l: 115 }, // Breakout peak at y=80 ("RETAIL BUYS HERE")
  { x: 450, o: 80, c: 150, h: 75, l: 155 }, // VIOLENT REVERSAL DUMP!
  { x: 470, o: 150, c: 220, h: 145, l: 225 }, // Crashing past resistance
  { x: 490, o: 220, c: 290, h: 215, l: 295 },
  { x: 510, o: 290, c: 350, h: 285, l: 360 }, // STOP LOSS HIT at y=350!
];

const CandleGraph = ({ candles }: { candles: typeof BEARISH_CANDLES }) => {
  return (
    <>
      {candles.map((c, i) => {
        // In SVG coordinate system:
        // Smaller Y = Higher Price.
        // If close Y < open Y, price went UP -> Green (Bullish)
        // If close Y > open Y, price went DOWN -> Red (Bearish)
        const isGreen = c.c < c.o;
        const color = isGreen ? '#10b981' : '#ef4444'; // TradingView green & red
        const topY = Math.min(c.o, c.c);
        const bodyHeight = Math.max(Math.abs(c.o - c.c), 3);
        
        return (
          <motion.g 
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * i, duration: 0.2 }}
          >
            {/* Wick */}
            <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={color} strokeWidth="1.5" />
            {/* Body */}
            <rect 
              x={c.x - 7} 
              y={topY} 
              width="14" 
              height={bodyHeight} 
              fill={color} 
              stroke={color}
              strokeWidth="0.5"
              rx="1.5"
            />
          </motion.g>
        );
      })}
    </>
  );
};

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<'short' | 'long' | 'fakeout' | 'risk'>('short');
  const [chartMode, setChartMode] = useState<'line' | 'candle'>('line');

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: "easeOut" as const },
  });

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full" style={{ background: 'var(--gold)' }} />
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--fg)' }}>
                Master The Strategy
              </h1>
              <p className="text-xs font-semibold tracking-widest uppercase mt-0.5" style={{ color: 'var(--fg-3)' }}>
                Visual Guide to Smart Money Concepts
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-2">
          {[
            { id: 'short', label: 'Bearish Setup (Short)', icon: TrendingDown },
            { id: 'long', label: 'Bullish Setup (Long)', icon: TrendingUp },
            { id: 'fakeout', label: 'Fakeout vs Manipulation', icon: ShieldAlert },
            { id: 'risk', label: 'Stop Loss Reality (Crucial)', icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden"
                style={{
                  background: isActive ? 'var(--gold-dim)' : 'var(--surface-2)',
                  color: isActive ? 'var(--gold)' : 'var(--fg-2)',
                  border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Visual Graph Container */}
        <motion.div {...fadeUp(0.2)} className="glass-card overflow-hidden !p-0">
          <AnimatePresence mode="wait">
            
            {/* 1. SHORT SETUP */}
            {activeTab === 'short' && (
              <motion.div key="short" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown size={18} style={{ color: 'var(--loss)' }} />
                      <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>Bearish Setup (Shorting)</h2>
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: 'var(--fg-3)' }}>Institutions hunt buy stops above Equal Highs before crashing the price.</p>
                  </div>
                  
                  {/* Chart Mode Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => setChartMode('line')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
                      style={{ background: chartMode === 'line' ? 'var(--surface)' : 'transparent', color: chartMode === 'line' ? 'var(--fg)' : 'var(--fg-3)' }}
                    >
                      <LineChart size={13} /> Line
                    </button>
                    <button 
                      onClick={() => setChartMode('candle')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
                      style={{ background: chartMode === 'candle' ? 'var(--surface)' : 'transparent', color: chartMode === 'candle' ? 'var(--fg)' : 'var(--fg-3)' }}
                    >
                      <BarChart2 size={13} /> Candles
                    </button>
                  </div>
                </div>
                <div className="relative w-full h-[400px] flex items-center justify-center p-8 overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <svg viewBox="0 0 850 430" className="w-full h-full drop-shadow-2xl z-10" style={{ overflow: 'visible' }}>
                    {/* Equal Highs / Retail Liquidity */}
                    <line x1="50" y1="150" x2="380" y2="150" stroke="var(--fg-3)" strokeWidth="2" strokeDasharray="5,5" />
                    <g transform="translate(60, 130)">
                      <rect x="0" y="-12" width="210" height="20" fill="var(--surface)" rx="4" stroke="var(--border)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--fg-2)" fontSize="11" fontWeight="bold">RETAIL STOP LOSSES (LIQUIDITY)</text>
                    </g>

                    {/* Stop Loss Line & Badge (Above Sweep) */}
                    <line x1="450" y1="120" x2="780" y2="120" stroke="var(--loss)" strokeWidth="1.5" strokeDasharray="3,3" />
                    <g transform="translate(580, 120)">
                      <rect x="0" y="-12" width="170" height="20" fill="rgba(239, 68, 68, 0.2)" rx="4" stroke="var(--loss)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--loss)" fontSize="11" fontWeight="bold">🛑 STOP LOSS (30 Pips)</text>
                    </g>

                    {/* FVG / Order Block Entry Box */}
                    <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} x="490" y="170" width="70" height="50" fill="rgba(245, 200, 66, 0.2)" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="3,3" rx="4" />
                    <g transform="translate(580, 185)">
                      <rect x="0" y="-12" width="180" height="22" fill="rgba(245, 200, 66, 0.2)" rx="4" stroke="var(--gold)" strokeWidth="1" />
                      <text x="8" y="3" fill="var(--gold)" fontSize="11" fontWeight="black">🎯 ENTRY ZONE (FVG / OB)</text>
                    </g>

                    {/* MSS Line & Badge */}
                    <line x1="200" y1="280" x2="780" y2="280" stroke="var(--loss)" strokeWidth="2" strokeDasharray="5,5" />
                    <g transform="translate(210, 300)">
                      <rect x="0" y="-12" width="220" height="20" fill="rgba(239, 68, 68, 0.15)" rx="4" stroke="var(--loss)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--loss)" fontSize="11" fontWeight="bold">🔻 MSS (Market Structure Shift)</text>
                    </g>

                    {/* Price Path (Line or Candles) */}
                    {chartMode === 'line' ? (
                      <motion.path
                        d="M 50 300 L 100 200 L 150 250 L 200 150 L 250 220 L 300 150 L 350 280 L 400 100 L 450 350 L 500 180 L 750 380"
                        fill="none" stroke="var(--fg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeOut" }}
                      />
                    ) : (
                      <CandleGraph candles={BEARISH_CANDLES} />
                    )}

                    {/* Liquidity Sweep Indicator */}
                    <motion.circle cx="400" cy="60" r="8" fill="var(--loss)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
                    <g transform="translate(320, 35)">
                      <rect x="0" y="-12" width="160" height="20" fill="var(--loss)" rx="4" />
                      <text x="8" y="2" fill="#fff" fontSize="11" fontWeight="black">⚡ LIQUIDITY SWEEP</text>
                    </g>

                    {/* Entry Circle */}
                    <motion.circle cx="520" cy="185" r="8" fill="var(--gold)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.6 }} />

                    {/* Take Profit Target Line & Badge */}
                    <line x1="550" y1="380" x2="780" y2="380" stroke="var(--success)" strokeWidth="2" strokeDasharray="4,4" />
                    <motion.circle cx="720" cy="380" r="8" fill="var(--success)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.5 }} />
                    <g transform="translate(600, 410)">
                      <rect x="0" y="-12" width="170" height="20" fill="rgba(16, 185, 129, 0.2)" rx="4" stroke="var(--success)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--success)" fontSize="11" fontWeight="black">💰 TAKE PROFIT (TARGET)</text>
                    </g>
                  </svg>
                </div>
              </motion.div>
            )}

            {/* 2. LONG SETUP */}
            {activeTab === 'long' && (
              <motion.div key="long" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={18} style={{ color: 'var(--success)' }} />
                      <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>Bullish Setup (Longing)</h2>
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: 'var(--fg-3)' }}>Institutions hunt sell stops below Equal Lows before pumping the price.</p>
                  </div>

                  {/* Chart Mode Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => setChartMode('line')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
                      style={{ background: chartMode === 'line' ? 'var(--surface)' : 'transparent', color: chartMode === 'line' ? 'var(--fg)' : 'var(--fg-3)' }}
                    >
                      <LineChart size={13} /> Line
                    </button>
                    <button 
                      onClick={() => setChartMode('candle')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
                      style={{ background: chartMode === 'candle' ? 'var(--surface)' : 'transparent', color: chartMode === 'candle' ? 'var(--fg)' : 'var(--fg-3)' }}
                    >
                      <BarChart2 size={13} /> Candles
                    </button>
                  </div>
                </div>
                <div className="relative w-full h-[400px] flex items-center justify-center p-8 overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <svg viewBox="0 0 850 430" className="w-full h-full drop-shadow-2xl z-10" style={{ overflow: 'visible' }}>
                    {/* Equal Lows / Retail Liquidity */}
                    <line x1="50" y1="250" x2="380" y2="250" stroke="var(--fg-3)" strokeWidth="2" strokeDasharray="5,5" />
                    <g transform="translate(60, 270)">
                      <rect x="0" y="-12" width="210" height="20" fill="var(--surface)" rx="4" stroke="var(--border)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--fg-2)" fontSize="11" fontWeight="bold">RETAIL STOP LOSSES (LIQUIDITY)</text>
                    </g>

                    {/* Stop Loss Line & Badge (Below Sweep) */}
                    <line x1="450" y1="260" x2="780" y2="260" stroke="var(--loss)" strokeWidth="1.5" strokeDasharray="3,3" />
                    <g transform="translate(580, 260)">
                      <rect x="0" y="-12" width="170" height="20" fill="rgba(239, 68, 68, 0.2)" rx="4" stroke="var(--loss)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--loss)" fontSize="11" fontWeight="bold">🛑 STOP LOSS (30 Pips)</text>
                    </g>

                    {/* FVG / Order Block Entry Box */}
                    <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} x="490" y="170" width="70" height="50" fill="rgba(245, 200, 66, 0.2)" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="3,3" rx="4" />
                    <g transform="translate(580, 185)">
                      <rect x="0" y="-12" width="180" height="22" fill="rgba(245, 200, 66, 0.2)" rx="4" stroke="var(--gold)" strokeWidth="1" />
                      <text x="8" y="3" fill="var(--gold)" fontSize="11" fontWeight="black">🎯 ENTRY ZONE (FVG / OB)</text>
                    </g>

                    {/* MSS Line & Badge */}
                    <line x1="200" y1="120" x2="780" y2="120" stroke="var(--success)" strokeWidth="2" strokeDasharray="5,5" />
                    <g transform="translate(210, 100)">
                      <rect x="0" y="-12" width="220" height="20" fill="rgba(16, 185, 129, 0.15)" rx="4" stroke="var(--success)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--success)" fontSize="11" fontWeight="bold">🔺 MSS (Market Structure Shift)</text>
                    </g>

                    {/* Price Path (Line or Candles) */}
                    {chartMode === 'line' ? (
                      <motion.path
                        d="M 50 100 L 100 200 L 150 150 L 200 250 L 250 180 L 300 250 L 350 120 L 400 300 L 450 50 L 500 210 L 750 20"
                        fill="none" stroke="var(--fg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeOut" }}
                      />
                    ) : (
                      <CandleGraph candles={BULLISH_CANDLES} />
                    )}

                    {/* Liquidity Sweep Indicator */}
                    <motion.circle cx="400" cy="340" r="8" fill="var(--loss)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
                    <g transform="translate(320, 365)">
                      <rect x="0" y="-12" width="160" height="20" fill="var(--loss)" rx="4" />
                      <text x="8" y="2" fill="#fff" fontSize="11" fontWeight="black">⚡ LIQUIDITY SWEEP</text>
                    </g>

                    {/* Entry Circle */}
                    <motion.circle cx="520" cy="210" r="8" fill="var(--gold)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.6 }} />

                    {/* Take Profit Target Line & Badge */}
                    <line x1="550" y1="20" x2="780" y2="20" stroke="var(--success)" strokeWidth="2" strokeDasharray="4,4" />
                    <motion.circle cx="720" cy="20" r="8" fill="var(--success)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.5 }} />
                    <g transform="translate(600, 30)">
                      <rect x="0" y="-12" width="170" height="20" fill="rgba(16, 185, 129, 0.2)" rx="4" stroke="var(--success)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--success)" fontSize="11" fontWeight="black">💰 TAKE PROFIT (TARGET)</text>
                    </g>
                  </svg>
                </div>
              </motion.div>
            )}

            {/* 3. FAKEOUT VS MANIPULATION */}
            {activeTab === 'fakeout' && (
              <motion.div key="fakeout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldAlert size={18} style={{ color: 'var(--loss)' }} />
                      <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>The Breakout Trap (Fake Entry)</h2>
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: 'var(--fg-3)' }}>Why you should never buy the breakout. Always wait for the sweep and reverse.</p>
                  </div>

                  {/* Chart Mode Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => setChartMode('line')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
                      style={{ background: chartMode === 'line' ? 'var(--surface)' : 'transparent', color: chartMode === 'line' ? 'var(--fg)' : 'var(--fg-3)' }}
                    >
                      <LineChart size={13} /> Line
                    </button>
                    <button 
                      onClick={() => setChartMode('candle')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
                      style={{ background: chartMode === 'candle' ? 'var(--surface)' : 'transparent', color: chartMode === 'candle' ? 'var(--fg)' : 'var(--fg-3)' }}
                    >
                      <BarChart2 size={13} /> Candles
                    </button>
                  </div>
                </div>
                <div className="relative w-full h-[400px] flex items-center justify-center p-8 overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <svg viewBox="0 0 850 430" className="w-full h-full drop-shadow-2xl z-10" style={{ overflow: 'visible' }}>
                    {/* Resistance line */}
                    <line x1="50" y1="150" x2="780" y2="150" stroke="var(--fg-3)" strokeWidth="2" strokeDasharray="5,5" />
                    <g transform="translate(60, 130)">
                      <rect x="0" y="-12" width="150" height="20" fill="var(--surface)" rx="4" stroke="var(--border)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--fg-2)" fontSize="11" fontWeight="bold">RESISTANCE LEVEL</text>
                    </g>
                    
                    {/* Price Path */}
                    {chartMode === 'line' ? (
                      <motion.path
                        d="M 50 300 L 200 150 L 300 250 L 400 150 L 450 200 L 500 80 L 550 350"
                        fill="none" stroke="var(--fg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "easeOut" }}
                      />
                    ) : (
                      <CandleGraph candles={FAKEOUT_CANDLES} />
                    )}
                    
                    {/* Breakout buy */}
                    <motion.circle cx={chartMode === 'line' ? 500 : 430} cy="80" r="8" fill="var(--success)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }} />
                    <g transform={`translate(${chartMode === 'line' ? 340 : 270}, 45)`}>
                      <rect x="0" y="-12" width="220" height="20" fill="rgba(16, 185, 129, 0.2)" rx="4" stroke="var(--success)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--success)" fontSize="11" fontWeight="black">📈 RETAIL BUYS BREAKOUT HERE</text>
                    </g>
                    
                    {/* Reversal / Stop hunted */}
                    <motion.circle cx={chartMode === 'line' ? 550 : 510} cy="350" r="8" fill="var(--loss)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5 }} />
                    <g transform={`translate(${chartMode === 'line' ? 570 : 530}, 350)`}>
                      <rect x="0" y="-12" width="150" height="20" fill="rgba(239, 68, 68, 0.2)" rx="4" stroke="var(--loss)" strokeWidth="1" />
                      <text x="8" y="2" fill="var(--loss)" fontSize="11" fontWeight="black">❌ STOP LOSS HIT</text>
                    </g>
                    
                    {/* Explanation Box */}
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} transform="translate(60, 250)">
                      <rect x="0" y="0" width="280" height="85" fill="var(--surface-3)" stroke="var(--loss)" strokeWidth="1.5" rx="8" />
                      <text x="14" y="24" fill="var(--loss)" fontSize="13" fontWeight="black">The Breakout Trap:</text>
                      <text x="14" y="46" fill="var(--fg)" fontSize="11">1. Retail buys when price breaks resistance.</text>
                      <text x="14" y="66" fill="var(--fg-2)" fontSize="11">2. Smart Money dumps on them to hit Stop Losses.</text>
                    </motion.g>
                  </svg>
                </div>
              </motion.div>
            )}

            {/* 4. STOP LOSS & RISK REALITY */}
            {activeTab === 'risk' && (
              <motion.div key="risk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator size={18} style={{ color: 'var(--gold)' }} />
                    <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>The $2 Risk Reality (Crucial for Gold)</h2>
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--loss)' }}>
                    WARNING: A $2 risk DOES NOT mean a 2 pip stop loss. If you use a 2 pip SL, you will be stopped out instantly!
                  </p>
                </div>
                <div className="w-full flex flex-col md:flex-row gap-8 p-8" style={{ background: 'var(--surface-2)' }}>
                  
                  {/* Left: Calculation Box */}
                  <div className="flex-1 space-y-6">
                    <div className="glass-card !p-5" style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.3)' }}>
                      <h3 className="text-[15px] font-black mb-3" style={{ color: 'var(--gold)' }}>How to Risk $3 correctly:</h3>
                      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--fg)' }}>
                        Gold (XAU/USD) moves 10-20 pips in seconds. A 3 pip stop loss is just "spread and noise". Your trade will close instantly.
                        <br/><br/>
                        Instead, you must use the <b>SMALLEST LOT SIZE (0.01)</b> and a <b>WIDER STOP LOSS (30 pips)</b>.
                      </p>
                      
                      <div className="p-4 rounded-xl" style={{ background: 'var(--bg)' }}>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-[var(--fg-3)]">Lot Size:</span>
                          <span className="text-xs font-bold text-[var(--info)]">0.01 Micro Lot</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-[var(--fg-3)]">Stop Loss Distance:</span>
                          <span className="text-xs font-bold text-[var(--gold)]">30 Pips</span>
                        </div>
                        <div className="flex justify-between pt-2 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <span className="text-sm font-bold text-[var(--fg)]">Total Risk Amount:</span>
                          <span className="text-sm font-black text-[var(--success)]">$3.00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Visual representation */}
                  <div className="flex-1 flex items-center justify-center relative">
                     <svg width="200" height="300" viewBox="0 0 200 300">
                        {/* Entry Line */}
                        <line x1="0" y1="100" x2="200" y2="100" stroke="var(--gold)" strokeWidth="2" strokeDasharray="4,4" />
                        <text x="10" y="90" fill="var(--gold)" fontSize="12" fontWeight="bold">ENTRY PRICE (e.g. 2350.00)</text>
                        
                        {/* Candlestick Wicks */}
                        <line x1="100" y1="80" x2="100" y2="220" stroke="var(--fg-3)" strokeWidth="4" />
                        
                        {/* Candlestick Body */}
                        <rect x="85" y="100" width="30" height="90" fill="var(--loss)" />

                        {/* 3 Pip SL (Wrong) */}
                        <line x1="80" y1="110" x2="180" y2="110" stroke="var(--loss)" strokeWidth="1" />
                        <text x="120" y="125" fill="var(--loss)" fontSize="10" fontWeight="bold">❌ 3 Pip SL (Hits instantly)</text>

                        {/* 30 Pip SL (Right) */}
                        <line x1="0" y1="200" x2="200" y2="200" stroke="var(--success)" strokeWidth="2" strokeDasharray="4,4" />
                        <text x="10" y="215" fill="var(--success)" fontSize="12" fontWeight="bold">✅ 30 Pip Stop Loss</text>
                        <text x="10" y="235" fill="var(--fg-2)" fontSize="10">(Price = 2347.00 | Loss = $3.00)</text>

                        {/* Safe Zone bracket */}
                        <path d="M 190 100 L 195 100 L 195 200 L 190 200" fill="none" stroke="var(--fg-3)" strokeWidth="2" />
                        <text x="130" y="155" fill="var(--fg-2)" fontSize="10" transform="rotate(90, 160, 150)">Breathing Room</text>
                     </svg>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Strategy Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div {...fadeUp(0.3)} className="glass-card flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Layers size={15} style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>Execution Checklist</h2>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-3)' }}>Do this every single trade</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {[
                { step: 1, title: 'Trend Check (H4 / H1)', desc: 'Only trade with the trend. Higher Highs = BUY. Lower Highs = SELL.' },
                { step: 2, title: 'Wait for Sweep (M15)', desc: 'Wait for price to sweep Equal Highs/Lows, PDH, or PDL to trap retail.' },
                { step: 3, title: 'Confirm MSS (M5)', desc: 'After the sweep, price MUST break the recent structure violently.' },
                { step: 4, title: 'Entry Point (M5 / M1)', desc: 'Set limit order at the Order Block or FVG. Let price come to you.' },
                { step: 5, title: 'Safe Stop Loss', desc: 'Place SL 30 pips away using 0.01 lot size. DO NOT use 3 pip stops.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black" 
                       style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}>
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold" style={{ color: 'var(--fg)' }}>{s.title}</h3>
                    <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--fg-2)' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="glass-card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={15} style={{ color: 'var(--loss)' }} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--fg)' }}>Strict Rules</h2>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--fg-3)' }}>Never break these</p>
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[11px] font-semibold" style={{ color: 'var(--fg-2)' }}>
                <span className="mt-0.5 text-[10px]" style={{ color: 'var(--loss)' }}>❌</span>
                <div>
                  <span className="text-[var(--fg)] font-bold">NEVER buy breakouts.</span> Always wait for the fakeout sweep first.
                </div>
              </li>
              <li className="flex items-start gap-3 text-[11px] font-semibold" style={{ color: 'var(--fg-2)' }}>
                <span className="mt-0.5 text-[10px]" style={{ color: 'var(--loss)' }}>❌</span>
                <div>
                  <span className="text-[var(--fg)] font-bold">NEVER use a 2-3 pip Stop Loss.</span> Market noise will hit it instantly. Use 0.01 lot size with 30 pips.
                </div>
              </li>
              <li className="flex items-start gap-3 text-[11px] font-semibold" style={{ color: 'var(--fg-2)' }}>
                <span className="mt-0.5 text-[10px]" style={{ color: 'var(--loss)' }}>❌</span>
                <div>
                  <span className="text-[var(--fg)] font-bold">DO NOT trade news.</span> Avoid NFP, CPI, and FOMC completely.
                </div>
              </li>
              <li className="flex items-start gap-3 text-[11px] font-semibold" style={{ color: 'var(--fg-2)' }}>
                <span className="mt-0.5 text-[10px]" style={{ color: 'var(--loss)' }}>❌</span>
                <div>
                  <span className="text-[var(--fg)] font-bold">Max $5 Loss Per Day.</span> If you hit it, close the app immediately.
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
