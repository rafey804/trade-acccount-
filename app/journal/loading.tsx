import SkeletonCard from '@/components/ui/SkeletonCard';

export default function JournalLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-md animate-shimmer" />
      <SkeletonCard lines={2} />
      <SkeletonCard lines={2} />
      <SkeletonCard lines={2} />
    </div>
  );
}
