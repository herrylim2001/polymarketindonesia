import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Bet, Market, Notification, Transaction, PaymentMethod, BankCode, EwalletCode, CryptoCode } from '@/types';
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

  // Notifications
  notifications: Notification[];

  // Transactions
  transactions: Transaction[];

  // Actions - Auth
  register: (username: string, email: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Actions - Betting
  placeBet: (marketId: string, outcomeId: string, amount: number) => boolean;
  updateMarketProbability: (marketId: string, outcomeId: string, betAmount: number) => void;

  // Actions - Wallet
  addBalance: (amount: number) => void;
  withdraw: (amount: number) => boolean;

  // Actions - Transactions
  createDeposit: (amount: number, paymentMethod: PaymentMethod, bankCode?: BankCode, ewalletCode?: EwalletCode, cryptoCode?: CryptoCode) => Transaction;
  confirmDeposit: (transactionId: string) => boolean;
  getTransactionById: (transactionId: string) => Transaction | undefined;

  // Actions - Bookmarks
  toggleBookmark: (marketId: string) => void;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Actions - Search
  searchMarkets: (query: string) => Market[];
}

// Registered users storage (simulated)
const registeredUsers: Array<{ username: string; email: string; password: string; id: string }> = [
  { id: 'demo-user', username: 'DemoUser', email: 'demo@polyid.com', password: 'demo123' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoggedIn: false,
      markets: initialMarkets,
      userBets: [],
      transactions: [],
      notifications: [
        {
          id: 'welcome',
          type: 'system',
          title: 'Selamat datang di PolyID!',
          message: 'Mulai prediksi berbagai event Indonesia dan dapatkan profit dari pengetahuan Anda.',
          read: false,
          timestamp: new Date().toISOString(),
        },
      ],

      // Auth Actions
      register: (username: string, email: string, password: string) => {
        const existing = registeredUsers.find(u => u.email === email);
        if (existing) return false;

        const newUser = {
          id: generateId(),
          username,
          email,
          password,
        };
        registeredUsers.push(newUser);

        set({
          user: {
            id: newUser.id,
            username,
            email,
            balance: 10000000,
            totalBets: 0,
            totalWins: 0,
            totalProfit: 0,
            joinedAt: new Date().toISOString(),
            bookmarks: [],
          },
          isLoggedIn: true,
          notifications: [
            {
              id: generateId(),
              type: 'system',
              title: 'Selamat datang di PolyID!',
              message: `Halo ${username}! Akun Anda berhasil dibuat. Anda mendapat saldo awal Rp 10.000.000 untuk mulai prediksi.`,
              read: false,
              timestamp: new Date().toISOString(),
            },
            {
              id: generateId(),
              type: 'deposit',
              title: 'Bonus Pendaftaran',
              message: 'Anda menerima Rp 10.000.000 sebagai bonus pendaftaran.',
              read: false,
              timestamp: new Date().toISOString(),
            },
          ],
        });

        return true;
      },

      login: (email: string, password: string) => {
        const found = registeredUsers.find(u => u.email === email && u.password === password);
        if (!found) return false;

        // Restore existing user or create fresh state
        const { user: currentUser } = get();
        if (currentUser && currentUser.id === found.id) {
          set({ isLoggedIn: true });
        } else {
          set({
            user: {
              id: found.id,
              username: found.username,
              email: found.email,
              balance: 10000000,
              totalBets: 0,
              totalWins: 0,
              totalProfit: 0,
              joinedAt: new Date().toISOString(),
              bookmarks: [],
            },
            isLoggedIn: true,
          });
        }

        return true;
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
        });
      },

      // Betting
      placeBet: (marketId: string, outcomeId: string, amount: number) => {
        const { user, markets, userBets } = get();

        if (!user || user.balance < amount) return false;

        const market = markets.find(m => m.id === marketId);
        if (!market) return false;

        const outcome = market.outcomes.find(o => o.id === outcomeId);
        if (!outcome) return false;

        const potentialPayout = Math.round(amount / (outcome.probability / 100));

        const newBet: Bet = {
          id: generateId(),
          marketId,
          outcomeId,
          outcomeLabel: outcome.label,
          marketTitle: market.title,
          userId: user.id,
          amount,
          probability: outcome.probability,
          timestamp: new Date().toISOString(),
          potentialPayout,
          status: 'active',
        };

        const updatedUser = {
          ...user,
          balance: user.balance - amount,
          totalBets: user.totalBets + 1,
        };

        get().updateMarketProbability(marketId, outcomeId, amount);

        const notification: Notification = {
          id: generateId(),
          type: 'bet_placed',
          title: 'Taruhan Berhasil',
          message: `Anda memasang Rp ${amount.toLocaleString('id-ID')} pada "${outcome.label}" di market "${market.title}"`,
          read: false,
          timestamp: new Date().toISOString(),
          link: `/market/${marketId}`,
        };

        set({
          user: updatedUser,
          userBets: [newBet, ...userBets],
          notifications: [notification, ...get().notifications],
        });

        return true;
      },

      updateMarketProbability: (marketId: string, outcomeId: string, betAmount: number) => {
        const { markets } = get();

        const updatedMarkets = markets.map(market => {
          if (market.id !== marketId) return market;

          const totalNewVolume = market.totalVolume + betAmount;

          const updatedOutcomes = market.outcomes.map(outcome => {
            if (outcome.id === outcomeId) {
              const newVolume = outcome.volume + betAmount;
              const newTotalBets = outcome.totalBets + 1;
              const volumeRatio = newVolume / totalNewVolume;
              const adjustmentFactor = 0.1;
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

      // Wallet
      addBalance: (amount: number) => {
        const { user, notifications } = get();
        if (!user) return;

        const notification: Notification = {
          id: generateId(),
          type: 'deposit',
          title: 'Deposit Berhasil',
          message: `Rp ${amount.toLocaleString('id-ID')} telah ditambahkan ke saldo Anda.`,
          read: false,
          timestamp: new Date().toISOString(),
        };

        set({
          user: { ...user, balance: user.balance + amount },
          notifications: [notification, ...notifications],
        });
      },

      withdraw: (amount: number) => {
        const { user } = get();
        if (!user || user.balance < amount) return false;

        set({
          user: { ...user, balance: user.balance - amount },
        });
        return true;
      },

      // Transactions
      createDeposit: (amount: number, paymentMethod: PaymentMethod, bankCode?: BankCode, ewalletCode?: EwalletCode, cryptoCode?: CryptoCode) => {
        const { user, transactions } = get();
        const now = new Date();
        // Crypto has shorter expiry (30 min), others 24 hours
        const expiryMs = paymentMethod === 'crypto' ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const expiresAt = new Date(now.getTime() + expiryMs);

        // Generate Virtual Account number for bank transfers
        const bankPrefix: Record<string, string> = {
          bca: '123',
          bni: '880',
          bri: '269',
          mandiri: '889',
          cimb: '022',
          permata: '013',
          bsi: '451',
          danamon: '011',
        };

        const prefix = bankCode ? bankPrefix[bankCode] || '999' : '999';
        const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
        const vaNumber = bankCode ? prefix + randomDigits : undefined;

        const transaction: Transaction = {
          id: generateId(),
          userId: user?.id || '',
          type: 'deposit',
          amount,
          fee: 0,
          totalAmount: amount,
          paymentMethod,
          bankCode,
          ewalletCode,
          cryptoCode,
          virtualAccountNumber: vaNumber,
          status: 'pending',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          reference: paymentMethod === 'crypto' ? `CRYPTO${Date.now()}` : `DEP${Date.now()}`,
        };

        set({ transactions: [transaction, ...transactions] });
        return transaction;
      },

      confirmDeposit: (transactionId: string) => {
        const { transactions, user, notifications } = get();
        const transaction = transactions.find(t => t.id === transactionId);

        if (!transaction || transaction.status !== 'pending' || !user) return false;

        const updatedTransactions = transactions.map(t =>
          t.id === transactionId
            ? { ...t, status: 'completed' as const, paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : t
        );

        const notification: Notification = {
          id: generateId(),
          type: 'deposit',
          title: 'Deposit Berhasil',
          message: `Deposit Rp ${transaction.amount.toLocaleString('id-ID')} telah dikonfirmasi dan ditambahkan ke saldo Anda.`,
          read: false,
          timestamp: new Date().toISOString(),
          link: '/portfolio',
        };

        set({
          transactions: updatedTransactions,
          user: { ...user, balance: user.balance + transaction.amount },
          notifications: [notification, ...notifications],
        });

        return true;
      },

      getTransactionById: (transactionId: string) => {
        const { transactions } = get();
        return transactions.find(t => t.id === transactionId);
      },

      // Bookmarks
      toggleBookmark: (marketId: string) => {
        const { user } = get();
        if (!user) return;

        const bookmarks = user.bookmarks.includes(marketId)
          ? user.bookmarks.filter(id => id !== marketId)
          : [...user.bookmarks, marketId];

        set({
          user: { ...user, bookmarks },
        });
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Search
      searchMarkets: (query: string) => {
        const { markets } = get();
        const q = query.toLowerCase();
        return markets.filter(
          m =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q) ||
            m.outcomes.some(o => o.label.toLowerCase().includes(q))
        );
      },
    }),
    {
      name: 'polyid-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        userBets: state.userBets,
        notifications: state.notifications,
        transactions: state.transactions,
      }),
    }
  )
);
