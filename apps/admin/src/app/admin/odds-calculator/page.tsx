'use client';

import { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  probabilityToOdds,
  calculateBetOutcome,
  ConstantProductMarketMaker,
  estimateProbabilityAfterBet,
  formatOddsDisplay,
  probabilityToIndonesianOdds,
  calculatePayoutIndonesian,
} from '@/lib/odds';
import { formatIDR, formatNumber } from '@/lib/utils';

// Helper to parse formatted number back to number
const parseFormattedNumber = (value: string): number => {
  // Remove dots (thousand separator) and replace comma with dot for decimal
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  return parseInt(cleaned) || 0;
};

export default function OddsCalculatorPage() {
  // Basic Calculator
  const [probability, setProbability] = useState(50);
  const [betAmount, setBetAmount] = useState(100000);
  const [betAmountInput, setBetAmountInput] = useState('100.000');

  // AMM Simulator
  const [ammLiquidity, setAmmLiquidity] = useState(1000000);
  const [ammLiquidityInput, setAmmLiquidityInput] = useState('1.000.000');
  const [ammInitialProb, setAmmInitialProb] = useState(50);
  const [ammBetAmount, setAmmBetAmount] = useState(100000);
  const [ammBetAmountInput, setAmmBetAmountInput] = useState('100.000');
  const [ammBetSide, setAmmBetSide] = useState<'yes' | 'no'>('yes');

  // Handle bet amount input change
  const handleBetAmountChange = (value: string) => {
    setBetAmountInput(value);
    const numValue = parseFormattedNumber(value);
    setBetAmount(Math.max(0, numValue));
  };

  // Handle bet amount blur - format the number
  const handleBetAmountBlur = () => {
    setBetAmountInput(formatNumber(betAmount));
  };

  // Handle AMM liquidity input change
  const handleAmmLiquidityChange = (value: string) => {
    setAmmLiquidityInput(value);
    const numValue = parseFormattedNumber(value);
    setAmmLiquidity(Math.max(100000, numValue));
  };

  const handleAmmLiquidityBlur = () => {
    setAmmLiquidityInput(formatNumber(ammLiquidity));
  };

  // Handle AMM bet amount input change
  const handleAmmBetAmountChange = (value: string) => {
    setAmmBetAmountInput(value);
    const numValue = parseFormattedNumber(value);
    setAmmBetAmount(Math.max(0, numValue));
  };

  const handleAmmBetAmountBlur = () => {
    setAmmBetAmountInput(formatNumber(ammBetAmount));
  };

  // Quick amount selection
  const handleQuickAmount = (amount: number) => {
    setBetAmount(amount);
    setBetAmountInput(formatNumber(amount));
  };

  // Calculate basic odds
  const basicOdds = useMemo(() => {
    return calculateBetOutcome(betAmount, probability);
  }, [betAmount, probability]);

  const oddsFormats = useMemo(() => {
    return formatOddsDisplay(probability);
  }, [probability]);

  // AMM Calculation
  const ammResult = useMemo(() => {
    const amm = new ConstantProductMarketMaker(ammLiquidity, ammInitialProb);
    const state = amm.getState();

    const simulation =
      ammBetSide === 'yes'
        ? amm.simulateBuyYes(ammBetAmount)
        : amm.simulateBuyNo(ammBetAmount);

    return {
      state,
      currentYesProb: amm.getYesProbability(),
      currentNoProb: amm.getNoProbability(),
      simulation,
    };
  }, [ammLiquidity, ammInitialProb, ammBetAmount, ammBetSide]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Calculator className="w-7 h-7 text-primary-500" />
          Kalkulator Odds
        </h1>
        <p className="text-dark-400 mt-1">
          Hitung odds, payout, dan simulasi perubahan probabilitas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Odds Calculator */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Kalkulator Odds Dasar
          </h2>

          <div className="space-y-6">
            {/* Probability Input */}
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">
                Probabilitas (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={99}
                  value={probability}
                  onChange={(e) => setProbability(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={probability}
                  onChange={(e) =>
                    setProbability(Math.max(1, Math.min(99, parseInt(e.target.value) || 50)))
                  }
                  className="w-20 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-dark-500">
                <span>Rendah (1%)</span>
                <span>Tinggi (99%)</span>
              </div>
            </div>

            {/* Bet Amount */}
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">
                Jumlah Taruhan (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
                <input
                  type="text"
                  value={betAmountInput}
                  onChange={(e) => handleBetAmountChange(e.target.value)}
                  onBlur={handleBetAmountBlur}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-12 pr-4 py-3 text-white text-right text-lg font-semibold focus:outline-none focus:border-primary-500"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[100000, 500000, 1000000, 5000000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="px-3 py-1 bg-dark-700 hover:bg-dark-600 text-dark-300 text-xs rounded-lg transition-colors"
                  >
                    {formatNumber(amount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="bg-dark-700/50 rounded-xl p-6 space-y-4">
              <h3 className="text-white font-medium mb-4">Hasil Kalkulasi</h3>

              {/* Indonesian Odds - Primary Display */}
              <div className="bg-gradient-to-r from-red-500/10 to-white/5 border border-red-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">Odds Indonesia</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] rounded-full font-medium">UTAMA</span>
                </div>
                <p className={`text-3xl font-bold ${
                  oddsFormats.indonesian.startsWith('+') ? 'text-green-500' : 'text-red-400'
                }`}>
                  {oddsFormats.indonesian}
                </p>
                <p className="text-dark-400 text-xs mt-2">
                  {oddsFormats.indonesian.startsWith('+')
                    ? `Taruhan Rp 100.000 → profit Rp ${formatNumber(Math.round(parseFloat(oddsFormats.indonesian) * 100000))}`
                    : `Taruhan Rp ${formatNumber(Math.round(Math.abs(parseFloat(oddsFormats.indonesian)) * 100000))} → profit Rp 100.000`
                  }
                </p>
              </div>

              {/* All Odds Formats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-600/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs mb-1">Odds Desimal</p>
                  <p className="text-white text-xl font-bold">{oddsFormats.decimal}</p>
                </div>
                <div className="bg-dark-600/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs mb-1">Multiplier</p>
                  <p className="text-primary-400 text-xl font-bold">{oddsFormats.multiplier}</p>
                </div>
                <div className="bg-dark-600/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs mb-1">Odds Hong Kong</p>
                  <p className="text-white text-xl font-bold">{oddsFormats.hongkong}</p>
                </div>
                <div className="bg-dark-600/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs mb-1">Odds Malay</p>
                  <p className="text-white text-xl font-bold">{oddsFormats.malay}</p>
                </div>
                <div className="bg-dark-600/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs mb-1">Odds Fraksional</p>
                  <p className="text-white text-xl font-bold">{oddsFormats.fractional}</p>
                </div>
                <div className="bg-dark-600/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs mb-1">Odds Amerika</p>
                  <p className="text-white text-xl font-bold">{oddsFormats.american}</p>
                </div>
              </div>

              <hr className="border-dark-600" />

              {/* Payout Calculation */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-dark-400">Harga per Share</span>
                  <span className="text-white font-medium">
                    Rp {formatNumber(basicOdds.pricePerShare, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400">Shares Didapat</span>
                  <span className="text-white font-medium">
                    {formatNumber(Math.round(basicOdds.sharesReceived))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400">Taruhan</span>
                  <span className="text-white font-medium">Rp {formatNumber(betAmount)}</span>
                </div>
                <hr className="border-dark-600" />
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 font-medium">Potensi Payout</span>
                  <span className="text-white text-lg font-bold">
                    Rp {formatNumber(Math.round(basicOdds.potentialPayout))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 font-medium">Potensi Profit</span>
                  <span className="text-green-500 text-lg font-bold">
                    +Rp {formatNumber(Math.round(basicOdds.potentialProfit))}
                  </span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300 text-sm">
                Setiap share bernilai Rp 1 jika outcome menang. Jika kalah, share bernilai Rp 0.
                Profit = (Shares × Rp 1) - Taruhan
              </p>
            </div>
          </div>
        </div>

        {/* AMM Simulator */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            Simulasi AMM (Automated Market Maker)
          </h2>
          <p className="text-dark-400 text-sm mb-6">
            Simulasi bagaimana taruhan mempengaruhi probabilitas pasar
          </p>

          <div className="space-y-6">
            {/* AMM Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Likuiditas Awal (Rp)
                </label>
                <input
                  type="text"
                  value={ammLiquidityInput}
                  onChange={(e) => handleAmmLiquidityChange(e.target.value)}
                  onBlur={handleAmmLiquidityBlur}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white text-right font-semibold focus:outline-none focus:border-primary-500"
                />
                <div className="flex gap-1 mt-1">
                  {[1000000, 10000000, 100000000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setAmmLiquidity(amount);
                        setAmmLiquidityInput(formatNumber(amount));
                      }}
                      className="flex-1 px-2 py-1 bg-dark-600 hover:bg-dark-500 text-dark-300 text-[10px] rounded transition-colors"
                    >
                      {formatNumber(amount)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Prob. Awal (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={ammInitialProb}
                  onChange={(e) =>
                    setAmmInitialProb(Math.max(1, Math.min(99, parseInt(e.target.value) || 50)))
                  }
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white text-center focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Current State */}
            <div className="bg-dark-700/50 rounded-xl p-4">
              <p className="text-dark-400 text-xs uppercase tracking-wider mb-3">
                Status Pasar Saat Ini
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-dark-400 text-sm">YES</p>
                  <p className="text-green-500 text-2xl font-bold">
                    {ammResult.currentYesProb}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-dark-400 text-sm">NO</p>
                  <p className="text-red-500 text-2xl font-bold">
                    {ammResult.currentNoProb}%
                  </p>
                </div>
              </div>
            </div>

            {/* Bet Simulation */}
            <div className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Jumlah Taruhan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
                  <input
                    type="text"
                    value={ammBetAmountInput}
                    onChange={(e) => handleAmmBetAmountChange(e.target.value)}
                    onBlur={handleAmmBetAmountBlur}
                    className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-12 pr-4 py-3 text-white text-right text-lg font-semibold focus:outline-none focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  {[100000, 500000, 1000000, 5000000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setAmmBetAmount(amount);
                        setAmmBetAmountInput(formatNumber(amount));
                      }}
                      className="flex-1 px-2 py-1 bg-dark-600 hover:bg-dark-500 text-dark-300 text-[10px] rounded transition-colors"
                    >
                      {formatNumber(amount)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Pilih Sisi
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setAmmBetSide('yes')}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      ammBetSide === 'yes'
                        ? 'bg-green-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5 inline mr-2" />
                    BUY YES
                  </button>
                  <button
                    onClick={() => setAmmBetSide('no')}
                    className={`py-3 rounded-lg font-medium transition-colors ${
                      ammBetSide === 'no'
                        ? 'bg-red-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5 inline mr-2" />
                    BUY NO
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation Result */}
            <div className="bg-gradient-to-r from-dark-700/50 to-dark-600/50 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Hasil Simulasi
              </h3>

              <div className="space-y-4">
                {/* Price Impact */}
                <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <span className="text-dark-400">Price Impact</span>
                  <span
                    className={`font-bold ${
                      ammResult.simulation.priceImpact > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {ammResult.simulation.priceImpact > 0 ? '+' : ''}
                    {ammResult.simulation.priceImpact}%
                  </span>
                </div>

                {/* Probability Change */}
                <div className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg">
                  <div className="flex-1 text-center">
                    <p className="text-dark-400 text-xs mb-1">Sebelum</p>
                    <p className="text-white text-lg font-bold">
                      {ammBetSide === 'yes' ? ammResult.currentYesProb : ammResult.currentNoProb}%
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary-500" />
                  <div className="flex-1 text-center">
                    <p className="text-dark-400 text-xs mb-1">Sesudah</p>
                    <p className="text-primary-400 text-lg font-bold">
                      {ammResult.simulation.newProbability}%
                    </p>
                  </div>
                </div>

                {/* Shares & Payout */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-dark-400 text-xs mb-1">Shares Didapat</p>
                    <p className="text-white font-bold">
                      {formatNumber(Math.round(ammResult.simulation.sharesReceived))}
                    </p>
                  </div>
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-dark-400 text-xs mb-1">Harga Rata-rata</p>
                    <p className="text-white font-bold">
                      Rp {formatNumber(ammResult.simulation.avgPrice, 4)}
                    </p>
                  </div>
                </div>

                {/* Potential Payout */}
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-dark-300">Potensi Payout (jika menang)</span>
                    <span className="text-green-500 text-xl font-bold">
                      Rp {formatNumber(Math.round(ammResult.simulation.sharesReceived))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-dark-400 text-sm">Potensi Profit</span>
                    <span className="text-green-400 font-medium">
                      +Rp {formatNumber(Math.round(ammResult.simulation.sharesReceived - ammBetAmount))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-purple-500/10 rounded-lg">
              <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-purple-300 text-sm">
                <p className="font-medium mb-1">Constant Product Market Maker (CPMM)</p>
                <p>
                  Menggunakan formula x × y = k seperti Uniswap/Polymarket.
                  Semakin besar taruhan relatif terhadap likuiditas, semakin besar price impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Odds Reference Table */}
      <div className="mt-8 bg-dark-800 rounded-xl border border-dark-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          Tabel Referensi Odds
        </h2>
        <p className="text-dark-400 text-sm mb-4">
          Perbandingan format odds untuk berbagai probabilitas (taruhan Rp {formatNumber(100000)})
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-4 py-3 text-dark-400 font-medium">Prob.</th>
                <th className="text-left px-4 py-3 text-red-400 font-medium">Indonesia</th>
                <th className="text-left px-4 py-3 text-dark-400 font-medium">HK</th>
                <th className="text-left px-4 py-3 text-dark-400 font-medium">Malay</th>
                <th className="text-left px-4 py-3 text-dark-400 font-medium">Desimal</th>
                <th className="text-left px-4 py-3 text-dark-400 font-medium">Amerika</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium">Profit</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium">Total Kembali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {[90, 80, 70, 60, 50, 40, 30, 20, 10].map((prob) => {
                const odds = formatOddsDisplay(prob);
                const indoOdds = probabilityToIndonesianOdds(prob);
                const indoPayout = calculatePayoutIndonesian(100000, indoOdds);
                return (
                  <tr key={prob} className="hover:bg-dark-700/50">
                    <td className="px-4 py-3">
                      <span className={`font-medium ${prob >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                        {prob}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${indoOdds > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {indoOdds > 0 ? '+' : ''}{indoOdds.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{odds.hongkong}</td>
                    <td className="px-4 py-3 text-white">{odds.malay}</td>
                    <td className="px-4 py-3 text-white">{odds.decimal}</td>
                    <td className="px-4 py-3 text-white">{odds.american}</td>
                    <td className="px-4 py-3 text-right text-green-500 font-medium">
                      +Rp {formatNumber(Math.round(indoPayout.profit))}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      Rp {formatNumber(Math.round(indoPayout.totalReturn))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Penjelasan Odds Indonesia */}
      <div className="mt-6 bg-dark-800 rounded-xl border border-dark-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Cara Baca Odds Indonesia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-5">
            <h3 className="text-green-400 font-bold text-lg mb-3">Odds Positif (+)</h3>
            <p className="text-dark-300 text-sm mb-4">
              Menunjukkan <strong className="text-white">profit</strong> yang didapat per unit taruhan. Biasanya untuk outcome yang dianggap kurang mungkin (underdog).
            </p>
            <div className="bg-dark-800 rounded-lg p-4 space-y-2">
              <p className="text-dark-400 text-xs uppercase tracking-wider">Contoh: Odds +1,50</p>
              <p className="text-white text-sm">Taruhan: <strong>Rp {formatNumber(100000)}</strong></p>
              <p className="text-white text-sm">Profit: Rp {formatNumber(100000)} x 1,50 = <strong className="text-green-400">Rp {formatNumber(150000)}</strong></p>
              <p className="text-white text-sm">Total kembali: <strong>Rp {formatNumber(250000)}</strong></p>
            </div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-5">
            <h3 className="text-red-400 font-bold text-lg mb-3">Odds Negatif (-)</h3>
            <p className="text-dark-300 text-sm mb-4">
              Menunjukkan <strong className="text-white">berapa yang harus ditaruhkan</strong> untuk profit 1 unit. Biasanya untuk outcome favorit.
            </p>
            <div className="bg-dark-800 rounded-lg p-4 space-y-2">
              <p className="text-dark-400 text-xs uppercase tracking-wider">Contoh: Odds -1,50</p>
              <p className="text-white text-sm">Taruhan: <strong>Rp {formatNumber(150000)}</strong></p>
              <p className="text-white text-sm">Profit: Rp {formatNumber(150000)} / 1,50 = <strong className="text-green-400">Rp {formatNumber(100000)}</strong></p>
              <p className="text-white text-sm">Total kembali: <strong>Rp {formatNumber(250000)}</strong></p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Rumus Cepat:</strong> Odds positif → profit = taruhan × odds. Odds negatif → profit = taruhan ÷ |odds|.
            Semakin besar angka positif, semakin besar potensi profit tapi semakin kecil kemungkinan menang.
          </p>
        </div>
      </div>
    </div>
  );
}
