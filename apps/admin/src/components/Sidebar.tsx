'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Star, Clock, BarChart2 } from 'lucide-react';
import { CATEGORIES } from '@/types';
import { useStore } from '@/store/useStore';
import { formatCompactNumber } from '@/lib/utils';

function SidebarStats() {
  const { markets } = useStore();
  const activeMarkets = markets.filter(m => m.status === 'active');
  const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, 0);
  const totalBets = markets.reduce((sum, m) => sum + m.totalBets, 0);

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-5 h-5 text-white" />
        <h3 className="text-white font-semibold">Statistik Platform</h3>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-primary-200 text-xs">Total Volume</p>
          <p className="text-white font-bold text-lg">Rp {formatCompactNumber(totalVolume)}</p>
        </div>
        <div>
          <p className="text-primary-200 text-xs">Total Markets</p>
          <p className="text-white font-bold text-lg">{activeMarkets.length} Aktif</p>
        </div>
        <div>
          <p className="text-primary-200 text-xs">Total Prediksi</p>
          <p className="text-white font-bold text-lg">{formatCompactNumber(totalBets)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const mainLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/featured', label: 'Featured', icon: Star },
    { href: '/ending-soon', label: 'Segera Berakhir', icon: Clock },
  ];

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Main Navigation */}
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <h3 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Menu
          </h3>
          <nav className="space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Categories */}
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <h3 className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Kategori
          </h3>
          <nav className="space-y-1">
            {CATEGORIES.map((category) => {
              const isActive = pathname === `/kategori/${category.id}`;
              return (
                <Link
                  key={category.id}
                  href={`/kategori/${category.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Stats Card */}
        <SidebarStats />
      </div>
    </aside>
  );
}
