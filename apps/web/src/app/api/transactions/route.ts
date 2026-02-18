import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/transactions - Get user's transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID wajib diisi' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    if (status) where.status = status;

    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create deposit request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      amount,
      paymentMethod,
      bankCode,
      ewalletCode,
      cryptoCode,
      cryptoNetwork,
    } = body;

    // Validation
    if (!userId || !type || !amount || amount <= 0 || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap atau tidak valid' },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // For withdrawal, check balance
    if (type === 'WITHDRAWAL') {
      if (Number(user.balance) < amount) {
        return NextResponse.json(
          { success: false, error: 'Saldo tidak mencukupi' },
          { status: 400 }
        );
      }

      // KYC check for withdrawal
      if (user.kycStatus !== 'VERIFIED') {
        return NextResponse.json(
          { success: false, error: 'KYC belum terverifikasi' },
          { status: 400 }
        );
      }
    }

    // Calculate fee
    const feePercentage = type === 'WITHDRAWAL' ? 0.01 : 0; // 1% for withdrawal
    const fee = Math.round(amount * feePercentage);
    const totalAmount = type === 'WITHDRAWAL' ? amount - fee : amount;

    // Generate external ID
    const externalId = `${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount,
        fee,
        totalAmount,
        paymentMethod,
        bankCode,
        ewalletCode,
        cryptoCode,
        cryptoNetwork,
        externalId,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // For withdrawal, deduct balance immediately
    if (type === 'WITHDRAWAL') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: amount },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat transaksi' },
      { status: 500 }
    );
  }
}
