'use client';

import { useState } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Market, Outcome } from '@/types';
import { useStore } from '@/store/useStore';
import { formatIDR, calculatePayout, probabilityToOdds } from '@/lib/utils';
import { probabilityToIndonesianOdds, calculatePayoutIndonesian } from '@/lib/odds';

interface BettingPanelProps {
  market: Market;
}

export default function BettingPanel({ market }: BettingPanelProps) {
  const { user, isLoggedIn, placeBet } = useStore();
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const quickAmounts = [100000, 500000, 1000000, 5000000];

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !amount) {
      setError('Pilih outcome dan masukkan jumlah taruhan');
      return;
    }

    const betAmount = parseInt(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      setError('Masukkan jumlah yang valid');
      return;
    }

    if (!user || betAmount > user.balance) {
      setError('Saldo tidak mencukupi');
      return;
    }

    if (betAmount < 10000) {
      setError('Minimum taruhan Rp 10.000');
      return;
    }

    setIsPlacingBet(true);
    setError(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = placeBet(market.id, selectedOutcome.id, betAmount);

    if (success) {
      setSuccess(`Berhasil memasang taruhan ${formatIDR(betAmount)} pada "${selectedOutcome.label}"`);
      setAmount('');
      setSelectedOutcome(null);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError('Gagal memasang taruhan. Silakan coba lagi.');
    }

    setIsPlacingBet(false);
  };

  const potentialPayout = selectedOutcome && amount
    ? calculatePayout(parseInt(amount) || 0, selectedOutcome.probability)
    : 0;

  const potentialProfit = potentialPayout - (parseInt(amount) || 0);

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      <div className="p-4 border-b border-dark-700">
        <h3 className="text-white font-semibold text-lg">Pasang Taruhan</h3>
        <p className="text-dark-400 text-sm mt-1">Pilih prediksi Anda</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Outcomes */}
        <div className="space-y-2">
          {market.outcomes.map((outcome) => (
            <button
              key={outcome.id}
              onClick={() => {
                setSelectedOutcome(outcome);
                setError(null);
              }}
              className={`w-full p-4 rounded-lg border transition-all ${
                selectedOutcome?.id === outcome.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-dark-600 hover:border-dark-500 bg-dark-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedOutcome?.id === outcome.id
                      ? 'border-primary-500'
                      : 'border-dark-500'
                  }`}>
                    {selectedOutcome?.id === outcome.id && (
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <span className="text-white font-medium">{outcome.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    outcome.probability >= 50 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {outcome.probability}%
                  </span>
                  {outcome.probability >= 50 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-dark-400">
                <span>
                  Odds Indo: <span className={`font-medium ${probabilityToIndonesianOdds(outcome.probability) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {probabilityToIndonesianOdds(outcome.probability) > 0 ? '+' : ''}{probabilityToIndonesianOdds(outcome.probability).toFixed(2)}
                  </span>
                  {' '}| Desimal: {probabilityToOdds(outcome.probability)}x
                </span>
                <span>Volume: {formatIDR(outcome.volume)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Amount Input */}
        {selectedOutcome && (
          <div className="space-y-3">
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">
                Jumlah Taruhan
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  placeholder="0"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white text-lg font-medium placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-300 text-sm rounded-lg transition-colors"
                >
                  {formatIDR(quickAmount)}
                </button>
              ))}
              {user && (
                <button
                  onClick={() => setAmount(user.balance.toString())}
                  className="px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 text-sm rounded-lg transition-colors"
                >
                  Max
                </button>
              )}
            </div>

            {/* Potential Payout */}
            {amount && parseInt(amount) > 0 && (() => {
              const indoOdds = probabilityToIndonesianOdds(selectedOutcome.probability);
              const indoPayout = calculatePayoutIndonesian(parseInt(amount) || 0, indoOdds);
              return (
                <div className="bg-dark-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Odds Indonesia</span>
                    <span className={`font-bold text-base ${indoOdds > 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {indoOdds > 0 ? '+' : ''}{indoOdds.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Odds Desimal</span>
                    <span className="text-primary-400 font-semibold">
                      {probabilityToOdds(selectedOutcome.probability)}x
                    </span>
                  </div>
                  <hr className="border-dark-600" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Potensi Pembayaran</span>
                    <span className="text-white font-semibold">{formatIDR(Math.round(indoPayout.totalReturn))}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Potensi Profit</span>
                    <span className="text-green-500 font-semibold">+{formatIDR(indoPayout.profit)}</span>
                  </div>
                  <div className="mt-2 p-2 bg-dark-600/50 rounded text-xs text-dark-400">
                    {indoPayout.description}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Info className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          disabled={!selectedOutcome || !amount || isPlacingBet}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
            selectedOutcome && amount && !isPlacingBet
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-dark-700 text-dark-500 cursor-not-allowed'
          }`}
        >
          {isPlacingBet ? 'Memproses...' : 'Pasang Taruhan'}
        </button>

        {/* Balance Info */}
        {user && (
          <div className="text-center text-sm text-dark-400">
            Saldo Anda: <span className="text-white font-medium">{formatIDR(user.balance)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
