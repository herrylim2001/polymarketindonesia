import { TableSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="h-8 w-48 bg-dark-700 rounded" />
        <div className="h-10 w-48 bg-dark-700 rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-4 animate-pulse">
            <div className="h-4 w-24 bg-dark-700 rounded mb-2" />
            <div className="h-7 w-16 bg-dark-700 rounded" />
          </div>
        ))}
      </div>

      {/* Table */}
      <TableSkeleton rows={10} />
    </div>
  );
}
