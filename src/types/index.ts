export interface Market {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageUrl: string;
  endDate: string;
  totalVolume: number;
  totalBets: number;
  outcomes: Outcome[];
  status: 'active' | 'resolved' | 'pending' | 'cancelled';
  resolvedOutcome?: string;
  createdAt: string;
  featured?: boolean;
  trending?: boolean;
  source?: string;
}

export interface Outcome {
  id: string;
  label: string;
  probability: number; // 0-100
  totalBets: number;
  volume: number;
}

export interface Bet {
  id: string;
  marketId: string;
  outcomeId: string;
  outcomeLabel: string;
  marketTitle: string;
  userId: string;
  amount: number;
  probability: number; // probability at time of bet
  timestamp: string;
  potentialPayout: number;
  status: 'active' | 'won' | 'lost' | 'cancelled';
}

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  avatar?: string;
  totalBets: number;
  totalWins: number;
  totalProfit: number;
  joinedAt: string;
  bookmarks: string[];
}

export interface Notification {
  id: string;
  type: 'bet_placed' | 'market_resolved' | 'payout' | 'deposit' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export type Category =
  | 'politik'
  | 'ekonomi'
  | 'olahraga'
  | 'hiburan'
  | 'teknologi'
  | 'sosial'
  | 'hukum'
  | 'internasional';

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'politik',
    name: 'Politik',
    description: 'Pemilu, kebijakan pemerintah, dan politik Indonesia',
    icon: '🏛️',
    color: 'bg-blue-500'
  },
  {
    id: 'ekonomi',
    name: 'Ekonomi',
    description: 'Pasar saham, nilai tukar, dan ekonomi makro',
    icon: '📈',
    color: 'bg-green-500'
  },
  {
    id: 'olahraga',
    name: 'Olahraga',
    description: 'Liga 1, Timnas, badminton, dan olahraga lainnya',
    icon: '⚽',
    color: 'bg-orange-500'
  },
  {
    id: 'hiburan',
    name: 'Hiburan',
    description: 'Film, musik, selebriti, dan pop culture Indonesia',
    icon: '🎬',
    color: 'bg-purple-500'
  },
  {
    id: 'teknologi',
    name: 'Teknologi',
    description: 'Startup, crypto, dan teknologi di Indonesia',
    icon: '💻',
    color: 'bg-cyan-500'
  },
  {
    id: 'sosial',
    name: 'Sosial',
    description: 'Isu sosial, pendidikan, dan kesehatan',
    icon: '👥',
    color: 'bg-pink-500'
  },
  {
    id: 'hukum',
    name: 'Hukum',
    description: 'Kasus hukum dan keputusan pengadilan',
    icon: '⚖️',
    color: 'bg-amber-500'
  },
  {
    id: 'internasional',
    name: 'Internasional',
    description: 'Hubungan Indonesia dengan dunia internasional',
    icon: '🌏',
    color: 'bg-indigo-500'
  }
];
