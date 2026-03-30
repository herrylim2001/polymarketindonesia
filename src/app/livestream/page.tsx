'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Play,
  Link2,
  Copy,
  Check,
  Eye,
  Layout,
  Radio,
  Maximize,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import LivestreamVideo, { AspectRatioSelector, MultiStreamLayout } from '@/components/LivestreamVideo';

type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | '21:9';
type ViewMode = 'single' | 'multi' | 'pip';
type DevicePreview = 'desktop' | 'tablet' | 'mobile' | 'tv';

export default function LivestreamPage() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [iframeUrl, setIframeUrl] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [devicePreview, setDevicePreview] = useState<DevicePreview>('desktop');
  const [copied, setCopied] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Sample streams for demo
  const demoStreams = [
    { id: '1', src: iframeUrl, title: 'Stream Utama', isLive: true, viewerCount: 1250 },
    { id: '2', src: '', title: 'Stream Kedua', isLive: true, viewerCount: 890 },
    { id: '3', src: '', title: 'Stream Ketiga', isLive: false, viewerCount: 0 },
    { id: '4', src: '', title: 'Stream Keempat', isLive: true, viewerCount: 456 },
  ];

  const devicePreviewConfig = {
    desktop: { width: '100%', maxWidth: '100%', icon: Monitor, label: 'Desktop' },
    tablet: { width: '768px', maxWidth: '768px', icon: Tablet, label: 'Tablet' },
    mobile: { width: '375px', maxWidth: '375px', icon: Smartphone, label: 'Mobile' },
    tv: { width: '100%', maxWidth: '100%', icon: Tv, label: 'TV / Large Screen' },
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe
  src="${iframeUrl || 'YOUR_STREAM_URL'}"
  width="100%"
  style="aspect-ratio: ${aspectRatio.replace(':', '/')};"
  frameborder="0"
  allowfullscreen
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
</iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleUrls = [
    { label: 'YouTube Live (Demo)', url: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
    { label: 'Vimeo (Demo)', url: 'https://player.vimeo.com/video/824804225' },
    { label: 'Custom RTMP', url: '' },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Livestream Video</h1>
                <p className="text-sm text-white/60">Wireframe & Prototype Demo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                ← Kembali
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Control Panel */}
        <div className="bg-dark-900 rounded-2xl p-6 mb-8 border border-dark-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary-400" />
            Control Panel
          </h2>

          {/* URL Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              URL Stream (iframe embed)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={iframeUrl}
                  onChange={(e) => setIframeUrl(e.target.value)}
                  placeholder="Paste iframe URL (YouTube, Vimeo, dll)"
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  Sample URL
                  <ChevronDown className={`w-4 h-4 transition-transform ${showUrlInput ? 'rotate-180' : ''}`} />
                </button>
                {showUrlInput && (
                  <div className="absolute top-full mt-2 right-0 bg-dark-800 border border-dark-600 rounded-xl p-2 min-w-[250px] shadow-xl z-10">
                    {sampleUrls.map((sample) => (
                      <button
                        key={sample.label}
                        onClick={() => {
                          setIframeUrl(sample.url);
                          setShowUrlInput(false);
                        }}
                        className="w-full text-left px-4 py-2 text-white/80 hover:bg-dark-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {sample.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleCopyEmbed}
                className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Embed'}
              </button>
            </div>
          </div>

          {/* Aspect Ratio Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Aspect Ratio
            </label>
            <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          </div>

          {/* View Mode & Device Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Layout Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'single', label: 'Single Video', icon: '◻️' },
                  { value: 'multi', label: 'Multi Grid', icon: '◫' },
                  { value: 'pip', label: 'Picture in Picture', icon: '◰' },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setViewMode(mode.value as ViewMode)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      viewMode === mode.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-700 text-white/70 hover:bg-dark-600 hover:text-white'
                    }`}
                  >
                    <span>{mode.icon}</span>
                    <span className="text-sm font-medium">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Preview */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Device Preview
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(devicePreviewConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setDevicePreview(key as DevicePreview)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        devicePreview === key
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-700 text-white/70 hover:bg-dark-600 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary-400" />
              Live Preview
            </h2>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                {devicePreviewConfig[devicePreview].label}
              </span>
              <span>|</span>
              <span>{aspectRatio}</span>
            </div>
          </div>

          {/* Device Frame */}
          <div
            className={`mx-auto transition-all duration-300 ${
              devicePreview === 'mobile' ? 'max-w-[375px]' :
              devicePreview === 'tablet' ? 'max-w-[768px]' :
              'max-w-full'
            }`}
          >
            {/* Browser Frame */}
            <div className={`bg-dark-800 rounded-t-xl ${devicePreview !== 'tv' ? 'p-2' : ''}`}>
              {devicePreview !== 'tv' && (
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-danger-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-success-500" />
                  </div>
                  <div className="flex-1 bg-dark-700 rounded-md px-3 py-1 text-xs text-white/40 truncate">
                    {iframeUrl || 'https://polymarket.id/livestream'}
                  </div>
                </div>
              )}
            </div>

            {/* Video Preview */}
            <div className={`bg-dark-800 ${devicePreview !== 'tv' ? 'p-4' : 'p-0'} rounded-b-xl`}>
              {viewMode === 'single' ? (
                <LivestreamVideo
                  src={iframeUrl}
                  title="Polymarket Indonesia - Live Stream"
                  aspectRatio={aspectRatio}
                  isLive={true}
                  viewerCount={1250}
                />
              ) : viewMode === 'multi' ? (
                <MultiStreamLayout
                  streams={demoStreams}
                  layout="grid"
                />
              ) : (
                <MultiStreamLayout
                  streams={demoStreams.slice(0, 2)}
                  layout="pip"
                />
              )}
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-900 rounded-xl p-6 border border-dark-700">
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
              <Maximize className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Responsive Design</h3>
            <p className="text-white/60 text-sm">
              Video player otomatis menyesuaikan dengan ukuran layar. Support mobile, tablet, dan desktop.
            </p>
          </div>

          <div className="bg-dark-900 rounded-xl p-6 border border-dark-700">
            <div className="w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-success-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Multiple Sources</h3>
            <p className="text-white/60 text-sm">
              Support berbagai sumber video: YouTube Live, Vimeo, Twitch, atau custom RTMP stream.
            </p>
          </div>

          <div className="bg-dark-900 rounded-xl p-6 border border-dark-700">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Layout className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Flexible Layout</h3>
            <p className="text-white/60 text-sm">
              Pilih layout yang sesuai: single video, multi-grid, atau picture-in-picture mode.
            </p>
          </div>
        </div>

        {/* Embed Code Preview */}
        <div className="mt-8 bg-dark-900 rounded-xl p-6 border border-dark-700">
          <h3 className="text-white font-semibold mb-4">Embed Code</h3>
          <pre className="bg-dark-950 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="text-green-400">
{`<iframe
  src="${iframeUrl || 'YOUR_STREAM_URL'}"
  width="100%"
  style="aspect-ratio: ${aspectRatio.replace(':', '/')};"
  frameborder="0"
  allowfullscreen
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
</iframe>`}
            </code>
          </pre>
        </div>
      </main>
    </div>
  );
}
