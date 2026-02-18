import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

interface OutcomeType {
  id: string;
  label: string;
}

interface BetType {
  id: string;
  userId: string;
  outcomeId: string;
  amount: number;
  potentialPayout: number;
}

// POST /api/markets/[id]/resolve - Resolve a market
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { outcomeId, resolutionNotes, adminId } = body;

    if (!outcomeId) {
      return NextResponse.json(
        { success: false, error: 'Outcome ID wajib diisi' },
        { status: 400 }
      );
    }

    // Get market with outcomes and bets
    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        outcomes: true,
        bets: {
          where: { status: 'ACTIVE' },
          include: { user: true },
        },
      },
    });

    if (!market) {
      return NextResponse.json(
        { success: false, error: 'Market tidak ditemukan' },
        { status: 404 }
      );
    }

    if (market.status === 'RESOLVED') {
      return NextResponse.json(
        { success: false, error: 'Market sudah di-resolve' },
        { status: 400 }
      );
    }

    // Find winning outcome
    const winningOutcome = (market.outcomes as OutcomeType[]).find((o: OutcomeType) => o.id === outcomeId);
    if (!winningOutcome) {
      return NextResponse.json(
        { success: false, error: 'Outcome tidak valid' },
        { status: 400 }
      );
    }

    // Process all bets
    const winningBets = (market.bets as BetType[]).filter((bet: BetType) => bet.outcomeId === outcomeId);
    const losingBets = (market.bets as BetType[]).filter((bet: BetType) => bet.outcomeId !== outcomeId);

    // Use transaction for atomicity
    await prisma.$transaction(async (tx: typeof prisma) => {
      // Update winning bets
      for (const bet of winningBets) {
        const payout = Number(bet.potentialPayout);
        const profit = payout - Number(bet.amount);

        // Update bet status
        await tx.bet.update({
          where: { id: bet.id },
          data: {
            status: 'WON',
            actualPayout: payout,
            profit: profit,
            settledAt: new Date(),
          },
        });

        // Add payout to user balance
        await tx.user.update({
          where: { id: bet.userId },
          data: {
            balance: { increment: payout },
            totalWins: { increment: 1 },
            totalProfit: { increment: profit },
          },
        });

        // Create payout transaction
        await tx.transaction.create({
          data: {
            userId: bet.userId,
            type: 'BET_WON',
            amount: payout,
            totalAmount: payout,
            paymentMethod: 'BANK_TRANSFER', // Internal
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: bet.userId,
            type: 'BET_WON',
            title: 'Selamat! Bet Anda Menang',
            message: `Anda memenangkan Rp ${payout.toLocaleString('id-ID')} dari market "${market.title}"`,
            link: `/market/${market.id}`,
          },
        });
      }

      // Update losing bets
      for (const bet of losingBets) {
        await tx.bet.update({
          where: { id: bet.id },
          data: {
            status: 'LOST',
            actualPayout: 0,
            profit: -Number(bet.amount),
            settledAt: new Date(),
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: bet.userId,
            type: 'BET_LOST',
            title: 'Bet Anda Kalah',
            message: `Prediksi Anda pada market "${market.title}" tidak tepat`,
            link: `/market/${market.id}`,
          },
        });
      }

      // Update market status
      await tx.market.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedOutcomeId: outcomeId,
          resolvedAt: new Date(),
          resolutionNotes,
        },
      });

      // Log admin action
      if (adminId) {
        await tx.adminLog.create({
          data: {
            adminId,
            action: 'RESOLVE_MARKET',
            target: `market:${id}`,
            details: {
              outcomeId,
              winningBetsCount: winningBets.length,
              losingBetsCount: losingBets.length,
              totalPayout: winningBets.reduce((sum: number, b: BetType) => sum + Number(b.potentialPayout), 0),
              resolutionNotes,
            },
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Market berhasil di-resolve',
      data: {
        winningOutcome: winningOutcome.label,
        winningBetsCount: winningBets.length,
        losingBetsCount: losingBets.length,
        totalPayout: winningBets.reduce((sum: number, b: BetType) => sum + Number(b.potentialPayout), 0),
      },
    });
  } catch (error) {
    console.error('Error resolving market:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal me-resolve market' },
      { status: 500 }
    );
  }
}
