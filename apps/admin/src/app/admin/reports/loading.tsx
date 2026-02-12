import { TableSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-48 bg-dark-700 rounded mb-2" />
        <div className="h-4 w-64 bg-dark-700 rounded" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-4 animate-pulse">
            <div className="h-4 w-24 bg-dark-700 rounded mb-2" />
            <div className="h-8 w-32 bg-dark-700 rounded" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 animate-pulse">
          <div className="h-6 w-32 bg-dark-700 rounded mb-4" />
          <div className="h-64 bg-dark-700 rounded" />
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 animate-pulse">
          <div className="h-6 w-32 bg-dark-700 rounded mb-4" />
          <div className="h-64 bg-dark-700 rounded" />
        </div>
      </div>

      {/* Table */}
      <TableSkeleton rows={5} />
    </div>
  );
}
