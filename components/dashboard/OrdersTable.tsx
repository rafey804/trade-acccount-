'use client';

// =============================================================================
// Orders Table — Open orders with cancel functionality
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Clock, ListChecks } from 'lucide-react';
import { formatPrice, getOrderSideText, getOrderTypeText } from '@/lib/utils';
import Modal from '@/components/ui/Modal';

interface Order {
  orderId: string;
  symbol: string;
  price: number;
  vol: number;
  dealVol: number;
  orderType: number;
  side: number;
  state: number;
  createTime: number;
  leverage: number;
}

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onCancelOrder: (symbol: string, orderId: string) => Promise<void>;
}

export default function OrdersTable({ orders, loading, onCancelOrder }: OrdersTableProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Order | null>(null);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    setCancellingId(confirmCancel.orderId);
    try {
      await onCancelOrder(confirmCancel.symbol, confirmCancel.orderId);
    } finally {
      setCancellingId(null);
      setConfirmCancel(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card p-0 overflow-hidden relative group"
      >
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between relative z-10 bg-[var(--surface)]">
          <div className="flex items-center gap-2">
            <ListChecks size={16} className="text-[var(--accent-secondary)] drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)] tracking-[0.15em] uppercase">Open Orders</h3>
          </div>
          <span className="badge bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/20 shadow-[0_0_10px_rgba(176,38,255,0.15)]">
            {orders.length} pending
          </span>
        </div>

        {loading ? (
          <div className="space-y-0 relative z-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-6 px-6 py-4 border-b border-[var(--border)] last:border-0">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-5 w-20 rounded animate-shimmer" />
                ))}
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-16 text-center flex flex-col items-center justify-center relative z-10">
            <div className="w-16 h-16 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-4 opacity-50">
              <ListChecks size={24} className="text-[var(--muted-fg)]" />
            </div>
            <p className="text-sm text-[var(--muted-fg)] uppercase tracking-wider font-semibold">No pending orders</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="data-table">
              <thead>
                <tr className="bg-[var(--surface)]/50">
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Side</th>
                  <th>Price</th>
                  <th>Size</th>
                  <th>Time</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {orders.map((order) => {
                    const sideText = getOrderSideText(order.side);
                    const isLong = order.side === 1 || order.side === 2;
                    return (
                      <motion.tr
                        key={order.orderId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="group/row transition-colors hover:bg-[var(--surface-hover)]"
                      >
                        <td className="font-bold text-[var(--foreground)] tracking-wide">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isLong ? 'bg-[var(--profit)] shadow-[0_0_8px_var(--profit)]' : 'bg-[var(--loss)] shadow-[0_0_8px_var(--loss)]'}`} />
                            {order.symbol.replace('_USDT', '/USDT')}
                          </div>
                        </td>
                        <td className="text-[var(--muted-fg)] font-medium uppercase tracking-wider text-xs">
                          {getOrderTypeText(order.orderType)}
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1 badge font-extrabold uppercase tracking-widest ${
                            isLong
                              ? 'bg-[var(--profit)]/15 text-[var(--profit)] border border-[var(--profit)]/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]'
                              : 'bg-[var(--loss)]/15 text-[var(--loss)] border border-[var(--loss)]/30 shadow-[0_0_10px_rgba(255,59,48,0.2)]'
                          }`}>
                            {sideText}
                          </span>
                        </td>
                        <td className="font-mono text-sm tracking-tight text-[var(--muted-fg)] group-hover/row:text-[var(--foreground)] transition-colors">
                          {formatPrice(order.price)}
                        </td>
                        <td className="font-mono text-sm tracking-tight text-[var(--muted-fg)]">{order.vol}</td>
                        <td className="text-[var(--muted-fg)] text-xs font-mono font-medium">
                          <div className="flex items-center gap-1.5 opacity-80">
                            <Clock size={12} className="text-[var(--accent-primary)]" />
                            {new Date(order.createTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => setConfirmCancel(order)}
                            disabled={cancellingId === order.orderId}
                            className="btn-danger text-xs py-1 px-3 uppercase tracking-wider shadow-[0_0_10px_rgba(255,59,48,0.2)]"
                          >
                            {cancellingId === order.orderId ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <>
                                <X size={14} strokeWidth={3} />
                                Cancel
                              </>
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        title="Cancel Order"
      >
        <p className="text-sm text-[var(--muted-fg)] mb-6">
          Are you sure you want to cancel this {confirmCancel?.symbol.replace('_USDT', '/USDT')}{' '}
          {getOrderTypeText(confirmCancel?.orderType || 0)} order at{' '}
          {formatPrice(confirmCancel?.price || 0)}?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setConfirmCancel(null)} className="btn-secondary">
            Keep Order
          </button>
          <button onClick={handleCancel} className="btn-danger" disabled={!!cancellingId}>
            {cancellingId ? <Loader2 size={14} className="animate-spin" /> : null}
            Yes, Cancel Order
          </button>
        </div>
      </Modal>
    </>
  );
}
