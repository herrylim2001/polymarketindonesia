'use client';

import { useState, useRef, useEffect } from 'react';
import { useVideoStore } from '@/store/videoStore';
import { AVAILABLE_GIFTS } from '@/types';
import { formatCompactNumber, formatIDR } from '@/lib/utils';

function ChatPanel() {
  const { chatMessages, sendMessage, closeChat } = useVideoStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim(), 'Anda');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-dark-700 bg-dark-850">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-semibold text-white text-xs">Live Chat</span>
        </div>
        <button
          onClick={closeChat}
          className="p-1 hover:bg-dark-700 rounded transition-colors"
        >
          <svg className="w-3 h-3 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="h-32 overflow-y-auto p-2 space-y-1.5 scrollbar-hide">
        {chatMessages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-1.5 text-xs animate-fadeIn">
            <span className={`font-medium ${msg.isVIP ? 'text-amber-400' : 'text-primary-400'}`}>
              {msg.isVIP && '👑'}{msg.username}:
            </span>
            <span className="text-dark-200">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-dark-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tulis pesan..."
            className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-2 py-1.5 text-xs
                       text-white placeholder-dark-500 focus:border-primary-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700
                       disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function GiftPanel() {
  const { closeGiftModal } = useVideoStore();

  return (
    <div className="border-t border-dark-700 bg-dark-850">
      {/* Gift Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎁</span>
          <span className="font-semibold text-white text-xs">Kirim Gift</span>
        </div>
        <button
          onClick={closeGiftModal}
          className="p-1 hover:bg-dark-700 rounded transition-colors"
        >
          <svg className="w-3 h-3 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Gifts Grid */}
      <div className="p-2 grid grid-cols-3 gap-2">
        {AVAILABLE_GIFTS.map((gift) => (
          <button
            key={gift.id}
            className="flex flex-col items-center gap-0.5 p-2 bg-dark-800 hover:bg-dark-700
                       rounded-lg transition-all hover:scale-105 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">{gift.icon}</span>
            <span className="text-[10px] text-dark-300">{gift.name}</span>
            <span className="text-[10px] text-amber-400 font-medium">{formatIDR(gift.price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FloatingVideoPlayer() {
  const {
    isPlayerVisible,
    isPlayerMinimized,
    currentStream,
    closePlayer,
    minimizePlayer,
    maximizePlayer,
    openVideoList,
    isChatOpen,
    isGiftModalOpen,
    toggleChat,
    toggleGiftModal,
  } = useVideoStore();

  if (!isPlayerVisible || !currentStream) return null;

  // Minimized view - small floating button with video preview
  if (isPlayerMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-scaleIn">
        <button
          onClick={maximizePlayer}
          className="relative w-48 h-28 bg-dark-900 rounded-2xl overflow-hidden shadow-2xl
                     border border-dark-700 hover:border-primary-500 transition-all group
                     hover:scale-105"
        >
          {/* Mini video preview with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-900">
            {/* Simulated playing video indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-3xl animate-pulse">⚽</div>
            </div>
          </div>

          {/* Live badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            LIVE
          </div>

          {/* Viewer count */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px]">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white">{formatCompactNumber(currentStream.viewerCount)}</span>
          </div>

          {/* Stream info at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <p className="text-white text-[10px] font-medium truncate">{currentStream.participants || currentStream.title}</p>
            {currentStream.score && (
              <p className="text-primary-400 text-xs font-bold font-mono">{currentStream.score}</p>
            )}
          </div>

          {/* Expand icon overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePlayer();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-dark-800 hover:bg-red-600 rounded-full
                       flex items-center justify-center shadow-lg border border-dark-600
                       opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </button>
      </div>
    );
  }

  // Full floating widget view (bottom right, like live chat)
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 animate-scaleIn">
      <div className="bg-dark-900 rounded-2xl overflow-hidden shadow-2xl border border-dark-700">
        {/* Video Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-dark-850 border-b border-dark-700">
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="text-[10px] font-bold text-white">LIVE</span>
            </div>

            {/* Switch stream button */}
            <button
              onClick={openVideoList}
              className="p-1 hover:bg-dark-700 rounded transition-colors"
              title="Ganti stream"
            >
              <svg className="w-4 h-4 text-dark-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Minimize Button */}
            <button
              onClick={minimizePlayer}
              className="p-1 hover:bg-dark-700 rounded transition-colors"
              title="Minimize"
            >
              <svg className="w-4 h-4 text-dark-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              onClick={closePlayer}
              className="p-1 hover:bg-dark-700 rounded transition-colors"
              title="Tutup"
            >
              <svg className="w-4 h-4 text-dark-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video bg-black">
          {/* Placeholder video with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-black">
            {/* Simulated video content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl animate-pulse">⚽</div>
            </div>

            {/* Viewer count overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-1 rounded-full">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] text-white font-medium">{formatCompactNumber(currentStream.viewerCount)}</span>
            </div>

            {/* Event info overlay */}
            {currentStream.eventInfo && (
              <div className="absolute top-2 right-2 bg-primary-600/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-medium">
                {currentStream.eventInfo}
              </div>
            )}
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-dark-850 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-xs truncate">{currentStream.title}</h3>
              {currentStream.participants && (
                <p className="text-dark-400 text-[10px] mt-0.5 truncate">{currentStream.participants}</p>
              )}
            </div>

            {currentStream.score && (
              <div className="ml-2 px-2 py-1 bg-dark-700 rounded">
                <span className="text-primary-400 font-mono text-sm font-bold">{currentStream.score}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-dark-900 border-t border-dark-800">
          {/* Chat Button */}
          <button
            onClick={toggleChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium
                       ${isChatOpen
                         ? 'bg-primary-600 text-white'
                         : 'bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white'
                       }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>

          {/* Gift Button */}
          <button
            onClick={toggleGiftModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium
                       ${isGiftModalOpen
                         ? 'bg-amber-600 text-white'
                         : 'bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white'
                       }`}
          >
            <span>🎁</span>
            Gift
          </button>

          {/* Bet Button */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500
                       hover:from-green-500 hover:to-green-400 rounded-lg transition-all text-white text-xs font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Bet
          </button>
        </div>

        {/* Chat Panel (expandable) */}
        {isChatOpen && <ChatPanel />}

        {/* Gift Panel (expandable) */}
        {isGiftModalOpen && <GiftPanel />}
      </div>
    </div>
  );
}
