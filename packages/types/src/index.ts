// Market types
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

// Payment types
export type PaymentMethod =
  | 'bank_transfer'
  | 'virtual_account'
  | 'ewallet'
  | 'qris'
  | 'crypto';

export type BankCode =
  | 'bca' | 'bni' | 'bri' | 'mandiri'
  | 'cimb' | 'permata' | 'bsi' | 'danamon';

export type EwalletCode =
  | 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'linkaja';

export type CryptoCode =
  | 'btc' | 'btc_lightning' | 'eth' | 'usdt_trc20' | 'usdt_erc20'
  | 'usdt_ton' | 'usdc' | 'matic' | 'ton' | 'xrp' | 'arb' | 'base';

export type CryptoNetwork =
  | 'bitcoin' | 'lightning' | 'ethereum' | 'tron' | 'ton'
  | 'polygon' | 'arbitrum' | 'base' | 'ripple';

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
  cryptoCode?: CryptoCode;
  cryptoNetwork?: CryptoNetwork;
  cryptoAddress?: string;
  cryptoAmount?: number;
  cryptoTxHash?: string;
  virtualAccountNumber?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paidAt?: string;
  reference?: string;
  uniwireInvoiceId?: string;
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

export interface CryptoInfo {
  code: CryptoCode;
  name: string;
  symbol: string;
  network: CryptoNetwork;
  networkName: string;
  color: string;
  icon: string;
  minAmount: number; // in USD
  confirmations: number;
  isLightning?: boolean;
}

// Uniwire API Configuration
export interface UniwireConfig {
  apiKey: string;
  apiSecret: string;
  profileId: string;
  callbackToken: string;
  callbackUrl: string;
  isTestMode: boolean;
}

export interface UniwireInvoice {
  id: string;
  address: string;
  amount: number;
  amountCrypto: number;
  currency: string;
  cryptoKind: string;
  status: 'pending' | 'underpaid' | 'paid' | 'overpaid' | 'expired';
  expiresAt: string;
  createdAt: string;
  qrCodeUrl?: string;
  lightningInvoice?: string;
}

// Category types
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

// Constants
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

export const CRYPTOCURRENCIES: CryptoInfo[] = [
  // Bitcoin
  { code: 'btc', name: 'Bitcoin', symbol: 'BTC', network: 'bitcoin', networkName: 'Bitcoin', color: 'bg-orange-500', icon: '₿', minAmount: 10, confirmations: 1 },
  { code: 'btc_lightning', name: 'Bitcoin Lightning', symbol: 'BTC', network: 'lightning', networkName: 'Lightning Network', color: 'bg-yellow-500', icon: '⚡', minAmount: 1, confirmations: 0, isLightning: true },

  // Ethereum
  { code: 'eth', name: 'Ethereum', symbol: 'ETH', network: 'ethereum', networkName: 'Ethereum', color: 'bg-indigo-500', icon: 'Ξ', minAmount: 10, confirmations: 12 },

  // Stablecoins - USDT
  { code: 'usdt_trc20', name: 'USDT', symbol: 'USDT', network: 'tron', networkName: 'Tron (TRC20)', color: 'bg-green-500', icon: '₮', minAmount: 10, confirmations: 20 },
  { code: 'usdt_erc20', name: 'USDT', symbol: 'USDT', network: 'ethereum', networkName: 'Ethereum (ERC20)', color: 'bg-green-600', icon: '₮', minAmount: 10, confirmations: 12 },
  { code: 'usdt_ton', name: 'USDT', symbol: 'USDT', network: 'ton', networkName: 'TON', color: 'bg-blue-500', icon: '₮', minAmount: 5, confirmations: 1 },

  // USDC
  { code: 'usdc', name: 'USD Coin', symbol: 'USDC', network: 'ethereum', networkName: 'Ethereum', color: 'bg-blue-600', icon: '$', minAmount: 10, confirmations: 12 },

  // Layer 2 & Other Networks
  { code: 'matic', name: 'Polygon', symbol: 'MATIC', network: 'polygon', networkName: 'Polygon', color: 'bg-purple-500', icon: '⬡', minAmount: 5, confirmations: 128 },
  { code: 'ton', name: 'Toncoin', symbol: 'TON', network: 'ton', networkName: 'TON', color: 'bg-sky-500', icon: '💎', minAmount: 5, confirmations: 1 },
  { code: 'xrp', name: 'Ripple', symbol: 'XRP', network: 'ripple', networkName: 'XRP Ledger', color: 'bg-gray-600', icon: '✕', minAmount: 10, confirmations: 1 },
  { code: 'arb', name: 'Arbitrum', symbol: 'ARB', network: 'arbitrum', networkName: 'Arbitrum One', color: 'bg-blue-400', icon: '◆', minAmount: 5, confirmations: 1 },
  { code: 'base', name: 'Base', symbol: 'ETH', network: 'base', networkName: 'Base', color: 'bg-blue-700', icon: '🔵', minAmount: 5, confirmations: 1 },
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
