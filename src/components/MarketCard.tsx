'use client';

import Link from 'next/link';
import { TrendingUp, Clock, Users, BarChart3 } from 'lucide-react';
import { Market } from '@/types';
import { formatCompactNumber, formatTimeRemaining, getProbabilityColor } from '@/lib/utils';
import { probabilityToIndonesianOdds } from '@/lib/odds';

interface MarketCardProps {
  market: Market;
  compact?: boolean;
}

export default function MarketCard({ market, compact = false }: MarketCardProps) {
  const topOutcome = market.outcomes.reduce((a, b) =>
    a.probability > b.probability ? a : b
  );

  if (compact) {
    return (
      <Link href={`/market/${market.id}`}>
        <div className="bg-dark-800 rounded-lg p-4 hover:bg-dark-750 transition-colors border border-dark-700 hover:border-dark-600">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">
                {market.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-dark-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeRemaining(market.endDate)}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {formatCompactNumber(market.totalVolume)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getProbabilityColor(topOutcome.probability)}`}>
                {topOutcome.probability}%
              </div>
              <div className="text-xs text-dark-400 truncate max-w-[80px]">
                {topOutcome.label}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/market/${market.id}`}>
      <div className="bg-dark-800 rounded-xl overflow-hidden hover:bg-dark-750 transition-all border border-dark-700 hover:border-dark-600 hover:shadow-lg hover:shadow-primary-500/5">
        {/* Image */}
        <div className="relative h-40 bg-dark-700">
          <img
            src={market.imageUrl}
            alt={market.title}
            className="w-full h-full object-cover"
          />
          {market.trending && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500/90 text-white text-xs font-medium px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              Trending
            </div>
          )}
          {market.featured && !market.trending && (
            <div className="absolute top-3 left-3 bg-primary-500/90 text-white text-xs font-medium px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-base line-clamp-2 mb-3 min-h-[48px]">
            {market.title}
          </h3>

          {/* Outcomes Preview */}
          <div className="space-y-2 mb-4">
            {market.outcomes.slice(0, 2).map((outcome) => (
              <div key={outcome.id} className="flex items-center justify-between">
                <span className="text-dark-300 text-sm truncate max-w-[60%]">
                  {outcome.label}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        outcome.probability >= 50 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${outcome.probability}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-12 text-right ${getProbabilityColor(outcome.probability)}`}>
                    {outcome.probability}%
                  </span>
                </div>
              </div>
            ))}
            {market.outcomes.length > 2 && (
              <p className="text-dark-500 text-xs">
                +{market.outcomes.length - 2} pilihan lainnya
              </p>
            )}
          </div>

          {/* Indo Odds Badge */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {market.outcomes.slice(0, 2).map(o => {
              const indoOdds = probabilityToIndonesianOdds(o.probability);
              return (
                <span key={o.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  indoOdds > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {o.label}: {indoOdds > 0 ? '+' : ''}{indoOdds.toFixed(2)}
                </span>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-dark-700">
            <div className="flex items-center gap-4 text-xs text-dark-400">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                {formatCompactNumber(market.totalVolume)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {formatCompactNumber(market.totalBets)}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs text-dark-400">
              <Clock className="w-3.5 h-3.5" />
              {formatTimeRemaining(market.endDate)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
