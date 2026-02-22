import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withAuth,
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  RATE_LIMITS,
} from '@/lib/api/middleware';
import { validateSchema, cashOutSchema } from '@/lib/api/validation';

interface OutcomeType {
  id: string;
  probability: number;
  volume: number;
}

/**
 * Calculate cash-out value for a bet
 * Uses current market probability to determine the value
 */
function calculateCashOutValue(
  shares: number,
  currentProbability: number,
  isYesBet: boolean
): {
  cashOutValue: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercent: number;
} {
  // Current price per share based on probability
  const currentPrice = isYesBet
    ? currentProbability / 100
    : (100 - currentProbability) / 100;

  // Cash out value = shares × current price
  // Apply a small spread (2%) as market maker fee
  const spread = 0.02;
  const adjustedPrice = currentPrice * (1 - spread);
  const cashOutValue = shares * adjustedPrice;

  return {
    cashOutValue: Math.round(cashOutValue),
    currentPrice: Math.round(currentPrice * 100) / 100,
    profitLoss: 0, // Will be calculated by the caller
    profitLossPercent: 0,
  };
}

// POST /api/bets/cashout - Get cash-out quote
export const POST = withAuth(async ({ user, request }) => {
  try {
    const body = await request.json();
    const { betId } = body;

    if (!betId) {
      return errorResponse('Bet ID wajib diisi', 400);
    }

    // Get bet with market and outcome
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        market: {
          include: {
            outcomes: true,
          },
        },
        outcome: true,
      },
    });

    if (!bet) {
      return notFoundResponse('Bet tidak ditemukan');
    }

    // Verify ownership
    if (bet.userId !== user!.id) {
      return errorResponse('Anda tidak memiliki akses ke bet ini', 403);
    }

    // Check if bet can be cashed out
    if (bet.status !== 'ACTIVE') {
      return errorResponse(`Bet tidak dapat di-cashout. Status: ${bet.status}`, 400);
    }

    if (bet.market.status !== 'ACTIVE') {
      return errorResponse('Market sudah tidak aktif', 400);
    }

    // Get current outcome probability
    const currentOutcome = (bet.market.outcomes as OutcomeType[]).find(
      (o: OutcomeType) => o.id === bet.outcomeId
    );

    if (!currentOutcome) {
      return errorResponse('Outcome tidak ditemukan', 500);
    }

    // Calculate cash-out value
    const cashOut = calculateCashOutValue(
      Number(bet.shares),
      Number(currentOutcome.probability),
      true // Assuming YES bet, adjust logic if needed
    );

    const profitLoss = cashOut.cashOutValue - Number(bet.amount);
    const profitLossPercent = (profitLoss / Number(bet.amount)) * 100;

    return successResponse({
      betId: bet.id,
      originalAmount: Number(bet.amount),
      shares: Number(bet.shares),
      originalProbability: Number(bet.probability),
      currentProbability: Number(currentOutcome.probability),
      cashOutValue: cashOut.cashOutValue,
      currentPrice: cashOut.currentPrice,
      profitLoss: Math.round(profitLoss),
      profitLossPercent: Math.round(profitLossPercent * 100) / 100,
      fees: Math.round(Number(bet.shares) * cashOut.currentPrice * 0.02), // 2% fee
      market: {
        id: bet.market.id,
        title: bet.market.title,
        endDate: bet.market.endDate,
      },
      outcome: {
        id: bet.outcome.id,
        label: bet.outcome.label,
      },
    });
  } catch (error) {
    console.error('Error getting cash-out quote:', error);
    return errorResponse('Gagal menghitung cash-out', 500);
  }
}, RATE_LIMITS.user);

// PUT /api/bets/cashout - Execute cash-out
export const PUT = withAuth(async ({ user, request }) => {
  try {
    const body = await request.json();
    const validation = validateSchema(cashOutSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { betId } = validation.data;

    // Get bet with market and outcome
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        market: {
          include: {
            outcomes: true,
          },
        },
        outcome: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!bet) {
      return notFoundResponse('Bet tidak ditemukan');
    }

    // Verify ownership
    if (bet.userId !== user!.id) {
      return errorResponse('Anda tidak memiliki akses ke bet ini', 403);
    }

    // Check if bet can be cashed out
    if (bet.status !== 'ACTIVE') {
      return errorResponse(`Bet tidak dapat di-cashout. Status: ${bet.status}`, 400);
    }

    if (bet.market.status !== 'ACTIVE') {
      return errorResponse('Market sudah tidak aktif', 400);
    }

    // Get current outcome probability
    const currentOutcome = (bet.market.outcomes as OutcomeType[]).find(
      (o: OutcomeType) => o.id === bet.outcomeId
    );

    if (!currentOutcome) {
      return errorResponse('Outcome tidak ditemukan', 500);
    }

    // Calculate cash-out value
    const cashOut = calculateCashOutValue(
      Number(bet.shares),
      Number(currentOutcome.probability),
      true
    );

    const profitLoss = cashOut.cashOutValue - Number(bet.amount);

    // Execute cash-out in transaction
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Update bet status
      const updatedBet = await tx.bet.update({
        where: { id: betId },
        data: {
          status: 'CASHED_OUT',
          cashedOutAt: new Date(),
          cashedOutAmount: cashOut.cashOutValue,
          profit: profitLoss,
        },
      });

      // Add balance to user
      await tx.user.update({
        where: { id: user!.id },
        data: {
          balance: { increment: cashOut.cashOutValue },
          totalProfit: { increment: profitLoss },
        },
      });

      // Update outcome volume (reduce by shares sold)
      await tx.outcome.update({
        where: { id: bet.outcomeId },
        data: {
          volume: { decrement: Number(bet.amount) },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user!.id,
          type: 'BET_WON', // Using BET_WON type for cash-out credit
          amount: cashOut.cashOutValue,
          totalAmount: cashOut.cashOutValue,
          fee: Math.round(Number(bet.shares) * cashOut.currentPrice * 0.02),
          paymentMethod: 'BANK_TRANSFER', // Internal
          status: 'COMPLETED',
          paidAt: new Date(),
          metadata: {
            type: 'CASH_OUT',
            betId,
            originalAmount: Number(bet.amount),
            profitLoss,
          },
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: user!.id,
          type: 'SYSTEM',
          title: 'Cash-out Berhasil',
          message: `Anda telah cash-out dari "${bet.market.title}" dengan nilai Rp ${cashOut.cashOutValue.toLocaleString('id-ID')}. ${profitLoss >= 0 ? 'Profit' : 'Loss'}: Rp ${Math.abs(profitLoss).toLocaleString('id-ID')}`,
          link: `/market/${bet.marketId}`,
        },
      });

      // Record price history
      await tx.priceHistory.create({
        data: {
          marketId: bet.marketId,
          outcomeId: bet.outcomeId,
          probability: currentOutcome.probability,
          volume: currentOutcome.volume - Number(bet.amount),
        },
      });

      return updatedBet;
    });

    return successResponse({
      message: 'Cash-out berhasil',
      bet: {
        id: result.id,
        status: result.status,
        cashedOutAmount: cashOut.cashOutValue,
        profitLoss: Math.round(profitLoss),
      },
      balanceAdded: cashOut.cashOutValue,
    });
  } catch (error) {
    console.error('Error executing cash-out:', error);
    return errorResponse('Gagal melakukan cash-out', 500);
  }
}, RATE_LIMITS.write);
