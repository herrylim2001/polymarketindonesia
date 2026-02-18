// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClient = any;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createMockModel() {
  const mockFn = async () => null;
  return {
    findUnique: mockFn,
    findFirst: mockFn,
    findMany: async () => [],
    create: mockFn,
    update: mockFn,
    delete: mockFn,
    count: async () => 0,
    aggregate: async () => ({ _sum: {} }),
    groupBy: async () => [],
    updateMany: mockFn,
    deleteMany: mockFn,
  };
}

class MockPrismaClient {
  user = createMockModel();
  market = createMockModel();
  outcome = createMockModel();
  bet = createMockModel();
  transaction = createMockModel();
  notification = createMockModel();
  kycDocument = createMockModel();
  bookmark = createMockModel();
  comment = createMockModel();
  referral = createMockModel();
  adminLog = createMockModel();
  setting = createMockModel();
  session = createMockModel();
  priceHistory = createMockModel();
  $transaction = async <T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> => fn(this);
}

function createPrismaClient(): PrismaClient {
  // If already initialized, return cached instance
  if (globalThis.prisma) {
    return globalThis.prisma;
  }

  try {
    // Try to require and instantiate the real Prisma client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient: RealPrismaClient } = require('@prisma/client');
    return new RealPrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    // Fallback to mock client during build or when Prisma is not generated
    console.warn('Prisma client not initialized. Using mock client. Run `npx prisma generate` in packages/database');
    return new MockPrismaClient() as PrismaClient;
  }
}

export const prisma = createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
