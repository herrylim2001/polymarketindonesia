'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Users, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/types';
import MarketCard from '@/components/MarketCard';
import Sidebar from '@/components/Sidebar';
import { formatCompactNumber, formatIDR } from '@/lib/utils';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { markets } = useStore();

  const category = CATEGORIES.find(c => c.id === params.category);
  const categoryMarkets = markets.filter(m => m.category === params.category);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Kategori tidak ditemukan</h1>
          <p className="text-dark-400 mb-6">Kategori yang Anda cari tidak ada.</p>
          <button
            onClick={() => router.push('/kategori')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Lihat Semua Kategori
          </button>
        </div>
      </div>
    );
  }

  const totalVolume = categoryMarkets.reduce((sum, m) => sum + m.totalVolume, 0);
  const totalBets = categoryMarkets.reduce((sum, m) => sum + m.totalBets, 0);
  const trendingMarkets = categoryMarkets.filter(m => m.trending);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar />

        <div className="flex-1 min-w-0">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>

          {/* Category Header */}
          <div className={`bg-gradient-to-r from-dark-800 to-dark-900 rounded-2xl p-8 mb-8 border border-dark-700 relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 ${category.color}`} />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${category.color} bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl`}>
                  {category.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{category.name}</h1>
                  <p className="text-dark-400 mt-1">{category.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="bg-dark-700/50 rounded-xl px-5 py-3">
                  <p className="text-dark-400 text-xs uppercase tracking-wider">Markets</p>
                  <p className="text-white text-2xl font-bold">{categoryMarkets.length}</p>
                </div>
                <div className="bg-dark-700/50 rounded-xl px-5 py-3">
                  <p className="text-dark-400 text-xs uppercase tracking-wider">Volume</p>
                  <p className="text-white text-2xl font-bold">{formatCompactNumber(totalVolume)}</p>
                </div>
                <div className="bg-dark-700/50 rounded-xl px-5 py-3">
                  <p className="text-dark-400 text-xs uppercase tracking-wider">Prediksi</p>
                  <p className="text-white text-2xl font-bold">{formatCompactNumber(totalBets)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trending in Category */}
          {trendingMarkets.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-white">Trending di {category.name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {trendingMarkets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            </div>
          )}

          {/* All Markets */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Semua Market {category.name}
            </h2>

            {categoryMarkets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {categoryMarkets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            ) : (
              <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Belum ada market
                </h3>
                <p className="text-dark-400 mb-6">
                  Market untuk kategori {category.name} belum tersedia.
                </p>
                <Link
                  href="/"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                >
                  Jelajahi Market Lain
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
