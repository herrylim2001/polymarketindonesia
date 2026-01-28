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
  userId: string;
  amount: number;
  probability: number; // probability at time of bet
  timestamp: string;
  potentialPayout: number;
}

export interface User {
  id: string;
  username: string;
  balance: number;
  avatar?: string;
  totalBets: number;
  totalWins: number;
  totalProfit: number;
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

// Live Stream Types
export interface LiveStream {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  streamUrl: string;
  category: 'sports' | 'esports' | 'casino' | 'events';
  isLive: boolean;
  viewerCount: number;
  participants?: string; // e.g., "Kasnikowski, Maks - Engel, Justin"
  score?: string; // e.g., "3-2, 6-4"
  eventInfo?: string; // e.g., "ATP Challenger"
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  avatar?: string;
  isVIP?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number; // in IDR
}

export const AVAILABLE_GIFTS: Gift[] = [
  { id: '1', name: 'Love', icon: '❤️', price: 1000 },
  { id: '2', name: 'Fire', icon: '🔥', price: 5000 },
  { id: '3', name: 'Star', icon: '⭐', price: 10000 },
  { id: '4', name: 'Diamond', icon: '💎', price: 50000 },
  { id: '5', name: 'Crown', icon: '👑', price: 100000 },
  { id: '6', name: 'Rocket', icon: '🚀', price: 500000 },
];

// Mock Live Streams Data
export const MOCK_LIVE_STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'Tennis ATP Challenger',
    description: 'Live tennis match',
    thumbnailUrl: '/streams/tennis.jpg',
    streamUrl: 'https://example.com/stream1',
    category: 'sports',
    isLive: true,
    viewerCount: 1234,
    participants: 'Kasnikowski, Maks - Engel, Justin',
    score: '3-2, 6-4',
    eventInfo: 'ATP Challenger'
  },
  {
    id: '2',
    title: 'Liga 1 Indonesia',
    description: 'Persib vs Persija',
    thumbnailUrl: '/streams/football.jpg',
    streamUrl: 'https://example.com/stream2',
    category: 'sports',
    isLive: true,
    viewerCount: 5678,
    participants: 'Persib Bandung - Persija Jakarta',
    score: '1-0',
    eventInfo: 'Liga 1 2026'
  },
  {
    id: '3',
    title: 'Badminton World Tour',
    description: 'Indonesia Open',
    thumbnailUrl: '/streams/badminton.jpg',
    streamUrl: 'https://example.com/stream3',
    category: 'sports',
    isLive: true,
    viewerCount: 3456,
    participants: 'Ginting - Axelsen',
    score: '21-18, 19-21',
    eventInfo: 'Indonesia Open 2026'
  },
  {
    id: '4',
    title: 'Mobile Legends MPL',
    description: 'ONIC vs RRQ',
    thumbnailUrl: '/streams/esports.jpg',
    streamUrl: 'https://example.com/stream4',
    category: 'esports',
    isLive: true,
    viewerCount: 8901,
    participants: 'ONIC Esports - RRQ Hoshi',
    score: '2-1',
    eventInfo: 'MPL ID S15'
  },
  {
    id: '5',
    title: 'Casino Live - Blackjack',
    description: 'Live dealer blackjack',
    thumbnailUrl: '/streams/casino.jpg',
    streamUrl: 'https://example.com/stream5',
    category: 'casino',
    isLive: true,
    viewerCount: 456
  }
];

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
