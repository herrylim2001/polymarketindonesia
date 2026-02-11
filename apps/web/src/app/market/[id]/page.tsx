'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Users, BarChart3, Share2, Bookmark, BookmarkCheck, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import BettingPanel from '@/components/BettingPanel';
import MarketCard from '@/components/MarketCard';
import OddsHistoryChart from '@/components/OddsHistoryChart';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import MarketComments from '@/components/MarketComments';
import ShareModal from '@/components/ShareModal';
import { formatIDR, formatDate, formatTimeRemaining, formatCompactNumber } from '@/lib/utils';
import { probabilityToIndonesianOdds } from '@/lib/odds';
import { CATEGORIES } from '@/types';
import Link from 'next/link';

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { markets, user, isLoggedIn, toggleBookmark } = useStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const market = markets.find(m => m.id === params.id);

  if (!market) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Market tidak ditemukan</h1>
          <p className="text-dark-400 mb-6">Market yang Anda cari tidak ada atau sudah dihapus.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.id === market.category);
  const relatedMarkets = markets
    .filter(m => m.category === market.category && m.id !== market.id)
    .slice(0, 3);

  const sortedOutcomes = [...market.outcomes].sort((a, b) => b.probability - a.probability);
  const isBookmarked = mounted && user?.bookmarks?.includes(market.id);
  const marketUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali</span>
      </button>

      <div className="lg:flex gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3">
          {/* Market Header */}
          <div className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700 mb-6">
            {/* Image */}
            <div className="relative h-64 md:h-80">
              <img
                src={market.imageUrl}
                alt={market.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent" />

              {/* Category Badge */}
              {category && (
                <Link
                  href={`/kategori/${category.id}`}
                  className={`absolute top-4 left-4 flex items-center gap-2 ${category.color} text-white text-sm font-medium px-3 py-1.5 rounded-full`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              )}

              {/* Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 bg-dark-800/80 hover:bg-dark-700 rounded-lg transition-colors"
                  title="Bagikan"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => {
                    if (isLoggedIn) toggleBookmark(market.id);
                    else router.push('/auth');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? 'bg-primary-500/20 hover:bg-primary-500/30'
                      : 'bg-dark-800/80 hover:bg-dark-700'
                  }`}
                  title={isBookmarked ? 'Hapus Bookmark' : 'Bookmark'}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-primary-400" />
                  ) : (
                    <Bookmark className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {market.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeRemaining(market.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {formatIDR(market.totalVolume)} volume
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {formatCompactNumber(market.totalBets)} prediksi
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 border-t border-dark-700">
              <h3 className="text-white font-semibold mb-2">Deskripsi</h3>
              <p className="text-dark-300">{market.description}</p>

              {market.source && (
                <div className="mt-4 flex items-center gap-2 text-sm text-dark-400">
                  <ExternalLink className="w-4 h-4" />
                  <span>Sumber: {market.source}</span>
                </div>
              )}
            </div>
          </div>

          {/* Odds History Chart */}
          <div className="mb-6">
            <OddsHistoryChart market={market} />
          </div>

          {/* Outcomes Detail */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 mb-6">
            <h3 className="text-white font-semibold text-lg mb-4">Probabilitas Outcomes</h3>

            <div className="space-y-4">
              {sortedOutcomes.map((outcome, index) => {
                const indoOdds = probabilityToIndonesianOdds(outcome.probability);
                return (
                  <div
                    key={outcome.id}
                    className="bg-dark-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="text-white font-medium">{outcome.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {outcome.probability >= 50 ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-2xl font-bold ${
                          outcome.probability >= 50 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {outcome.probability}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-dark-600 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all ${
                          outcome.probability >= 50 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${outcome.probability}%` }}
                      />
                    </div>

                    {/* Stats with Indo odds */}
                    <div className="flex items-center justify-between text-sm text-dark-400">
                      <span>
                        Odds Indo: <span className={`font-medium ${indoOdds > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {indoOdds > 0 ? '+' : ''}{indoOdds.toFixed(2)}
                        </span>
                      </span>
                      <span>Volume: <span className="text-white font-medium">{formatIDR(outcome.volume)}</span></span>
                      <span>Taruhan: <span className="text-white font-medium">{formatCompactNumber(outcome.totalBets)}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Market Info */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 mb-6">
            <h3 className="text-white font-semibold text-lg mb-4">Informasi Market</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-700/50 rounded-lg p-4">
                <p className="text-dark-400 text-sm mb-1">Status</p>
                <p className="text-white font-semibold capitalize">
                  {market.status === 'active' ? 'Aktif' : market.status === 'resolved' ? 'Selesai' : 'Pending'}
                </p>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-4">
                <p className="text-dark-400 text-sm mb-1">Dibuat</p>
                <p className="text-white font-semibold">{formatDate(market.createdAt)}</p>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-4">
                <p className="text-dark-400 text-sm mb-1">Berakhir</p>
                <p className="text-white font-semibold">{formatDate(market.endDate)}</p>
              </div>
              <div className="bg-dark-700/50 rounded-lg p-4">
                <p className="text-dark-400 text-sm mb-1">Kategori</p>
                <p className="text-white font-semibold">{category?.icon} {category?.name}</p>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="mb-6">
            <LiveActivityFeed />
          </div>

          {/* Comments / Discussion */}
          <div className="mb-6">
            <MarketComments marketId={market.id} />
          </div>

          {/* Related Markets */}
          {relatedMarkets.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Market Terkait</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedMarkets.map((m) => (
                  <MarketCard key={m.id} market={m} compact />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Betting Panel */}
        <div className="lg:w-1/3 mt-6 lg:mt-0">
          <div className="sticky top-24">
            <BettingPanel market={market} />

            {/* How it Works */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 mt-6">
              <h3 className="text-white font-semibold mb-4">Cara Kerja</h3>
              <ol className="space-y-3 text-sm text-dark-300">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary-500/20 text-primary-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">1</span>
                  <span>Pilih outcome yang Anda prediksi akan terjadi</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary-500/20 text-primary-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">2</span>
                  <span>Masukkan jumlah taruhan Anda</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-primary-500/20 text-primary-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">3</span>
                  <span>Jika prediksi Anda benar, dapatkan pembayaran sesuai odds</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={market.title}
        url={marketUrl}
      />
    </div>
  );
}
