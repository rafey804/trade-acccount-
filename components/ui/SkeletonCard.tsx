// =============================================================================
// Skeleton Card — Loading placeholder with shimmer
// =============================================================================

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export default function SkeletonCard({ className = '', lines = 3 }: SkeletonCardProps) {
  return (
    <div className={`glass-card ${className}`}>
      {/* Title skeleton */}
      <div className="h-3 w-24 rounded-md animate-shimmer mb-4" />
      
      {/* Value skeleton */}
      <div className="h-8 w-36 rounded-md animate-shimmer mb-3" />
      
      {/* Detail lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-md animate-shimmer mb-2"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card p-0 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-[var(--border)]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 w-16 rounded-md animate-shimmer" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-[var(--border)] last:border-0">
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="h-4 w-20 rounded-md animate-shimmer" />
          ))}
        </div>
      ))}
    </div>
  );
}
