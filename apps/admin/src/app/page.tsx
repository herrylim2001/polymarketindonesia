'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { formatIDR, formatCompactNumber } from '@/lib/utils';
import { CATEGORIES } from '@/types';

export default function AdminDashboard() {
  const { markets, transactions, totalVolume, totalBets, totalUsers, activeMarkets } =
    useAdminStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-dark-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 10);
  const pendingMarkets = markets.filter((m) => m.status === 'active');
  const resolvedMarkets = markets.filter((m) => m.status === 'resolved');

  // Calculate category distribution
  const categoryStats = CATEGORIES.map((cat) => {
    const catMarkets = markets.filter((m) => m.category === cat.id);
    const volume = catMarkets.reduce((sum, m) => sum + m.totalVolume, 0);
    return {
      ...cat,
      marketCount: catMarkets.length,
      volume,
    };
  }).sort((a, b) => b.volume - a.volume);

  // Calculate daily stats (mock)
  const todayBets = Math.floor(totalBets * 0.05);
  const todayVolume = Math.floor(totalVolume * 0.03);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-dark-400 mt-1">Overview performa platform PolyID</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              +12.5%
            </span>
          </div>
          <p className="text-dark-400 text-sm">Total Volume</p>
          <p className="text-2xl font-bold text-white">{formatCompactNumber(totalVolume)}</p>
          <p className="text-dark-500 text-xs mt-1">
            Hari ini: {formatCompactNumber(todayVolume)}
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              +8.3%
            </span>
          </div>
          <p className="text-dark-400 text-sm">Total Taruhan</p>
          <p className="text-2xl font-bold text-white">{formatCompactNumber(totalBets)}</p>
          <p className="text-dark-500 text-xs mt-1">
            Hari ini: {formatCompactNumber(todayBets)}
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              +5.2%
            </span>
          </div>
          <p className="text-dark-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{formatCompactNumber(totalUsers)}</p>
          <p className="text-dark-500 text-xs mt-1">
            Aktif hari ini: {Math.floor(totalUsers * 0.15)}
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              +2
            </span>
          </div>
          <p className="text-dark-400 text-sm">Markets Aktif</p>
          <p className="text-2xl font-bold text-white">{activeMarkets}</p>
          <p className="text-dark-500 text-xs mt-1">
            Total: {markets.length} markets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-dark-800 rounded-xl border border-dark-700">
          <div className="p-6 border-b border-dark-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Transaksi Terbaru</h2>
            <Link
              href="/admin/transactions"
              className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1"
            >
              Lihat Semua
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-dark-700">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tx.type === 'bet'
                        ? 'bg-blue-500/20'
                        : tx.type === 'deposit'
                        ? 'bg-green-500/20'
                        : 'bg-orange-500/20'
                    }`}
                  >
                    {tx.type === 'bet' ? (
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                    ) : tx.type === 'deposit' ? (
                      <DollarSign className="w-5 h-5 text-green-500" />
                    ) : (
                      <Activity className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{tx.username}</p>
                    <p className="text-dark-400 text-sm">
                      {tx.type === 'bet' ? 'Taruhan' : tx.type === 'deposit' ? 'Deposit' : tx.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatIDR(tx.amount)}</p>
                  <p className="text-dark-500 text-xs">
                    {new Date(tx.timestamp).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-dark-800 rounded-xl border border-dark-700">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-lg font-semibold text-white">Volume per Kategori</h2>
          </div>
          <div className="p-4 space-y-4">
            {categoryStats.slice(0, 6).map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-white text-sm">{cat.name}</span>
                  </div>
                  <span className="text-dark-400 text-sm">
                    {formatCompactNumber(cat.volume)}
                  </span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full`}
                    style={{
                      width: `${Math.max(5, (cat.volume / (categoryStats[0]?.volume || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Markets Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Markets */}
        <div className="bg-dark-800 rounded-xl border border-dark-700">
          <div className="p-6 border-b border-dark-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-white">Markets Aktif</h2>
            </div>
            <Link
              href="/admin/markets"
              className="text-primary-400 text-sm hover:text-primary-300"
            >
              Kelola
            </Link>
          </div>
          <div className="divide-y divide-dark-700 max-h-96 overflow-y-auto">
            {pendingMarkets.slice(0, 5).map((market) => (
              <Link
                key={market.id}
                href={`/admin/markets/${market.id}/edit`}
                className="block p-4 hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{market.title}</p>
                    <p className="text-dark-400 text-sm mt-1">
                      {market.outcomes.length} outcomes
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-primary-400 font-medium">
                      {formatCompactNumber(market.totalVolume)}
                    </p>
                    <p className="text-dark-500 text-xs">
                      {new Date(market.endDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-800 rounded-xl border border-dark-700">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link
              href="/admin/markets/new"
              className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-xl text-center transition-colors"
            >
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Buat Market Baru</p>
            </Link>
            <Link
              href="/admin/odds-calculator"
              className="bg-dark-700 hover:bg-dark-600 text-white p-4 rounded-xl text-center transition-colors"
            >
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Kalkulator Odds</p>
            </Link>
            <Link
              href="/admin/reports"
              className="bg-dark-700 hover:bg-dark-600 text-white p-4 rounded-xl text-center transition-colors"
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Lihat Laporan</p>
            </Link>
            <Link
              href="/admin/transactions"
              className="bg-dark-700 hover:bg-dark-600 text-white p-4 rounded-xl text-center transition-colors"
            >
              <DollarSign className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Transaksi</p>
            </Link>
          </div>

          {/* Status Summary */}
          <div className="px-6 pb-6">
            <div className="bg-dark-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-dark-300 text-sm">Markets Resolved</span>
                </div>
                <span className="text-white font-medium">{resolvedMarkets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-dark-300 text-sm">Markets Aktif</span>
                </div>
                <span className="text-white font-medium">{activeMarkets}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-dark-300 text-sm">Perlu Review</span>
                </div>
                <span className="text-white font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
