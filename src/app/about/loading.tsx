export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-pulse text-center">
        <div className="h-10 w-48 bg-dark-700 rounded mx-auto mb-4" />
        <div className="h-5 w-96 bg-dark-700 rounded mx-auto" />
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-6 animate-pulse">
            <div className="h-7 w-48 bg-dark-700 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-dark-700 rounded" />
              <div className="h-4 w-5/6 bg-dark-700 rounded" />
              <div className="h-4 w-4/5 bg-dark-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
