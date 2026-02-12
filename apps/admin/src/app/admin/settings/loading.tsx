export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 animate-pulse">
        <div className="h-8 w-48 bg-dark-700 rounded mb-2" />
        <div className="h-4 w-64 bg-dark-700 rounded" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-dark-700 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Settings Content */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 animate-pulse">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-dark-700 rounded" />
                <div className="h-4 w-64 bg-dark-700 rounded" />
              </div>
              <div className="h-8 w-14 bg-dark-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
