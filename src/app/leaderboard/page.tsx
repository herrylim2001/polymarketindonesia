'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, BarChart3, Users, Crown } from 'lucide-react';
import { formatIDR, formatCompactNumber } from '@/lib/utils';

// Simulated leaderboard data
const leaderboardData = [
  { rank: 1, username: 'CryptoMaster99', profit: 125000000, winRate: 78, totalBets: 342, avatar: 'C' },
  { rank: 2, username: 'PolitikWatcher', profit: 98500000, winRate: 72, totalBets: 289, avatar: 'P' },
  { rank: 3, username: 'SahamPro', profit: 87200000, winRate: 69, totalBets: 415, avatar: 'S' },
  { rank: 4, username: 'SportsBetter_ID', profit: 76800000, winRate: 65, totalBets: 523, avatar: 'S' },
  { rank: 5, username: 'IndonesiaFirst', profit: 65400000, winRate: 71, totalBets: 198, avatar: 'I' },
  { rank: 6, username: 'DataDriven', profit: 54300000, winRate: 68, totalBets: 267, avatar: 'D' },
  { rank: 7, username: 'MakroEkon', profit: 48700000, winRate: 64, totalBets: 312, avatar: 'M' },
  { rank: 8, username: 'FutureReader', profit: 42100000, winRate: 62, totalBets: 178, avatar: 'F' },
  { rank: 9, username: 'PrediksiAkurat', profit: 38900000, winRate: 67, totalBets: 234, avatar: 'P' },
  { rank: 10, username: 'NusantaraTrader', profit: 35600000, winRate: 60, totalBets: 345, avatar: 'N' },
  { rank: 11, username: 'BeritaHunter', profit: 32400000, winRate: 59, totalBets: 267, avatar: 'B' },
  { rank: 12, username: 'OddsMaster', profit: 29800000, winRate: 63, totalBets: 189, avatar: 'O' },
  { rank: 13, username: 'JakartaBet', profit: 27500000, winRate: 57, totalBets: 298, avatar: 'J' },
  { rank: 14, username: 'SmartPredictor', profit: 24200000, winRate: 61, totalBets: 156, avatar: 'S' },
  { rank: 15, username: 'PolyKing', profit: 21800000, winRate: 55, totalBets: 213, avatar: 'P' },
];

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('monthly');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="p-8"><div className="animate-pulse h-96 bg-dark-800 rounded-xl" /></div>;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-amber-600';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-600 to-orange-700';
    return 'from-dark-600 to-dark-700';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-500" />;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-dark-400">Top trader di PolyID berdasarkan profit</p>
      </div>

      {/* Period Filter */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-dark-800 rounded-xl p-1 border border-dark-700">
          {[
            { key: 'weekly', label: 'Mingguan' },
            { key: 'monthly', label: 'Bulanan' },
            { key: 'alltime', label: 'Sepanjang Waktu' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key as typeof period)}
              className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                period === p.key ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 2nd Place */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 text-center mt-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center text-dark-900 text-2xl font-bold mx-auto mb-3">
            {leaderboardData[1].avatar}
          </div>
          <Medal className="w-6 h-6 text-gray-300 mx-auto mb-2" />
          <p className="text-white font-semibold truncate">{leaderboardData[1].username}</p>
          <p className="text-green-500 font-bold mt-1">{formatIDR(leaderboardData[1].profit)}</p>
          <p className="text-dark-400 text-xs mt-1">{leaderboardData[1].winRate}% win rate</p>
        </div>

        {/* 1st Place */}
        <div className="bg-dark-800 rounded-xl border border-yellow-500/30 p-6 text-center relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-dark-900 text-3xl font-bold mx-auto mb-3 mt-2">
            {leaderboardData[0].avatar}
          </div>
          <p className="text-white font-bold text-lg truncate">{leaderboardData[0].username}</p>
          <p className="text-green-500 font-bold text-xl mt-1">{formatIDR(leaderboardData[0].profit)}</p>
          <p className="text-dark-400 text-sm mt-1">{leaderboardData[0].winRate}% win rate</p>
          <p className="text-dark-500 text-xs">{leaderboardData[0].totalBets} taruhan</p>
        </div>

        {/* 3rd Place */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 text-center mt-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
            {leaderboardData[2].avatar}
          </div>
          <Medal className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <p className="text-white font-semibold truncate">{leaderboardData[2].username}</p>
          <p className="text-green-500 font-bold mt-1">{formatIDR(leaderboardData[2].profit)}</p>
          <p className="text-dark-400 text-xs mt-1">{leaderboardData[2].winRate}% win rate</p>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">Rank</th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">Trader</th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">Profit</th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">Win Rate</th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">Taruhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {leaderboardData.map(trader => (
                <tr key={trader.rank} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(trader.rank) || (
                        <span className="text-dark-400 font-medium w-5 text-center">{trader.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getRankColor(trader.rank)} rounded-xl flex items-center justify-center text-white font-bold`}>
                        {trader.avatar}
                      </div>
                      <span className="text-white font-medium">{trader.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-green-500 font-bold">{formatIDR(trader.profit)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${trader.winRate >= 65 ? 'text-green-500' : 'text-white'}`}>
                      {trader.winRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-dark-300">{trader.totalBets}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
