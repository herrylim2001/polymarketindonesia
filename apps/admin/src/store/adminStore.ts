import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Market, Outcome, Bet, CATEGORIES } from '@/types';
import { markets as initialMarkets } from '@/data/markets';
import { generateId } from '@/lib/utils';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'viewer';
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'bet' | 'deposit' | 'withdrawal' | 'payout';
  userId: string;
  username: string;
  marketId?: string;
  marketTitle?: string;
  outcomeId?: string;
  outcomeLabel?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: string;
}

export interface MarketResolution {
  marketId: string;
  winningOutcomeId: string;
  resolvedAt: string;
  resolvedBy: string;
  totalPayout: number;
  winnersCount: number;
}

interface AdminState {
  // Data
  markets: Market[];
  transactions: Transaction[];
  resolutions: MarketResolution[];
  adminUsers: AdminUser[];

  // Stats
  totalVolume: number;
  totalBets: number;
  totalUsers: number;
  activeMarkets: number;

  // Actions - Markets
  addMarket: (market: Omit<Market, 'id' | 'createdAt' | 'totalVolume' | 'totalBets'>) => Market;
  updateMarket: (id: string, updates: Partial<Market>) => void;
  deleteMarket: (id: string) => void;
  resolveMarket: (marketId: string, winningOutcomeId: string, resolvedBy: string) => void;

  // Actions - Outcomes
  addOutcome: (marketId: string, outcome: Omit<Outcome, 'id' | 'totalBets' | 'volume'>) => void;
  updateOutcome: (marketId: string, outcomeId: string, updates: Partial<Outcome>) => void;
  deleteOutcome: (marketId: string, outcomeId: string) => void;

  // Actions - Transactions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;

  // Actions - Utility
  recalculateStats: () => void;
  getMarketById: (id: string) => Market | undefined;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial data
      markets: initialMarkets,
      transactions: generateSampleTransactions(),
      resolutions: [],
      adminUsers: [
        {
          id: 'admin-1',
          username: 'Admin',
          email: 'admin@polyid.com',
          role: 'admin',
          createdAt: '2026-01-01',
        },
      ],

      // Initial stats
      totalVolume: initialMarkets.reduce((sum, m) => sum + m.totalVolume, 0),
      totalBets: initialMarkets.reduce((sum, m) => sum + m.totalBets, 0),
      totalUsers: 1250,
      activeMarkets: initialMarkets.filter(m => m.status === 'active').length,

      // Market Actions
      addMarket: (marketData) => {
        const newMarket: Market = {
          ...marketData,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
          totalVolume: 0,
          totalBets: 0,
          outcomes: marketData.outcomes.map(o => ({
            ...o,
            id: generateId(),
            totalBets: 0,
            volume: 0,
          })),
        };

        set((state) => ({
          markets: [...state.markets, newMarket],
          activeMarkets: state.activeMarkets + (newMarket.status === 'active' ? 1 : 0),
        }));

        return newMarket;
      },

      updateMarket: (id, updates) => {
        set((state) => ({
          markets: state.markets.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
        get().recalculateStats();
      },

      deleteMarket: (id) => {
        set((state) => ({
          markets: state.markets.filter((m) => m.id !== id),
        }));
        get().recalculateStats();
      },

      resolveMarket: (marketId, winningOutcomeId, resolvedBy) => {
        const market = get().markets.find(m => m.id === marketId);
        if (!market) return;

        const winningOutcome = market.outcomes.find(o => o.id === winningOutcomeId);
        if (!winningOutcome) return;

        // Calculate payouts
        const totalPayout = winningOutcome.volume * (100 / winningOutcome.probability);
        const winnersCount = winningOutcome.totalBets;

        const resolution: MarketResolution = {
          marketId,
          winningOutcomeId,
          resolvedAt: new Date().toISOString(),
          resolvedBy,
          totalPayout,
          winnersCount,
        };

        set((state) => ({
          markets: state.markets.map((m) =>
            m.id === marketId
              ? {
                  ...m,
                  status: 'resolved' as const,
                  outcomes: m.outcomes.map((o) => ({
                    ...o,
                    probability: o.id === winningOutcomeId ? 100 : 0,
                  })),
                }
              : m
          ),
          resolutions: [...state.resolutions, resolution],
        }));

        get().recalculateStats();
      },

      // Outcome Actions
      addOutcome: (marketId, outcomeData) => {
        const newOutcome: Outcome = {
          ...outcomeData,
          id: generateId(),
          totalBets: 0,
          volume: 0,
        };

        set((state) => ({
          markets: state.markets.map((m) =>
            m.id === marketId
              ? { ...m, outcomes: [...m.outcomes, newOutcome] }
              : m
          ),
        }));
      },

      updateOutcome: (marketId, outcomeId, updates) => {
        set((state) => ({
          markets: state.markets.map((m) =>
            m.id === marketId
              ? {
                  ...m,
                  outcomes: m.outcomes.map((o) =>
                    o.id === outcomeId ? { ...o, ...updates } : o
                  ),
                }
              : m
          ),
        }));
      },

      deleteOutcome: (marketId, outcomeId) => {
        set((state) => ({
          markets: state.markets.map((m) =>
            m.id === marketId
              ? {
                  ...m,
                  outcomes: m.outcomes.filter((o) => o.id !== outcomeId),
                }
              : m
          ),
        }));
      },

      // Transaction Actions
      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      // Utility Actions
      recalculateStats: () => {
        const { markets } = get();
        set({
          totalVolume: markets.reduce((sum, m) => sum + m.totalVolume, 0),
          totalBets: markets.reduce((sum, m) => sum + m.totalBets, 0),
          activeMarkets: markets.filter((m) => m.status === 'active').length,
        });
      },

      getMarketById: (id) => {
        return get().markets.find((m) => m.id === id);
      },
    }),
    {
      name: 'polyid-admin-storage',
      partialize: (state) => ({
        markets: state.markets,
        transactions: state.transactions,
        resolutions: state.resolutions,
      }),
    }
  )
);

// Helper function to generate sample transactions
function generateSampleTransactions(): Transaction[] {
  const usernames = ['Budi', 'Siti', 'Ahmad', 'Dewi', 'Rudi', 'Maya', 'Andi', 'Fitri'];
  const transactions: Transaction[] = [];

  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.7 ? 'deposit' : 'bet';
    const username = usernames[Math.floor(Math.random() * usernames.length)];

    transactions.push({
      id: generateId(),
      type,
      userId: `user-${i}`,
      username,
      marketId: type === 'bet' ? `market-${Math.floor(Math.random() * 10)}` : undefined,
      marketTitle: type === 'bet' ? 'Sample Market' : undefined,
      amount: Math.floor(Math.random() * 5000000) + 100000,
      status: 'completed',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return transactions.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
