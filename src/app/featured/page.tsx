'use client';

import { Star, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import MarketCard from '@/components/MarketCard';
import Sidebar from '@/components/Sidebar';
import { formatCompactNumber } from '@/lib/utils';

export default function FeaturedPage() {
  const { markets } = useStore();
  const featuredMarkets = markets.filter(m => m.featured);

  const totalVolume = featuredMarkets.reduce((sum, m) => sum + m.totalVolume, 0);
  const totalBets = featuredMarkets.reduce((sum, m) => sum + m.totalBets, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Featured Markets</h1>
                  <p className="text-purple-100">Market pilihan dengan volume dan minat tertinggi</p>
                </div>
              </div>

              <div className="flex gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <p className="text-purple-200 text-xs uppercase tracking-wider">Total Markets</p>
                  <p className="text-white text-2xl font-bold">{featuredMarkets.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <p className="text-purple-200 text-xs uppercase tracking-wider">Total Volume</p>
                  <p className="text-white text-2xl font-bold">{formatCompactNumber(totalVolume)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <p className="text-purple-200 text-xs uppercase tracking-wider">Total Prediksi</p>
                  <p className="text-white text-2xl font-bold">{formatCompactNumber(totalBets)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Markets Grid */}
          {featuredMarkets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          ) : (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
              <Star className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Belum ada featured market
              </h3>
              <p className="text-dark-400">
                Market featured akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
