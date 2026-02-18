// Database types for API routes
// These types mirror the Prisma schema

export interface Outcome {
  id: string;
  marketId: string;
  label: string;
  probability: number;
  totalBets: number;
  volume: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  source: string | null;
  startDate: Date;
  endDate: Date;
  resolvedAt: Date | null;
  totalVolume: number;
  totalBets: number;
  liquidity: number;
  status: string;
  featured: boolean;
  trending: boolean;
  resolvedOutcomeId: string | null;
  resolutionNotes: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  outcomes: Outcome[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string | null;
  avatar: string | null;
  phone: string | null;
  balance: number;
  totalBets: number;
  totalWins: number;
  totalProfit: number;
  kycStatus: string;
  kycLevel: number;
  referralCode: string | null;
  referredById: string | null;
  referralEarnings: number;
  isActive: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  banReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface Bet {
  id: string;
  userId: string;
  marketId: string;
  outcomeId: string;
  amount: number;
  shares: number;
  probability: number;
  avgPrice: number;
  potentialPayout: number;
  actualPayout: number | null;
  profit: number | null;
  status: string;
  createdAt: Date;
  settledAt: Date | null;
  user?: User;
}
