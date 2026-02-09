import { Skeleton, TableSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-dark-700 rounded mb-2" />
          <div className="h-4 w-48 bg-dark-700 rounded" />
        </div>
        <div className="h-10 w-28 bg-dark-700 rounded-xl animate-pulse" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-20 bg-dark-700 rounded" />
              <div className="h-7 w-28 bg-dark-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-700 pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-dark-700 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Bets Table */}
      <TableSkeleton rows={6} />
    </div>
  );
}
