import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/analytics - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get overall stats
    const [
      totalUsers,
      newUsers,
      totalMarkets,
      activeMarkets,
      totalBets,
      periodBets,
      totalVolume,
      periodVolume,
      totalDeposits,
      periodDeposits,
      totalWithdrawals,
      pendingWithdrawals,
      pendingKyc,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      // New users in period
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Total markets
      prisma.market.count(),
      // Active markets
      prisma.market.count({
        where: { status: 'ACTIVE' },
      }),
      // Total bets
      prisma.bet.count(),
      // Bets in period
      prisma.bet.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Total volume
      prisma.market.aggregate({
        _sum: { totalVolume: true },
      }),
      // Period volume
      prisma.bet.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { amount: true },
      }),
      // Total deposits completed
      prisma.transaction.aggregate({
        where: {
          type: 'DEPOSIT',
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      }),
      // Deposits in period
      prisma.transaction.aggregate({
        where: {
          type: 'DEPOSIT',
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { totalAmount: true },
      }),
      // Total withdrawals completed
      prisma.transaction.aggregate({
        where: {
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      }),
      // Pending withdrawals
      prisma.transaction.count({
        where: {
          type: 'WITHDRAWAL',
          status: 'PENDING',
        },
      }),
      // Pending KYC
      prisma.kycDocument.count({
        where: { status: 'PENDING' },
      }),
    ]);

    // Get top markets by volume
    const topMarkets = await prisma.market.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        category: true,
        totalVolume: true,
        totalBets: true,
        endDate: true,
      },
      orderBy: { totalVolume: 'desc' },
      take: 5,
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        type: { in: ['DEPOSIT', 'WITHDRAWAL'] },
      },
      include: {
        user: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get daily stats for chart
    const dailyStats = await getDailyStats(startDate);

    // Category distribution
    const categoryDistribution = await prisma.market.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { totalVolume: true },
      where: { status: 'ACTIVE' },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsers,
          totalMarkets,
          activeMarkets,
          totalBets,
          periodBets,
          totalVolume: Number(totalVolume._sum.totalVolume || 0),
          periodVolume: Number(periodVolume._sum.amount || 0),
          totalDeposits: Number(totalDeposits._sum.totalAmount || 0),
          periodDeposits: Number(periodDeposits._sum.totalAmount || 0),
          totalWithdrawals: Number(totalWithdrawals._sum.totalAmount || 0),
          pendingWithdrawals,
          pendingKyc,
        },
        topMarkets,
        recentTransactions,
        dailyStats,
        categoryDistribution: categoryDistribution.map((c: { category: string; _count: { id: number }; _sum: { totalVolume: number | null } }) => ({
          category: c.category,
          count: c._count.id,
          volume: Number(c._sum.totalVolume || 0),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data analytics' },
      { status: 500 }
    );
  }
}

async function getDailyStats(startDate: Date) {
  const days: { date: string; users: number; bets: number; volume: number }[] = [];
  const endDate = new Date();

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const [users, bets, volume] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      prisma.bet.count({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      prisma.bet.aggregate({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    days.push({
      date: dayStart.toISOString().split('T')[0],
      users,
      bets,
      volume: Number(volume._sum.amount || 0),
    });
  }

  return days;
}
