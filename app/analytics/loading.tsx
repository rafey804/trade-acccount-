import SkeletonCard from '@/components/ui/SkeletonCard';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-md animate-shimmer" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard lines={6} />
    </div>
  );
}
