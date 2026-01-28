'use client';

import { useVideoStore } from '@/store/videoStore';
import { LiveStream } from '@/types';
import { formatCompactNumber } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  sports: 'bg-green-500',
  esports: 'bg-purple-500',
  casino: 'bg-amber-500',
  events: 'bg-blue-500',
};

const categoryIcons: Record<string, string> = {
  sports: '⚽',
  esports: '🎮',
  casino: '🎰',
  events: '🎪',
};

function StreamCard({ stream, onSelect }: { stream: LiveStream; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full bg-dark-800 hover:bg-dark-700 rounded-xl overflow-hidden transition-all
                 duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/10 text-left group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-700">
        {/* Placeholder thumbnail with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-600 to-dark-800 flex items-center justify-center">
          <span className="text-4xl">{categoryIcons[stream.category]}</span>
        </div>

        {/* Live Badge */}
        {stream.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </div>
        )}

        {/* Viewer Count */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded text-xs">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          {formatCompactNumber(stream.viewerCount)}
        </div>

        {/* Category Badge */}
        <div className={`absolute top-2 right-2 ${categoryColors[stream.category]} px-2 py-0.5 rounded text-xs font-medium capitalize`}>
          {stream.category}
        </div>

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm line-clamp-1">{stream.title}</h3>
        {stream.participants && (
          <p className="text-dark-400 text-xs mt-1 line-clamp-1">{stream.participants}</p>
        )}
        {stream.score && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-primary-400 font-mono text-sm font-bold">{stream.score}</span>
            {stream.eventInfo && (
              <span className="text-dark-500 text-xs">• {stream.eventInfo}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

export default function VideoListModal() {
  const { isListModalOpen, closeVideoList, availableStreams, selectStream } = useVideoStore();

  if (!isListModalOpen) return null;

  // Group streams by category
  const liveStreams = availableStreams.filter(s => s.isLive);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={closeVideoList}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
        <div className="bg-dark-900 rounded-t-3xl max-h-[80vh] overflow-hidden shadow-2xl border-t border-dark-700">
          {/* Header */}
          <div className="sticky top-0 bg-dark-900/95 backdrop-blur border-b border-dark-700 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Live Streams</h2>
                  <p className="text-dark-400 text-xs">{liveStreams.length} siaran langsung</p>
                </div>
              </div>
              <button
                onClick={closeVideoList}
                className="w-10 h-10 bg-dark-800 hover:bg-dark-700 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
              <button className="px-4 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-full whitespace-nowrap">
                Semua
              </button>
              <button className="px-4 py-1.5 bg-dark-800 text-dark-300 hover:text-white text-xs font-medium rounded-full whitespace-nowrap transition-colors">
                ⚽ Sports
              </button>
              <button className="px-4 py-1.5 bg-dark-800 text-dark-300 hover:text-white text-xs font-medium rounded-full whitespace-nowrap transition-colors">
                🎮 Esports
              </button>
              <button className="px-4 py-1.5 bg-dark-800 text-dark-300 hover:text-white text-xs font-medium rounded-full whitespace-nowrap transition-colors">
                🎰 Casino
              </button>
            </div>
          </div>

          {/* Stream Grid */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStreams.map(stream => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  onSelect={() => selectStream(stream)}
                />
              ))}
            </div>

            {liveStreams.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📺</div>
                <p className="text-dark-400">Tidak ada siaran langsung saat ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
