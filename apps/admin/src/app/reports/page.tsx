'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { formatIDR, formatCompactNumber } from '@/lib/utils';
import { CATEGORIES } from '@/types';

export default function ReportsPage() {
  const { markets, transactions, totalVolume, totalBets, totalUsers } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const categoryData = CATEGORIES.map((cat) => {
      const catMarkets = markets.filter((m) => m.category === cat.id);
      const volume = catMarkets.reduce((sum, m) => sum + m.totalVolume, 0);
      const bets = catMarkets.reduce((sum, m) => sum + m.totalBets, 0);
      return {
        ...cat,
        marketCount: catMarkets.length,
        volume,
        bets,
        percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0,
      };
    }).sort((a, b) => b.volume - a.volume);

    const topMarkets = [...markets]
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 10);

    const activeMarkets = markets.filter((m) => m.status === 'active').length;
    const resolvedMarkets = markets.filter((m) => m.status === 'resolved').length;

    // Daily volume simulation (mock data)
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        volume: Math.floor(totalVolume * (0.1 + Math.random() * 0.05)),
        bets: Math.floor(totalBets * (0.1 + Math.random() * 0.05)),
      };
    });

    return {
      categoryData,
      topMarkets,
      activeMarkets,
      resolvedMarkets,
      dailyData,
    };
  }, [markets, totalVolume, totalBets]);

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-dark-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate max for chart scaling
  const maxVolume = Math.max(...stats.dailyData.map((d) => d.volume));

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan & Statistik</h1>
          <p className="text-dark-400 mt-1">Analisis performa platform</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="90d">90 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              +15.3%
            </span>
          </div>
          <p className="text-dark-400 text-sm">Total Volume</p>
          <p className="text-2xl font-bold text-white">{formatIDR(totalVolume)}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              +8.7%
            </span>
          </div>
          <p className="text-dark-400 text-sm">Total Taruhan</p>
          <p className="text-2xl font-bold text-white">{totalBets.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <PieChart className="w-6 h-6 text-purple-500" />
            </div>
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              +2
            </span>
          </div>
          <p className="text-dark-400 text-sm">Markets Aktif</p>
          <p className="text-2xl font-bold text-white">{stats.activeMarkets}</p>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-dark-400 text-sm">Markets Resolved</p>
          <p className="text-2xl font-bold text-white">{stats.resolvedMarkets}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Volume Chart */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Volume Harian</h2>
          <div className="space-y-4">
            {stats.dailyData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-dark-400 text-sm w-16">{day.date}</span>
                <div className="flex-1 bg-dark-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${(day.volume / maxVolume) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm w-24 text-right">
                  {formatCompactNumber(day.volume)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Volume per Kategori</h2>
          <div className="space-y-4">
            {stats.categoryData.slice(0, 6).map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-white text-sm">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white text-sm font-medium">
                      {formatCompactNumber(cat.volume)}
                    </span>
                    <span className="text-dark-500 text-xs ml-2">
                      ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Markets */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Top 10 Markets by Volume</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-4 py-3 text-dark-400 font-medium text-sm">#</th>
                <th className="text-left px-4 py-3 text-dark-400 font-medium text-sm">Market</th>
                <th className="text-left px-4 py-3 text-dark-400 font-medium text-sm">Kategori</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium text-sm">Volume</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium text-sm">Taruhan</th>
                <th className="text-left px-4 py-3 text-dark-400 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {stats.topMarkets.map((market, index) => {
                const category = CATEGORIES.find((c) => c.id === market.category);
                return (
                  <tr key={market.id} className="hover:bg-dark-700/50">
                    <td className="px-4 py-3 text-dark-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium truncate block max-w-xs">
                        {market.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{category?.icon}</span>
                        <span className="text-dark-300 text-sm">{category?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-primary-400 font-medium">
                        {formatCompactNumber(market.totalVolume)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white">{market.totalBets.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          market.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : market.status === 'resolved'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {market.status === 'active' ? 'Aktif' : market.status === 'resolved' ? 'Resolved' : 'Batal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
