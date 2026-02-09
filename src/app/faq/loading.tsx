export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-pulse text-center">
        <div className="h-10 w-64 bg-dark-700 rounded mx-auto mb-4" />
        <div className="h-5 w-80 bg-dark-700 rounded mx-auto" />
      </div>

      {/* Search */}
      <div className="h-12 w-full bg-dark-700 rounded-xl animate-pulse mb-8" />

      {/* FAQ Items */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-5 w-3/4 bg-dark-700 rounded" />
              <div className="h-5 w-5 bg-dark-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
