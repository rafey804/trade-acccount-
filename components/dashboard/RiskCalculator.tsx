'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Calculator } from 'lucide-react';

export default function RiskCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<number>(100);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [stopLoss, setStopLoss] = useState<number>(30);
  const [pipValue, setPipValue] = useState<number>(10);
  const [isCentAccount, setIsCentAccount] = useState(false);

  const maxRisk = (balance * riskPercent) / 100;
  
  // Suggested Lot Size calculation
  // Lot Size = Risk Amount / (Stop Loss in Pips * Pip Value per Lot)
  let suggestedLotSize = 0;
  if (stopLoss > 0 && pipValue > 0) {
    suggestedLotSize = maxRisk / (stopLoss * pipValue);
    if (isCentAccount) {
      suggestedLotSize *= 100; // Cent account lot size adjustment
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        style={{ background: 'var(--surface)', color: 'var(--fg-2)', border: '1px solid var(--border)' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--fg)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        }}
      >
        <Calculator size={14} />
        <span className="text-[11px] font-semibold">Risk Calculator</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Position Size Calculator" maxWidth="max-w-md">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Account Balance ($)</label>
              <input
                type="number"
                value={balance || ''}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Risk Per Trade (%)</label>
              <input
                type="number"
                value={riskPercent || ''}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Stop Loss (Pips)</label>
              <input
                type="number"
                value={stopLoss || ''}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Pip Value ($/Lot)</label>
              <input
                type="number"
                value={pipValue || ''}
                onChange={(e) => setPipValue(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-2 w-fit">
            <input
              type="checkbox"
              checked={isCentAccount}
              onChange={(e) => setIsCentAccount(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[var(--gold)]"
            />
            <span className="text-xs" style={{ color: 'var(--fg)' }}>Standard Cent Account (Exness)</span>
          </label>

          <div 
            className="mt-6 rounded-xl p-4 flex justify-between items-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg-3)' }}>Max Risk</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--fg)' }}>${maxRisk.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--fg)' }}>Suggested Lot Size</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--gold)' }}>
                {suggestedLotSize > 0 ? (suggestedLotSize < 0.01 ? suggestedLotSize.toFixed(3) : suggestedLotSize.toFixed(2)) : '0.00'}
              </p>
            </div>
          </div>
          
          {isCentAccount ? (
            <p className="text-xs mt-2" style={{ color: 'var(--fg)' }}>
              * Cent account lot sizes are 100x larger than standard lots for the same risk.
            </p>
          ) : (
            <p className="text-xs mt-2" style={{ color: 'var(--fg)' }}>
              Follows Rule #3 — never risk more than 2% of balance on a single trade.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
