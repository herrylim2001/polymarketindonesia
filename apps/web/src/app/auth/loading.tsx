export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8 animate-pulse">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-dark-700 rounded-2xl" />
          </div>

          {/* Title */}
          <div className="h-8 w-48 bg-dark-700 rounded mx-auto mb-2" />
          <div className="h-5 w-64 bg-dark-700 rounded mx-auto mb-8" />

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <div className="h-10 flex-1 bg-dark-700 rounded-xl" />
            <div className="h-10 flex-1 bg-dark-700 rounded-xl" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="h-12 bg-dark-700 rounded-xl" />
            <div className="h-12 bg-dark-700 rounded-xl" />
            <div className="h-12 bg-dark-700 rounded-xl" />
          </div>

          {/* Button */}
          <div className="h-12 bg-dark-700 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}
