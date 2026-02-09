export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-pulse">
        <div className="h-10 w-48 bg-dark-700 rounded mb-2" />
        <div className="h-5 w-72 bg-dark-700 rounded" />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-6 animate-pulse">
            <div className="w-14 h-14 bg-dark-700 rounded-xl mb-4" />
            <div className="h-6 w-24 bg-dark-700 rounded mb-2" />
            <div className="h-4 w-full bg-dark-700 rounded mb-1" />
            <div className="h-4 w-3/4 bg-dark-700 rounded mb-4" />
            <div className="h-4 w-20 bg-dark-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
