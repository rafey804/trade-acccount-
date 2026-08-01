// =============================================================================
// Notes Page — Loading Skeleton
// =============================================================================

export default function NotesLoading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header skeleton */}
      <div
        className="sticky top-0 z-30 px-6 py-4"
        style={{
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl animate-pulse"
              style={{ background: 'var(--surface-2)' }}
            />
            <div className="space-y-1.5">
              <div className="w-16 h-3.5 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
              <div className="w-24 h-2.5 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-44 h-9 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
            <div className="w-28 h-9 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                height: 180 + (i % 3) * 40,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
