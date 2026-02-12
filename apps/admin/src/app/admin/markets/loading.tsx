import { TableSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div className="h-8 w-48 bg-dark-700 rounded" />
        <div className="h-10 w-36 bg-dark-700 rounded-xl" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-48 bg-dark-700 rounded-xl animate-pulse" />
        <div className="h-10 w-32 bg-dark-700 rounded-xl animate-pulse" />
        <div className="h-10 w-32 bg-dark-700 rounded-xl animate-pulse" />
      </div>

      {/* Table */}
      <TableSkeleton rows={10} />
    </div>
  );
}
