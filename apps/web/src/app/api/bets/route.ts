import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface OutcomeType {
  id: string;
  label: string;
  probability: number;
  volume: number;
}

// GET /api/bets - Get user's bets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const marketId = searchParams.get('marketId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID wajib diisi' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;
    if (marketId) where.marketId = marketId;

    const total = await prisma.bet.count({ where });

    const bets = await prisma.bet.findMany({
      where,
      include: {
        market: {
          select: {
            id: true,
            title: true,
            status: true,
            endDate: true,
            imageUrl: true,
          },
        },
        outcome: {
          select: {
            id: true,
            label: true,
            probability: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: bets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data bets' },
      { status: 500 }
    );
  }
}

// POST /api/bets - Place a new bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, marketId, outcomeId, amount } = body;

    // Validation
    if (!userId || !marketId || !outcomeId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap atau tidak valid' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check balance
    if (Number(user.balance) < amount) {
      return NextResponse.json(
        { success: false, error: 'Saldo tidak mencukupi' },
        { status: 400 }
      );
    }

    // Get market and outcome
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      include: { outcomes: true },
    });

    if (!market) {
      return NextResponse.json(
        { success: false, error: 'Market tidak ditemukan' },
        { status: 404 }
      );
    }

    if (market.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Market tidak aktif' },
        { status: 400 }
      );
    }

    if (new Date(market.endDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Market sudah berakhir' },
        { status: 400 }
      );
    }

    const outcome = (market.outcomes as OutcomeType[]).find((o: OutcomeType) => o.id === outcomeId);
    if (!outcome) {
      return NextResponse.json(
        { success: false, error: 'Outcome tidak valid' },
        { status: 400 }
      );
    }

    // Calculate shares using CPMM (Constant Product Market Maker)
    const probability = Number(outcome.probability) / 100;
    const avgPrice = probability;
    const shares = amount / avgPrice;
    const potentialPayout = shares;

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Deduct user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: amount },
          totalBets: { increment: 1 },
        },
      });

      // Create bet
      const bet = await tx.bet.create({
        data: {
          userId,
          marketId,
          outcomeId,
          amount,
          shares,
          probability: outcome.probability,
          avgPrice,
          potentialPayout,
          status: 'ACTIVE',
        },
        include: {
          market: { select: { title: true } },
          outcome: { select: { label: true } },
        },
      });

      // Update market stats
      await tx.market.update({
        where: { id: marketId },
        data: {
          totalVolume: { increment: amount },
          totalBets: { increment: 1 },
        },
      });

      // Update outcome stats
      await tx.outcome.update({
        where: { id: outcomeId },
        data: {
          volume: { increment: amount },
          totalBets: { increment: 1 },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'BET_PLACED',
          amount,
          totalAmount: amount,
          paymentMethod: 'BANK_TRANSFER', // Internal
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: 'BET_PLACED',
          title: 'Bet Berhasil Dipasang',
          message: `Anda memasang Rp ${amount.toLocaleString('id-ID')} pada "${outcome.label}" di market "${market.title}"`,
          link: `/market/${marketId}`,
        },
      });

      // Record price history
      for (const o of market.outcomes as OutcomeType[]) {
        await tx.priceHistory.create({
          data: {
            marketId,
            outcomeId: o.id,
            probability: o.probability,
            volume: o.volume,
          },
        });
      }

      return bet;
    });

    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error('Error placing bet:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memasang bet' },
      { status: 500 }
    );
  }
}
