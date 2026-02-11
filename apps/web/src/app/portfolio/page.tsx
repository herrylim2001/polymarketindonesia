'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet, Plus, Minus, ArrowUpRight, ArrowDownLeft, BarChart3,
  TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatIDR, formatCompactNumber } from '@/lib/utils';

export default function PortfolioPage() {
  const router = useRouter();
  const { user, isLoggedIn, userBets, markets, addBalance, withdraw } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="p-8"><div className="animate-pulse h-96 bg-dark-800 rounded-xl" /></div>;

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Wallet className="w-16 h-16 text-dark-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Masuk untuk melihat portfolio</h1>
        <Link href="/auth" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Masuk / Daftar
        </Link>
      </div>
    );
  }

  const activeBets = userBets.filter(b => b.status === 'active');
  const totalInvested = activeBets.reduce((sum, b) => sum + b.amount, 0);
  const totalPotentialPayout = activeBets.reduce((sum, b) => sum + b.potentialPayout, 0);
  const potentialProfit = totalPotentialPayout - totalInvested;
  const totalAssets = user.balance + totalInvested;

  // Group bets by market
  const betsByMarket = activeBets.reduce((acc, bet) => {
    if (!acc[bet.marketId]) acc[bet.marketId] = [];
    acc[bet.marketId].push(bet);
    return acc;
  }, {} as Record<string, typeof activeBets>);

  const handleDeposit = () => {
    const val = parseInt(amount);
    if (!val || val < 10000) { setMessage('Minimum deposit Rp 10.000'); return; }
    addBalance(val);
    setAmount('');
    setShowDeposit(false);
    setMessage('');
  };

  const handleWithdraw = () => {
    const val = parseInt(amount);
    if (!val || val < 10000) { setMessage('Minimum withdraw Rp 10.000'); return; }
    const ok = withdraw(val);
    if (!ok) { setMessage('Saldo tidak mencukupi'); return; }
    setAmount('');
    setShowWithdraw(false);
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Portfolio</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 rounded-2xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <p className="text-primary-200 text-sm uppercase tracking-wider mb-1">Total Aset</p>
          <p className="text-4xl font-bold text-white mb-6">{formatIDR(totalAssets)}</p>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-primary-200 text-xs">Saldo Tersedia</p>
              <p className="text-white text-xl font-bold">{formatIDR(user.balance)}</p>
            </div>
            <div>
              <p className="text-primary-200 text-xs">Invested</p>
              <p className="text-white text-xl font-bold">{formatIDR(totalInvested)}</p>
            </div>
            <div>
              <p className="text-primary-200 text-xs">Potensi Profit</p>
              <p className="text-green-300 text-xl font-bold">+{formatIDR(potentialProfit)}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => { setShowDeposit(true); setShowWithdraw(false); setMessage(''); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" /> Deposit
            </button>
            <button
              onClick={() => { setShowWithdraw(true); setShowDeposit(false); setMessage(''); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors backdrop-blur-sm"
            >
              <Minus className="w-5 h-5" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Deposit / Withdraw Modal Inline */}
      {(showDeposit || showWithdraw) && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {showDeposit ? 'Deposit Saldo' : 'Withdraw Saldo'}
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={e => { setAmount(e.target.value); setMessage(''); }}
                placeholder="0"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <button
              onClick={showDeposit ? handleDeposit : handleWithdraw}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              {showDeposit ? 'Deposit' : 'Withdraw'}
            </button>
            <button
              onClick={() => { setShowDeposit(false); setShowWithdraw(false); setMessage(''); }}
              className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
            >
              Batal
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {[100000, 500000, 1000000, 5000000].map(q => (
              <button key={q} onClick={() => setAmount(q.toString())} className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-dark-300 text-sm rounded-lg transition-colors">
                {formatIDR(q)}
              </button>
            ))}
          </div>
          {message && (
            <p className="mt-3 text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {message}
            </p>
          )}
        </div>
      )}

      {/* Active Positions */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 mb-6">
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Posisi Aktif</h2>
          <span className="text-dark-400 text-sm">{activeBets.length} taruhan</span>
        </div>

        {activeBets.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400">Belum ada posisi aktif</p>
            <Link href="/" className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block">
              Jelajahi Markets
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {Object.entries(betsByMarket).map(([marketId, bets]) => {
              const market = markets.find(m => m.id === marketId);
              const totalAmount = bets.reduce((s, b) => s + b.amount, 0);
              const totalPayout = bets.reduce((s, b) => s + b.potentialPayout, 0);

              return (
                <Link key={marketId} href={`/market/${marketId}`} className="block p-4 hover:bg-dark-700/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium truncate mr-4">{market?.title || 'Market'}</h3>
                    <span className="text-green-500 font-medium flex-shrink-0">+{formatIDR(totalPayout - totalAmount)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bets.map(bet => (
                      <span key={bet.id} className="text-xs px-2 py-1 bg-dark-600 rounded text-dark-300">
                        {bet.outcomeLabel} @ {bet.probability}% — {formatIDR(bet.amount)}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <p className="text-dark-400 text-sm mb-1">Total Taruhan</p>
          <p className="text-2xl font-bold text-white">{user.totalBets}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <p className="text-dark-400 text-sm mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-white">
            {user.totalBets > 0 ? Math.round((user.totalWins / user.totalBets) * 100) : 0}%
          </p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <p className="text-dark-400 text-sm mb-1">Total Kemenangan</p>
          <p className="text-2xl font-bold text-green-500">{user.totalWins}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <p className="text-dark-400 text-sm mb-1">Total Profit</p>
          <p className={`text-2xl font-bold ${user.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatIDR(user.totalProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}
