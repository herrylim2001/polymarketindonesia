'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

interface ActivityItem {
  id: string;
  user: string;
  action: 'bet_yes' | 'bet_no';
  marketTitle: string;
  marketId: string;
  outcome: string;
  amount: number;
  timestamp: Date;
}

const NAMES = [
  'Budi S.', 'Siti R.', 'Ahmad F.', 'Dewi L.', 'Rudi H.',
  'Maya P.', 'Andi W.', 'Fitri H.', 'Doni P.', 'Rina S.',
  'Joko T.', 'Putri A.', 'Hendra K.', 'Lina M.', 'Arif N.',
];

const SAMPLE_MARKETS = [
  { id: '1', title: 'Pilkada DKI Jakarta 2024', outcomes: ['Anies Baswedan', 'Ridwan Kamil'] },
  { id: '2', title: 'Kurs USD/IDR akhir 2025', outcomes: ['Di bawah 15.500', 'Di atas 15.500'] },
  { id: '3', title: 'Timnas Indonesia lolos Piala Dunia', outcomes: ['Ya', 'Tidak'] },
  { id: '4', title: 'IHSG tembus 8.000', outcomes: ['Ya, Q1 2025', 'Tidak di 2025'] },
  { id: '5', title: 'Bitcoin tembus $100K', outcomes: ['Ya', 'Tidak'] },
];

function generateActivity(): ActivityItem {
  const market = SAMPLE_MARKETS[Math.floor(Math.random() * SAMPLE_MARKETS.length)];
  const isYes = Math.random() > 0.4;
  return {
    id: Math.random().toString(36).substring(2, 10),
    user: NAMES[Math.floor(Math.random() * NAMES.length)],
    action: isYes ? 'bet_yes' : 'bet_no',
    marketTitle: market.title,
    marketId: market.id,
    outcome: market.outcomes[isYes ? 0 : 1],
    amount: [50000, 100000, 250000, 500000, 1000000, 2500000][Math.floor(Math.random() * 6)],
    timestamp: new Date(),
  };
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate initial activities
    const initial = Array.from({ length: 5 }, () => generateActivity());
    setActivities(initial);

    // Add new activity every 3-8 seconds
    const interval = setInterval(() => {
      setActivities(prev => {
        const newItem = generateActivity();
        return [newItem, ...prev].slice(0, 8);
      });
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-700 flex items-center gap-2">
        <div className="relative">
          <Activity className="w-4 h-4 text-green-500" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <h3 className="text-white font-semibold text-sm">Aktivitas Live</h3>
      </div>
      <div className="divide-y divide-dark-700/50">
        {activities.map((item, i) => (
          <div
            key={item.id}
            className={`px-4 py-3 text-sm transition-all duration-500 ${
              i === 0 ? 'bg-dark-750/50' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`mt-0.5 p-1 rounded-full ${
                item.action === 'bet_yes' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {item.action === 'bet_yes' ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-dark-300">
                  <span className="text-white font-medium">{item.user}</span>
                  {' '}bet {formatIDR(item.amount)} pada{' '}
                  <span className={item.action === 'bet_yes' ? 'text-green-400' : 'text-red-400'}>
                    &quot;{item.outcome}&quot;
                  </span>
                </p>
                <p className="text-dark-500 text-xs mt-0.5 truncate">{item.marketTitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
