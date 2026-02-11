export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-dark-700 rounded mb-2" />
          <div className="h-4 w-32 bg-dark-700 rounded" />
        </div>
        <div className="h-10 w-28 bg-dark-700 rounded-xl animate-pulse" />
      </div>

      {/* Filter */}
      <div className="h-10 w-40 bg-dark-700 rounded-xl animate-pulse mb-6" />

      {/* Transaction List */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-dark-700 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-5 w-24 bg-dark-700 rounded animate-pulse" />
                  <div className="h-5 w-28 bg-dark-700 rounded animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-dark-700 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-dark-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
