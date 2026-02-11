export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 w-64 bg-dark-700 rounded mb-4" />
        <div className="h-4 w-48 bg-dark-700 rounded" />
      </div>

      {/* Content */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 animate-pulse">
        <div className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-48 bg-dark-700 rounded" />
              <div className="h-4 w-full bg-dark-700 rounded" />
              <div className="h-4 w-5/6 bg-dark-700 rounded" />
              <div className="h-4 w-4/5 bg-dark-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
