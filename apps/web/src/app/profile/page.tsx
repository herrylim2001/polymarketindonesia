'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Wallet, BarChart3, Trophy, Clock, TrendingUp, TrendingDown,
  Calendar, Target, ArrowUpRight, Settings,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatIDR, formatCompactNumber, formatDate, formatTimeRemaining } from '@/lib/utils';
import { CATEGORIES } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, userBets, markets } = useStore();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'active' | 'history' | 'bookmarks'>('active');

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="p-8"><div className="animate-pulse h-96 bg-dark-800 rounded-xl" /></div>;

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <User className="w-16 h-16 text-dark-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Masuk untuk melihat profil</h1>
        <p className="text-dark-400 mb-6">Anda perlu masuk untuk mengakses halaman profil.</p>
        <Link href="/auth" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Masuk / Daftar
        </Link>
      </div>
    );
  }

  const activeBets = userBets.filter(b => b.status === 'active');
  const historyBets = userBets.filter(b => b.status !== 'active');
  const totalInvested = activeBets.reduce((sum, b) => sum + b.amount, 0);
  const totalPotentialPayout = activeBets.reduce((sum, b) => sum + b.potentialPayout, 0);
  const bookmarkedMarkets = markets.filter(m => user.bookmarks.includes(m.id));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
            <p className="text-dark-400">{user.email}</p>
            <p className="text-dark-500 text-sm mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Bergabung {formatDate(user.joinedAt)}
            </p>
          </div>
          <Link
            href="/portfolio"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            <Wallet className="w-5 h-5" />
            Portfolio
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-green-500" />
            <span className="text-dark-400 text-sm">Saldo</span>
          </div>
          <p className="text-xl font-bold text-white">{formatIDR(user.balance)}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-dark-400 text-sm">Total Taruhan</span>
          </div>
          <p className="text-xl font-bold text-white">{user.totalBets}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="text-dark-400 text-sm">Invested</span>
          </div>
          <p className="text-xl font-bold text-white">{formatIDR(totalInvested)}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            <span className="text-dark-400 text-sm">Potensi Payout</span>
          </div>
          <p className="text-xl font-bold text-green-500">{formatIDR(totalPotentialPayout)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-dark-700">
        {[
          { key: 'active', label: 'Taruhan Aktif', count: activeBets.length },
          { key: 'history', label: 'Riwayat', count: historyBets.length },
          { key: 'bookmarks', label: 'Bookmark', count: bookmarkedMarkets.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              tab === t.key ? 'border-primary-500 text-white' : 'border-transparent text-dark-400 hover:text-white'
            }`}
          >
            {t.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              tab === t.key ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-dark-400'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'active' && (
        <div className="space-y-4">
          {activeBets.length === 0 ? (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
              <BarChart3 className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Belum ada taruhan aktif</h3>
              <p className="text-dark-400 mb-4">Jelajahi markets dan mulai prediksi!</p>
              <Link href="/" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors inline-block">
                Jelajahi Markets
              </Link>
            </div>
          ) : (
            activeBets.map(bet => {
              const market = markets.find(m => m.id === bet.marketId);
              return (
                <Link key={bet.id} href={`/market/${bet.marketId}`} className="block bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-dark-600 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium truncate mr-4">{bet.marketTitle}</h3>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex-shrink-0">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-dark-400">
                      Prediksi: <span className="text-primary-400 font-medium">{bet.outcomeLabel}</span> ({bet.probability}%)
                    </div>
                    <div className="text-right">
                      <span className="text-dark-400">Taruhan: </span>
                      <span className="text-white font-medium">{formatIDR(bet.amount)}</span>
                      <span className="text-dark-400 mx-2">|</span>
                      <span className="text-dark-400">Payout: </span>
                      <span className="text-green-500 font-medium">{formatIDR(bet.potentialPayout)}</span>
                    </div>
                  </div>
                  <p className="text-dark-500 text-xs mt-2">{new Date(bet.timestamp).toLocaleString('id-ID')}</p>
                </Link>
              );
            })
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {historyBets.length === 0 ? (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
              <Clock className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Belum ada riwayat</h3>
              <p className="text-dark-400">Riwayat taruhan yang sudah selesai akan muncul di sini.</p>
            </div>
          ) : (
            historyBets.map(bet => (
              <div key={bet.id} className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium truncate mr-4">{bet.marketTitle}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bet.status === 'won' ? 'bg-green-500/20 text-green-400' :
                    bet.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {bet.status === 'won' ? 'Menang' : bet.status === 'lost' ? 'Kalah' : 'Dibatalkan'}
                  </span>
                </div>
                <p className="text-dark-400 text-sm">
                  Prediksi: {bet.outcomeLabel} | Taruhan: {formatIDR(bet.amount)} | Payout: {formatIDR(bet.potentialPayout)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarkedMarkets.length === 0 ? (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
              <Target className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Belum ada bookmark</h3>
              <p className="text-dark-400">Simpan market favorit Anda dengan bookmark.</p>
            </div>
          ) : (
            bookmarkedMarkets.map(market => (
              <Link key={market.id} href={`/market/${market.id}`} className="block bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-dark-600 transition-colors">
                <h3 className="text-white font-medium mb-2">{market.title}</h3>
                <div className="flex items-center gap-4 text-sm text-dark-400">
                  <span>{formatIDR(market.totalVolume)} volume</span>
                  <span>{formatTimeRemaining(market.endDate)}</span>
                  <span>{market.outcomes[0]?.label}: {market.outcomes[0]?.probability}%</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
