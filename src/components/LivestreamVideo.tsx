'use client';

import React, { useState } from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX, Settings, Users, MessageCircle, Share2, Radio } from 'lucide-react';

type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | '21:9';

interface LivestreamVideoProps {
  src?: string;
  title?: string;
  aspectRatio?: AspectRatio;
  showControls?: boolean;
  showOverlay?: boolean;
  viewerCount?: number;
  isLive?: boolean;
  autoPlay?: boolean;
  className?: string;
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  '16:9': 'aspect-video', // 16:9
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16]',
  '21:9': 'aspect-[21/9]',
};

export default function LivestreamVideo({
  src = '',
  title = 'Live Stream',
  aspectRatio = '16:9',
  showControls = true,
  showOverlay = true,
  viewerCount = 0,
  isLive = true,
  autoPlay = false,
  className = '',
}: LivestreamVideoProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const handleFullscreen = () => {
    const container = document.getElementById('livestream-container');
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Placeholder untuk wireframe jika tidak ada src
  const renderPlaceholder = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated pulse effect */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/30 w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
        <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center relative z-10">
          <Radio className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>
      <p className="text-white/80 mt-6 text-lg font-medium">Menunggu Stream...</p>
      <p className="text-white/50 text-sm mt-2">Video akan muncul di sini</p>
    </div>
  );

  // Render iframe jika ada src
  const renderIframe = () => (
    <iframe
      src={src}
      title={title}
      className="absolute inset-0 w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      style={{ border: 'none' }}
    />
  );

  return (
    <div
      id="livestream-container"
      className={`relative bg-dark-900 rounded-xl overflow-hidden shadow-2xl ${className}`}
    >
      {/* Video Container with Aspect Ratio */}
      <div className={`relative w-full ${aspectRatioClasses[aspectRatio]} bg-black`}>
        {src ? renderIframe() : renderPlaceholder()}

        {/* Overlay Controls */}
        {showOverlay && (
          <>
            {/* Top Overlay - Live Badge & Title */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isLive && (
                    <div className="flex items-center gap-2 bg-danger-500 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-sm font-bold uppercase">Live</span>
                    </div>
                  )}
                  <h3 className="text-white font-semibold text-lg hidden sm:block">{title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  {viewerCount > 0 && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{viewerCount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <button className="text-white/80 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Overlay - Controls */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleFullscreen}
                      className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Komponen untuk memilih aspect ratio
interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const ratios: { value: AspectRatio; label: string; icon: string }[] = [
    { value: '16:9', label: 'Widescreen', icon: '▭' },
    { value: '4:3', label: 'Standard', icon: '□' },
    { value: '1:1', label: 'Square', icon: '⬜' },
    { value: '9:16', label: 'Portrait', icon: '▯' },
    { value: '21:9', label: 'Ultra Wide', icon: '▬' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {ratios.map((ratio) => (
        <button
          key={ratio.value}
          onClick={() => onChange(ratio.value)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            value === ratio.value
              ? 'bg-primary-500 text-white'
              : 'bg-dark-700 text-white/70 hover:bg-dark-600 hover:text-white'
          }`}
        >
          <span className="text-lg">{ratio.icon}</span>
          <span className="text-sm font-medium">{ratio.label}</span>
          <span className="text-xs opacity-60">({ratio.value})</span>
        </button>
      ))}
    </div>
  );
}

// Komponen untuk multiple video layout
interface MultiStreamLayoutProps {
  streams: Array<{
    id: string;
    src?: string;
    title: string;
    isLive?: boolean;
    viewerCount?: number;
  }>;
  layout?: 'grid' | 'pip' | 'side-by-side';
}

export function MultiStreamLayout({ streams, layout = 'grid' }: MultiStreamLayoutProps) {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'pip':
        return 'relative';
      case 'side-by-side':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'grid':
      default:
        return `grid gap-4 ${
          streams.length === 1
            ? 'grid-cols-1'
            : streams.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : streams.length <= 4
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`;
    }
  };

  if (layout === 'pip' && streams.length >= 2) {
    return (
      <div className="relative">
        <LivestreamVideo
          src={streams[0].src}
          title={streams[0].title}
          isLive={streams[0].isLive}
          viewerCount={streams[0].viewerCount}
        />
        <div className="absolute bottom-4 right-4 w-1/4 min-w-[200px] shadow-2xl">
          <LivestreamVideo
            src={streams[1].src}
            title={streams[1].title}
            isLive={streams[1].isLive}
            showControls={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={getLayoutClasses()}>
      {streams.map((stream) => (
        <LivestreamVideo
          key={stream.id}
          src={stream.src}
          title={stream.title}
          isLive={stream.isLive}
          viewerCount={stream.viewerCount}
        />
      ))}
    </div>
  );
}
