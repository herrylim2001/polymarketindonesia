'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, Filter, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import MarketCard from '@/components/MarketCard';
import { CATEGORIES } from '@/types';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="animate-pulse h-96 bg-dark-800 rounded-xl" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { markets } = useStore();

  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'volume' | 'newest' | 'ending'>('relevance');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    let filtered = markets.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.outcomes.some(o => o.label.toLowerCase().includes(q))
    );

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    switch (sortBy) {
      case 'volume':
        filtered.sort((a, b) => b.totalVolume - a.totalVolume);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'ending':
        filtered.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        break;
    }

    return filtered;
  }, [query, markets, categoryFilter, sortBy]);

  // Popular searches
  const popularSearches = ['Pilkada', 'Rupiah', 'Timnas', 'IHSG', 'Bitcoin', 'Liga 1', 'Prabowo', 'IKN'];

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-dark-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cari market, topik, atau event..."
          className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-12 pr-12 py-4 text-white text-lg placeholder-dark-500 focus:outline-none focus:border-primary-500"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Filters */}
      {query && (
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="relevance">Relevansi</option>
            <option value="volume">Volume Tertinggi</option>
            <option value="newest">Terbaru</option>
            <option value="ending">Segera Berakhir</option>
          </select>

          <span className="flex items-center text-dark-400 text-sm ml-auto">
            {results.length} hasil ditemukan
          </span>
        </div>
      )}

      {/* No Query State */}
      {!query && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-dark-600 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-white mb-4">Cari Prediction Market</h2>
          <p className="text-dark-400 mb-8">Temukan market berdasarkan topik, event, atau kata kunci</p>

          <div className="max-w-md mx-auto">
            <p className="text-dark-500 text-sm mb-3 flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" /> Pencarian Populer
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSearches.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-full text-sm transition-colors border border-dark-700"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {query && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(market => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}

      {/* No Results */}
      {query && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Tidak ada hasil untuk &quot;{query}&quot;
          </h3>
          <p className="text-dark-400">Coba kata kunci lain atau jelajahi kategori.</p>
        </div>
      )}
    </div>
  );
}
