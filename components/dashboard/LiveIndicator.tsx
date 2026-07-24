'use client';

// =============================================================================
// Live Indicator — Pulsing connection status badge
// =============================================================================

import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import type { WsConnectionStatus } from '@/lib/types';

interface LiveIndicatorProps {
  status: WsConnectionStatus;
}

export default function LiveIndicator({ status }: LiveIndicatorProps) {
  const isConnected = status === 'connected';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest
        border transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]
        ${isConnected
          ? 'bg-[var(--profit)]/15 border-[var(--profit)]/30 text-[var(--profit)] drop-shadow-[0_0_8px_rgba(0,230,118,0.8)]'
          : 'bg-[var(--loss)]/15 border-[var(--loss)]/30 text-[var(--loss)] drop-shadow-[0_0_8px_rgba(255,59,48,0.8)]'
        }`}
    >
      {isConnected ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-[var(--profit)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--profit)] shadow-[0_0_5px_currentColor]" />
          </span>
          <Wifi size={14} strokeWidth={3} />
          MEXC Live
        </>
      ) : (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--loss)] shadow-[0_0_5px_currentColor]" />
          </span>
          <WifiOff size={14} strokeWidth={3} />
          {status === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </>
      )}
    </motion.div>
  );
}
