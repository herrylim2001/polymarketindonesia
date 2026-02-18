import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/transactions/[id] - Get transaction by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

// PATCH /api/transactions/[id] - Update transaction status (for webhook/admin)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, failureReason, cryptoTxHash, paidAt } = body;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // If completing a deposit, add to user balance
    if (status === 'COMPLETED' && transaction.type === 'DEPOSIT') {
      await prisma.$transaction(async (tx: typeof prisma) => {
        // Update transaction
        await tx.transaction.update({
          where: { id },
          data: {
            status,
            paidAt: paidAt ? new Date(paidAt) : new Date(),
            cryptoTxHash,
          },
        });

        // Add to user balance
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            balance: { increment: Number(transaction.totalAmount) },
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: transaction.userId,
            type: 'DEPOSIT_COMPLETED',
            title: 'Deposit Berhasil',
            message: `Deposit Rp ${Number(transaction.totalAmount).toLocaleString('id-ID')} berhasil ditambahkan ke saldo Anda`,
            link: '/transactions',
          },
        });
      });
    }
    // If completing a withdrawal
    else if (status === 'COMPLETED' && transaction.type === 'WITHDRAWAL') {
      await prisma.$transaction(async (tx: typeof prisma) => {
        await tx.transaction.update({
          where: { id },
          data: {
            status,
            paidAt: paidAt ? new Date(paidAt) : new Date(),
            cryptoTxHash,
          },
        });

        await tx.notification.create({
          data: {
            userId: transaction.userId,
            type: 'WITHDRAWAL_COMPLETED',
            title: 'Withdrawal Berhasil',
            message: `Withdrawal Rp ${Number(transaction.totalAmount).toLocaleString('id-ID')} telah diproses`,
            link: '/transactions',
          },
        });
      });
    }
    // If failed/cancelled withdrawal, refund the balance
    else if ((status === 'FAILED' || status === 'CANCELLED') &&
             transaction.type === 'WITHDRAWAL' &&
             transaction.status === 'PENDING') {
      await prisma.$transaction(async (tx: typeof prisma) => {
        await tx.transaction.update({
          where: { id },
          data: {
            status,
            failureReason,
          },
        });

        // Refund balance
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            balance: { increment: Number(transaction.amount) },
          },
        });
      });
    }
    // Other status updates
    else {
      await prisma.transaction.update({
        where: { id },
        data: {
          status,
          failureReason,
          cryptoTxHash,
          paidAt: paidAt ? new Date(paidAt) : undefined,
        },
      });
    }

    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate transaksi' },
      { status: 500 }
    );
  }
}
