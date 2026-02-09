import { TableSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 w-48 bg-dark-700 rounded mb-2" />
        <div className="h-5 w-64 bg-dark-700 rounded" />
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mb-8">
        <div className="animate-pulse">
          <div className="w-24 h-32 bg-dark-700 rounded-t-xl" />
          <div className="w-24 h-16 bg-dark-800 rounded-b-xl" />
        </div>
        <div className="animate-pulse">
          <div className="w-28 h-40 bg-dark-700 rounded-t-xl" />
          <div className="w-28 h-16 bg-dark-800 rounded-b-xl" />
        </div>
        <div className="animate-pulse">
          <div className="w-24 h-28 bg-dark-700 rounded-t-xl" />
          <div className="w-24 h-16 bg-dark-800 rounded-b-xl" />
        </div>
      </div>

      {/* Leaderboard Table */}
      <TableSkeleton rows={10} />
    </div>
  );
}
