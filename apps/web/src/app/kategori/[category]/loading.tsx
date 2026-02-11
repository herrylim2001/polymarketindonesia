import { MarketListSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 bg-dark-700 rounded" />
          <div className="h-10 w-48 bg-dark-700 rounded" />
        </div>
        <div className="h-5 w-72 bg-dark-700 rounded" />
      </div>

      {/* Filter/Sort */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-32 bg-dark-700 rounded-xl animate-pulse" />
        <div className="h-10 w-32 bg-dark-700 rounded-xl animate-pulse" />
      </div>

      {/* Markets Grid */}
      <MarketListSkeleton count={9} />
    </div>
  );
}
