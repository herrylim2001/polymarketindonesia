import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withAdmin,
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  logAdminAction,
  RATE_LIMITS,
} from '@/lib/api/middleware';
import { validateSchema, updateMarketSchema, resolveMarketSchema } from '@/lib/api/validation';
import { sendBetWonEmail, sendBetLostEmail, sendMarketResolvedEmail } from '@/lib/email';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/admin/markets/[id] - Get market details (admin)
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        outcomes: true,
        bets: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        priceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: {
            bets: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!market) {
      return notFoundResponse('Market tidak ditemukan');
    }

    return successResponse(market);
  } catch (error) {
    console.error('Error fetching market:', error);
    return errorResponse('Gagal mengambil data market', 500);
  }
}

// PATCH /api/admin/markets/[id] - Update market (admin)
export const PATCH = withAdmin(async ({ user, request }) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return errorResponse('Market ID tidak valid', 400);
    }

    const body = await request.json();
    const validation = validateSchema(updateMarketSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const market = await prisma.market.findUnique({
      where: { id },
    });

    if (!market) {
      return notFoundResponse('Market tidak ditemukan');
    }

    // Cannot edit resolved markets
    if (market.status === 'RESOLVED') {
      return errorResponse('Market yang sudah resolved tidak dapat diedit', 400);
    }

    const updateData = validation.data;

    // Update market
    const updatedMarket = await prisma.market.update({
      where: { id },
      data: updateData,
      include: {
        outcomes: true,
      },
    });

    // Log admin action
    await logAdminAction(
      user!.id,
      'UPDATE_MARKET',
      `market:${id}`,
      {
        changes: updateData,
        previousStatus: market.status,
      }
    );

    return successResponse({
      message: 'Market berhasil diupdate',
      market: updatedMarket,
    });
  } catch (error) {
    console.error('Error updating market:', error);
    return errorResponse('Gagal mengupdate market', 500);
  }
}, RATE_LIMITS.admin);

// POST /api/admin/markets/[id] - Resolve market (admin)
export const POST = withAdmin(async ({ user, request }) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').slice(-1)[0];

    if (!id) {
      return errorResponse('Market ID tidak valid', 400);
    }

    const body = await request.json();
    const validation = validateSchema(resolveMarketSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { winningOutcomeId, resolutionDetails } = validation.data;

    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        outcomes: true,
        bets: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!market) {
      return notFoundResponse('Market tidak ditemukan');
    }

    if (market.status === 'RESOLVED') {
      return errorResponse('Market sudah di-resolve', 400);
    }

    // Verify winning outcome exists
    const winningOutcome = market.outcomes.find(o => o.id === winningOutcomeId);
    if (!winningOutcome) {
      return errorResponse('Winning outcome tidak valid', 400);
    }

    // Process resolution in transaction
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Update market status
      await tx.market.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          winningOutcomeId,
          resolutionDetails,
        },
      });

      // Update winning outcome
      await tx.outcome.update({
        where: { id: winningOutcomeId },
        data: { isWinner: true },
      });

      const winningBets: Array<{ id: string; shares: number; amount: number; user: { id: string; email: string; username: string } }> = [];
      const losingBets: Array<{ id: string; amount: number; user: { id: string; email: string; username: string } }> = [];

      // Process each bet
      for (const bet of market.bets) {
        const isWinner = bet.outcomeId === winningOutcomeId;

        if (isWinner) {
          // Calculate payout (shares = payout if win)
          const payout = Number(bet.shares);
          const profit = payout - Number(bet.amount);

          // Update bet
          await tx.bet.update({
            where: { id: bet.id },
            data: {
              status: 'WON',
              payout,
              profit,
              resolvedAt: new Date(),
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

          // Create transaction
          await tx.transaction.create({
            data: {
              userId: bet.userId,
              type: 'BET_WON',
              amount: payout,
              totalAmount: payout,
              paymentMethod: 'BANK_TRANSFER',
              status: 'COMPLETED',
              paidAt: new Date(),
              metadata: {
                marketId: id,
                betId: bet.id,
                profit,
              },
            },
          });

          // Create notification
          await tx.notification.create({
            data: {
              userId: bet.userId,
              type: 'BET_WON',
              title: 'Selamat, Anda Menang! 🎉',
              message: `Prediksi "${winningOutcome.label}" di market "${market.title}" benar! Anda mendapat Rp ${payout.toLocaleString('id-ID')}`,
              link: `/market/${id}`,
            },
          });

          winningBets.push({
            id: bet.id,
            shares: Number(bet.shares),
            amount: Number(bet.amount),
            user: bet.user,
          });
        } else {
          // Update losing bet
          await tx.bet.update({
            where: { id: bet.id },
            data: {
              status: 'LOST',
              payout: 0,
              profit: -Number(bet.amount),
              resolvedAt: new Date(),
            },
          });

          // Update user stats
          await tx.user.update({
            where: { id: bet.userId },
            data: {
              totalProfit: { decrement: Number(bet.amount) },
            },
          });

          // Create notification
          await tx.notification.create({
            data: {
              userId: bet.userId,
              type: 'BET_LOST',
              title: 'Hasil Market',
              message: `Market "${market.title}" telah selesai. Hasil: "${winningOutcome.label}".`,
              link: `/market/${id}`,
            },
          });

          losingBets.push({
            id: bet.id,
            amount: Number(bet.amount),
            user: bet.user,
          });
        }
      }

      return { winningBets, losingBets };
    });

    // Send email notifications (async, don't wait)
    const emailPromises: Promise<boolean>[] = [];

    for (const bet of result.winningBets) {
      if (bet.user.email) {
        emailPromises.push(
          sendBetWonEmail(
            bet.user.email,
            bet.user.username,
            market.title,
            bet.amount,
            bet.shares
          )
        );
      }
    }

    for (const bet of result.losingBets) {
      if (bet.user.email) {
        emailPromises.push(
          sendBetLostEmail(
            bet.user.email,
            bet.user.username,
            market.title,
            bet.amount
          )
        );
      }
    }

    // Don't wait for emails
    Promise.allSettled(emailPromises);

    // Log admin action
    await logAdminAction(
      user!.id,
      'RESOLVE_MARKET',
      `market:${id}`,
      {
        winningOutcomeId,
        winningOutcome: winningOutcome.label,
        totalBetsProcessed: market.bets.length,
        winnersCount: result.winningBets.length,
        losersCount: result.losingBets.length,
        resolutionDetails,
      }
    );

    return successResponse({
      message: 'Market berhasil di-resolve',
      winningOutcome: winningOutcome.label,
      totalBets: market.bets.length,
      winners: result.winningBets.length,
      losers: result.losingBets.length,
    });
  } catch (error) {
    console.error('Error resolving market:', error);
    return errorResponse('Gagal me-resolve market', 500);
  }
}, RATE_LIMITS.admin);

// DELETE /api/admin/markets/[id] - Cancel market with refunds
export const DELETE = withAdmin(async ({ user, request }) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return errorResponse('Market ID tidak valid', 400);
    }

    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        bets: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!market) {
      return notFoundResponse('Market tidak ditemukan');
    }

    if (market.status === 'RESOLVED') {
      return errorResponse('Market yang sudah resolved tidak dapat dibatalkan', 400);
    }

    // Process cancellation with refunds
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // Update market status
      await tx.market.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          resolvedAt: new Date(),
        },
      });

      let totalRefunded = 0;
      const refundedUsers: string[] = [];

      // Refund all active bets
      for (const bet of market.bets) {
        const refundAmount = Number(bet.amount);

        // Update bet
        await tx.bet.update({
          where: { id: bet.id },
          data: {
            status: 'REFUNDED',
            payout: refundAmount,
            profit: 0,
            resolvedAt: new Date(),
          },
        });

        // Refund to user balance
        await tx.user.update({
          where: { id: bet.userId },
          data: {
            balance: { increment: refundAmount },
          },
        });

        // Create refund transaction
        await tx.transaction.create({
          data: {
            userId: bet.userId,
            type: 'REFUND',
            amount: refundAmount,
            totalAmount: refundAmount,
            paymentMethod: 'BANK_TRANSFER',
            status: 'COMPLETED',
            paidAt: new Date(),
            metadata: {
              marketId: id,
              betId: bet.id,
              reason: 'Market cancelled',
            },
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: bet.userId,
            type: 'SYSTEM',
            title: 'Market Dibatalkan - Refund',
            message: `Market "${market.title}" dibatalkan. Taruhan Anda sebesar Rp ${refundAmount.toLocaleString('id-ID')} telah dikembalikan.`,
            link: `/market/${id}`,
          },
        });

        totalRefunded += refundAmount;
        if (!refundedUsers.includes(bet.userId)) {
          refundedUsers.push(bet.userId);
        }
      }

      return { totalRefunded, refundedUsers: refundedUsers.length, betsRefunded: market.bets.length };
    });

    // Log admin action
    await logAdminAction(
      user!.id,
      'CANCEL_MARKET',
      `market:${id}`,
      {
        totalRefunded: result.totalRefunded,
        usersRefunded: result.refundedUsers,
        betsRefunded: result.betsRefunded,
      }
    );

    return successResponse({
      message: 'Market dibatalkan dan semua taruhan telah di-refund',
      totalRefunded: result.totalRefunded,
      usersRefunded: result.refundedUsers,
      betsRefunded: result.betsRefunded,
    });
  } catch (error) {
    console.error('Error cancelling market:', error);
    return errorResponse('Gagal membatalkan market', 500);
  }
}, RATE_LIMITS.admin);
