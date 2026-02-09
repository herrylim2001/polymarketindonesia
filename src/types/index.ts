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
  type: 'bet_placed' | 'market_resolved' | 'payout' | 'deposit' | 'withdrawal' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export type PaymentMethod =
  | 'bank_transfer'
  | 'virtual_account'
  | 'ewallet'
  | 'qris';

export type BankCode =
  | 'bca' | 'bni' | 'bri' | 'mandiri'
  | 'cimb' | 'permata' | 'bsi' | 'danamon';

export type EwalletCode =
  | 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'linkaja';

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  fee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  bankCode?: BankCode;
  ewalletCode?: EwalletCode;
  virtualAccountNumber?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paidAt?: string;
  reference?: string;
}

export interface BankInfo {
  code: BankCode;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  adminFee: number;
}

export interface EwalletInfo {
  code: EwalletCode;
  name: string;
  logo: string;
  color: string;
  adminFee: number;
  minAmount: number;
  maxAmount: number;
}

export const BANKS: BankInfo[] = [
  { code: 'bca', name: 'Bank Central Asia', shortName: 'BCA', logo: '/banks/bca.png', color: 'bg-blue-600', adminFee: 0 },
  { code: 'bni', name: 'Bank Negara Indonesia', shortName: 'BNI', logo: '/banks/bni.png', color: 'bg-orange-500', adminFee: 0 },
  { code: 'bri', name: 'Bank Rakyat Indonesia', shortName: 'BRI', logo: '/banks/bri.png', color: 'bg-blue-800', adminFee: 0 },
  { code: 'mandiri', name: 'Bank Mandiri', shortName: 'Mandiri', logo: '/banks/mandiri.png', color: 'bg-blue-900', adminFee: 0 },
  { code: 'cimb', name: 'CIMB Niaga', shortName: 'CIMB', logo: '/banks/cimb.png', color: 'bg-red-600', adminFee: 0 },
  { code: 'permata', name: 'Bank Permata', shortName: 'Permata', logo: '/banks/permata.png', color: 'bg-green-600', adminFee: 0 },
  { code: 'bsi', name: 'Bank Syariah Indonesia', shortName: 'BSI', logo: '/banks/bsi.png', color: 'bg-teal-600', adminFee: 0 },
  { code: 'danamon', name: 'Bank Danamon', shortName: 'Danamon', logo: '/banks/danamon.png', color: 'bg-yellow-500', adminFee: 0 },
];

export const EWALLETS: EwalletInfo[] = [
  { code: 'dana', name: 'DANA', logo: '/ewallets/dana.png', color: 'bg-blue-500', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
  { code: 'ovo', name: 'OVO', logo: '/ewallets/ovo.png', color: 'bg-purple-600', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
  { code: 'gopay', name: 'GoPay', logo: '/ewallets/gopay.png', color: 'bg-green-500', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
  { code: 'shopeepay', name: 'ShopeePay', logo: '/ewallets/shopeepay.png', color: 'bg-orange-500', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
  { code: 'linkaja', name: 'LinkAja', logo: '/ewallets/linkaja.png', color: 'bg-red-500', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
];

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
