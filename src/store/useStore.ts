import { create } from 'zustand';
import { User, Bet, Market } from '@/types';
import { markets as initialMarkets } from '@/data/markets';
import { generateId } from '@/lib/utils';

interface AppState {
  // User state
  user: User | null;
  isLoggedIn: boolean;

  // Markets state
  markets: Market[];

  // Bets state
  userBets: Bet[];

  // Actions
  login: (username: string) => void;
  logout: () => void;
  placeBet: (marketId: string, outcomeId: string, amount: number) => boolean;
  updateMarketProbability: (marketId: string, outcomeId: string, betAmount: number) => void;
  addBalance: (amount: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: {
    id: 'demo-user',
    username: 'DemoUser',
    balance: 10000000, // 10 juta rupiah starting balance
    totalBets: 0,
    totalWins: 0,
    totalProfit: 0,
  },
  isLoggedIn: true,
  markets: initialMarkets,
  userBets: [],

  // Actions
  login: (username: string) => {
    set({
      user: {
        id: generateId(),
        username,
        balance: 10000000,
        totalBets: 0,
        totalWins: 0,
        totalProfit: 0,
      },
      isLoggedIn: true,
    });
  },

  logout: () => {
    set({
      user: null,
      isLoggedIn: false,
      userBets: [],
    });
  },

  placeBet: (marketId: string, outcomeId: string, amount: number) => {
    const { user, markets, userBets } = get();

    if (!user || user.balance < amount) {
      return false;
    }

    const market = markets.find(m => m.id === marketId);
    if (!market) return false;

    const outcome = market.outcomes.find(o => o.id === outcomeId);
    if (!outcome) return false;

    // Calculate potential payout
    const potentialPayout = Math.round(amount / (outcome.probability / 100));

    // Create new bet
    const newBet: Bet = {
      id: generateId(),
      marketId,
      outcomeId,
      userId: user.id,
      amount,
      probability: outcome.probability,
      timestamp: new Date().toISOString(),
      potentialPayout,
    };

    // Update user balance
    const updatedUser = {
      ...user,
      balance: user.balance - amount,
      totalBets: user.totalBets + 1,
    };

    // Update market stats
    get().updateMarketProbability(marketId, outcomeId, amount);

    set({
      user: updatedUser,
      userBets: [...userBets, newBet],
    });

    return true;
  },

  updateMarketProbability: (marketId: string, outcomeId: string, betAmount: number) => {
    const { markets } = get();

    const updatedMarkets = markets.map(market => {
      if (market.id !== marketId) return market;

      const totalNewVolume = market.totalVolume + betAmount;

      // Update outcomes with new probability based on volume
      const updatedOutcomes = market.outcomes.map(outcome => {
        if (outcome.id === outcomeId) {
          const newVolume = outcome.volume + betAmount;
          const newTotalBets = outcome.totalBets + 1;
          // Simple probability adjustment based on volume
          const volumeRatio = newVolume / totalNewVolume;
          const currentProbSum = market.outcomes.reduce((sum, o) => sum + o.probability, 0);
          const adjustmentFactor = 0.1; // Small adjustment per bet
          const newProbability = Math.min(95, Math.max(5,
            outcome.probability + (adjustmentFactor * (volumeRatio * 100 - outcome.probability))
          ));

          return {
            ...outcome,
            volume: newVolume,
            totalBets: newTotalBets,
            probability: Math.round(newProbability),
          };
        }
        return outcome;
      });

      // Normalize probabilities to sum to 100
      const probSum = updatedOutcomes.reduce((sum, o) => sum + o.probability, 0);
      const normalizedOutcomes = updatedOutcomes.map(o => ({
        ...o,
        probability: Math.round((o.probability / probSum) * 100),
      }));

      return {
        ...market,
        totalVolume: totalNewVolume,
        totalBets: market.totalBets + 1,
        outcomes: normalizedOutcomes,
      };
    });

    set({ markets: updatedMarkets });
  },

  addBalance: (amount: number) => {
    const { user } = get();
    if (!user) return;

    set({
      user: {
        ...user,
        balance: user.balance + amount,
      },
    });
  },
}));
