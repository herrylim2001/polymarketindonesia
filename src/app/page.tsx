'use client';

import { useState } from 'react';
import { TrendingUp, Flame, Star, Clock, ChevronRight, BarChart3 } from 'lucide-react';
import MarketCard from '@/components/MarketCard';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/types';
import Link from 'next/link';
import { formatCompactNumber } from '@/lib/utils';

export default function Home() {
  const { markets } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'featured'>('all');

  const featuredMarkets = markets.filter(m => m.featured);
  const trendingMarkets = markets.filter(m => m.trending);

  const filteredMarkets = activeTab === 'trending'
    ? trendingMarkets
    : activeTab === 'featured'
    ? featuredMarkets
    : markets;

  // Calculate total stats
  const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, 0);
  const totalBets = markets.reduce((sum, m) => sum + m.totalBets, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar />

        <div className="flex-1 min-w-0">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>
            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prediction Market Indonesia
              </h1>
              <p className="text-primary-100 text-lg mb-6 max-w-2xl">
                Prediksi berbagai event dan berita Indonesia. Politik, ekonomi, olahraga,
                dan lainnya. Dapatkan profit dari pengetahuan Anda!
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <p className="text-primary-200 text-xs uppercase tracking-wider">Total Volume</p>
                  <p className="text-white text-2xl font-bold">{formatCompactNumber(totalVolume)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <p className="text-primary-200 text-xs uppercase tracking-wider">Total Markets</p>
                  <p className="text-white text-2xl font-bold">{markets.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <p className="text-primary-200 text-xs uppercase tracking-wider">Total Prediksi</p>
                  <p className="text-white text-2xl font-bold">{formatCompactNumber(totalBets)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {CATEGORIES.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/kategori/${category.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-full border border-dark-700 transition-colors whitespace-nowrap"
              >
                <span>{category.icon}</span>
                <span className="text-white text-sm font-medium">{category.name}</span>
              </Link>
            ))}
            <Link
              href="/kategori"
              className="flex items-center gap-1 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-full border border-primary-500/20 transition-colors whitespace-nowrap"
            >
              <span className="text-primary-400 text-sm font-medium">Lihat Semua</span>
              <ChevronRight className="w-4 h-4 text-primary-400" />
            </Link>
          </div>

          {/* Featured Market Highlight */}
          {featuredMarkets[0] && (
            <Link href={`/market/${featuredMarkets[0].id}`}>
              <div className="bg-dark-800 rounded-xl overflow-hidden mb-8 border border-dark-700 hover:border-dark-600 transition-colors">
                <div className="md:flex">
                  <div className="md:w-2/5 h-48 md:h-auto relative">
                    <img
                      src={featuredMarkets[0].imageUrl}
                      alt={featuredMarkets[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-orange-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      <Flame className="w-3 h-3" />
                      Hot Market
                    </div>
                  </div>
                  <div className="md:w-3/5 p-6">
                    <div className="flex items-center gap-2 text-primary-400 text-sm mb-2">
                      <Star className="w-4 h-4" />
                      Featured Market
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {featuredMarkets[0].title}
                    </h2>
                    <p className="text-dark-400 text-sm mb-4 line-clamp-2">
                      {featuredMarkets[0].description}
                    </p>

                    {/* Outcomes Preview */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {featuredMarkets[0].outcomes.slice(0, 4).map((outcome) => (
                        <div
                          key={outcome.id}
                          className="bg-dark-700/50 rounded-lg p-3 flex items-center justify-between"
                        >
                          <span className="text-dark-300 text-sm truncate mr-2">
                            {outcome.label}
                          </span>
                          <span className={`font-bold ${
                            outcome.probability >= 50 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {outcome.probability}%
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-dark-400">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {formatCompactNumber(featuredMarkets[0].totalVolume)} volume
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(featuredMarkets[0].endDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6 border-b border-dark-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-primary-500 text-white'
                  : 'border-transparent text-dark-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Semua Markets
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'trending'
                  ? 'border-primary-500 text-white'
                  : 'border-transparent text-dark-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'featured'
                  ? 'border-primary-500 text-white'
                  : 'border-transparent text-dark-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              Featured
            </button>
          </div>

          {/* Markets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>

          {filteredMarkets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-dark-400 text-lg">Tidak ada market yang ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
