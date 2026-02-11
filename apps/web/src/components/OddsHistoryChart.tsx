'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Market } from '@/types';

interface OddsHistoryChartProps {
  market: Market;
}

// Generate simulated historical data based on current probability
function generateHistory(currentProb: number, days: number = 30): Array<{ date: string; probability: number }> {
  const history: Array<{ date: string; probability: number }> = [];
  const now = new Date();
  let prob = 50 + (Math.random() - 0.5) * 20; // Start from ~50%

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random walk toward current probability
    const targetDrift = (currentProb - prob) * 0.05;
    const noise = (Math.random() - 0.5) * 6;
    prob = Math.max(2, Math.min(98, prob + targetDrift + noise));

    history.push({
      date: date.toISOString().split('T')[0],
      probability: Math.round(prob * 10) / 10,
    });
  }

  // Ensure last point matches current
  if (history.length > 0) {
    history[history.length - 1].probability = currentProb;
  }

  return history;
}

export default function OddsHistoryChart({ market }: OddsHistoryChartProps) {
  const [selectedOutcomeIdx, setSelectedOutcomeIdx] = useState(0);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');

  const outcome = market.outcomes[selectedOutcomeIdx];
  const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;

  const history = useMemo(
    () => generateHistory(outcome.probability, days),
    [outcome.probability, days]
  );

  // SVG chart dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minP = Math.max(0, Math.min(...history.map(h => h.probability)) - 5);
  const maxP = Math.min(100, Math.max(...history.map(h => h.probability)) + 5);
  const rangeP = maxP - minP || 1;

  // Build SVG path
  const points = history.map((h, i) => {
    const x = padding.left + (i / (history.length - 1)) * chartW;
    const y = padding.top + chartH - ((h.probability - minP) / rangeP) * chartH;
    return { x, y, ...h };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const first = history[0].probability;
  const last = history[history.length - 1].probability;
  const change = last - first;
  const isPositive = change >= 0;

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Riwayat Odds</h3>
        <div className="flex gap-1">
          {(['7d', '14d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-dark-400 hover:text-white'
              }`}
            >
              {range === '7d' ? '7H' : range === '14d' ? '14H' : '30H'}
            </button>
          ))}
        </div>
      </div>

      {/* Outcome Selector */}
      {market.outcomes.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {market.outcomes.map((o, i) => (
            <button
              key={o.id}
              onClick={() => setSelectedOutcomeIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedOutcomeIdx === i
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-dark-700 text-dark-400 hover:text-white border border-dark-600'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {/* Change indicator */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl font-bold text-white">{last}%</span>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${
          isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </div>
        <span className="text-dark-500 text-sm">{days} hari terakhir</span>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = padding.top + chartH * (1 - pct);
            const label = Math.round(minP + rangeP * pct);
            return (
              <g key={pct}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#2a2a3a" strokeWidth="1" />
                <text x={padding.left - 5} y={y + 4} textAnchor="end" fill="#555" fontSize="10">{label}%</text>
              </g>
            );
          })}

          {/* X axis labels */}
          {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1).map(p => (
            <text key={p.date} x={p.x} y={height - 5} textAnchor="middle" fill="#555" fontSize="9">
              {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'} />

          {/* Line */}
          <path d={linePath} fill="none" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Current point */}
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill={isPositive ? '#22c55e' : '#ef4444'}
            stroke="#1a1a2e"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
