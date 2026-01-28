'use client';

import { useVideoStore } from '@/store/videoStore';

export default function FloatingVideoButton() {
  const { isPlayerVisible, openVideoList, availableStreams } = useVideoStore();

  // Don't show the button if player is already visible
  if (isPlayerVisible) return null;

  const liveCount = availableStreams.filter(s => s.isLive).length;

  return (
    <button
      onClick={openVideoList}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3
                 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
                 rounded-full shadow-lg shadow-red-500/30 hover:shadow-red-500/50
                 transform hover:scale-105 transition-all duration-300 group"
    >
      {/* Live Indicator Pulse */}
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>

      {/* Play Icon */}
      <svg
        className="w-5 h-5 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z" />
      </svg>

      {/* Text */}
      <span className="text-white font-semibold text-sm">
        Live Stream
      </span>

      {/* Live Count Badge */}
      {liveCount > 0 && (
        <span className="bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {liveCount}
        </span>
      )}

      {/* Expand Arrow */}
      <svg
        className="w-4 h-4 text-white/80 group-hover:translate-y-[-2px] transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
