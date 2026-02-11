'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/types';
import { useStore } from '@/store/useStore';
import { ChevronRight, BarChart3 } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';

export default function KategoriPage() {
  const { markets } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Semua Kategori</h1>
            <p className="text-dark-400">
              Jelajahi prediction market berdasarkan kategori yang Anda minati
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CATEGORIES.map((category) => {
              const categoryMarkets = markets.filter(m => m.category === category.id);
              const totalVolume = categoryMarkets.reduce((sum, m) => sum + m.totalVolume, 0);
              const totalBets = categoryMarkets.reduce((sum, m) => sum + m.totalBets, 0);

              return (
                <Link
                  key={category.id}
                  href={`/kategori/${category.id}`}
                  className="bg-dark-800 rounded-xl border border-dark-700 hover:border-dark-600 transition-all overflow-hidden group"
                >
                  <div className={`h-2 ${category.color}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${category.color} bg-opacity-20 rounded-xl flex items-center justify-center text-3xl`}>
                          {category.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                            {category.name}
                          </h2>
                          <p className="text-dark-400 text-sm mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-dark-500 group-hover:text-primary-500 transition-colors" />
                    </div>

                    <div className="mt-6 flex items-center gap-6 pt-4 border-t border-dark-700">
                      <div>
                        <p className="text-dark-500 text-xs uppercase tracking-wider">Markets</p>
                        <p className="text-white font-semibold text-lg">{categoryMarkets.length}</p>
                      </div>
                      <div>
                        <p className="text-dark-500 text-xs uppercase tracking-wider">Volume</p>
                        <p className="text-white font-semibold text-lg">{formatCompactNumber(totalVolume)}</p>
                      </div>
                      <div>
                        <p className="text-dark-500 text-xs uppercase tracking-wider">Prediksi</p>
                        <p className="text-white font-semibold text-lg">{formatCompactNumber(totalBets)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
