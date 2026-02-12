export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8 animate-pulse">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-dark-700 rounded-2xl" />
          </div>

          {/* Title */}
          <div className="h-8 w-32 bg-dark-700 rounded mx-auto mb-2" />
          <div className="h-5 w-56 bg-dark-700 rounded mx-auto mb-8" />

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <div className="h-4 w-20 bg-dark-700 rounded mb-2" />
              <div className="h-12 bg-dark-700 rounded-xl" />
            </div>
            <div>
              <div className="h-4 w-20 bg-dark-700 rounded mb-2" />
              <div className="h-12 bg-dark-700 rounded-xl" />
            </div>
          </div>

          {/* Button */}
          <div className="h-12 bg-dark-700 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}
