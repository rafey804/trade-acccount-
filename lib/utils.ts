// =============================================================================
// Trader Command Center — Utility Helpers
// =============================================================================

import { type ClassValue, clsx } from 'clsx';

/**
 * Merge class names conditionally (works with Tailwind)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a number as USD currency
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '' : '-';
  const abs = Math.abs(value);
  
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  }
  return `${sign}$${abs.toFixed(decimals)}`;
}

/**
 * Format a number as a full currency value (no abbreviation)
 */
export function formatFullCurrency(value: number, decimals: number = 2): string {
  const formatted = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${value < 0 ? '-' : ''}$${formatted}`;
}

/**
 * Format a price with appropriate decimal places
 */
export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  if (price >= 0.01) return price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a date relative to now
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get the ISO date string for today
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get the current datetime in ISO format for form default
 */
export function nowISO(): string {
  const now = new Date();
  // Adjust for timezone offset to get local datetime
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

/**
 * Calculate PnL from entry/exit prices
 */
export function calculatePnl(
  entryPrice: number,
  exitPrice: number,
  positionSize: number,
  direction: 'Long' | 'Short',
  leverage: number = 1
): number {
  const priceDiff = direction === 'Long'
    ? exitPrice - entryPrice
    : entryPrice - exitPrice;
  return (priceDiff / entryPrice) * positionSize * leverage;
}

/**
 * Determine trade result from PnL
 */
export function getTradeResult(pnl: number): 'Win' | 'Loss' | 'Breakeven' {
  if (pnl > 0) return 'Win';
  if (pnl < 0) return 'Loss';
  return 'Breakeven';
}

/**
 * Map MEXC order side number to readable text
 */
export function getOrderSideText(side: number): string {
  switch (side) {
    case 1: return 'Open Long';
    case 2: return 'Close Short';
    case 3: return 'Open Short';
    case 4: return 'Close Long';
    default: return 'Unknown';
  }
}

/**
 * Map MEXC order type number to readable text
 */
export function getOrderTypeText(type: number): string {
  switch (type) {
    case 1: return 'Limit';
    case 2: return 'Post Only';
    case 3: return 'IOC';
    case 4: return 'FOK';
    case 5: return 'Market';
    default: return 'Unknown';
  }
}

/**
 * Map MEXC position type to Long/Short
 */
export function getPositionSide(positionType: number): 'Long' | 'Short' {
  return positionType === 1 ? 'Long' : 'Short';
}

/**
 * Get PnL color class
 */
export function getPnlColor(pnl: number): string {
  if (pnl > 0) return 'text-emerald-400';
  if (pnl < 0) return 'text-red-400';
  return 'text-zinc-400';
}

/**
 * Get PnL background color class  
 */
export function getPnlBgColor(pnl: number): string {
  if (pnl > 0) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (pnl < 0) return 'bg-red-500/10 text-red-400 border-red-500/20';
  return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
}

/**
 * Get result badge color classes
 */
export function getResultBadgeColor(result: string | null): string {
  switch (result) {
    case 'Win': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'Loss': return 'bg-red-500/15 text-red-400 border border-red-500/30';
    case 'Breakeven': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    default: return 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30';
  }
}

/**
 * Generate a week label from a date
 */
export function getWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Sunday
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} - ${endStr}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
