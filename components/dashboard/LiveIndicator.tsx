'use client';

// =============================================================================
// Live Indicator — Gold Edition (Exness connection status)
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
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
      style={{
        background: isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.08)',
        border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.15)'}`,
        color: isConnected ? '#10B981' : '#6B7280',
      }}
    >
      {isConnected ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
              style={{ background: '#10B981' }} />
            <span className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
          </span>
          <Wifi size={12} strokeWidth={2.5} />
          Live
        </>
      ) : (
        <>
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#6B7280' }} />
          </span>
          <WifiOff size={12} strokeWidth={2.5} />
          {status === 'connecting' ? 'Connecting' : 'Offline'}
        </>
      )}
    </motion.div>
  );
}
