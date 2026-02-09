import { MarketListSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="h-12 w-full max-w-2xl bg-dark-700 rounded-xl animate-pulse mb-4" />
        <div className="h-5 w-48 bg-dark-700 rounded animate-pulse" />
      </div>

      {/* Results */}
      <MarketListSkeleton count={6} />
    </div>
  );
}
