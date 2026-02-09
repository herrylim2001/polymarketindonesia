import { MarketListSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section Skeleton */}
      <div className="mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-dark-700 rounded w-2/3 max-w-md" />
          <div className="h-5 bg-dark-700 rounded w-full max-w-lg" />
        </div>
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-dark-700 rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>

      {/* Featured Section Skeleton */}
      <div className="mb-8">
        <div className="h-7 w-40 bg-dark-700 rounded animate-pulse mb-4" />
        <MarketListSkeleton count={3} />
      </div>

      {/* Trending Section Skeleton */}
      <div className="mb-8">
        <div className="h-7 w-40 bg-dark-700 rounded animate-pulse mb-4" />
        <MarketListSkeleton count={6} />
      </div>
    </div>
  );
}
