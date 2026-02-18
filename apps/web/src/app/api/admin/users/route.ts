import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users - Get all users (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const kycStatus = searchParams.get('kycStatus');
    const banned = searchParams.get('banned');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (kycStatus) where.kycStatus = kycStatus;
    if (banned === 'true') where.isBanned = true;
    if (banned === 'false') where.isBanned = false;

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        balance: true,
        totalBets: true,
        totalWins: true,
        totalProfit: true,
        kycStatus: true,
        kycLevel: true,
        isAdmin: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { bets: true, transactions: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data users' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Ban/unban user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, banReason, adminId } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa memodifikasi admin' },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'ban':
        updateData = { isBanned: true, banReason };
        break;
      case 'unban':
        updateData = { isBanned: false, banReason: null };
        break;
      case 'makeAdmin':
        updateData = { isAdmin: true };
        break;
      case 'removeAdmin':
        updateData = { isAdmin: false };
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Aksi tidak valid' },
          { status: 400 }
        );
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log admin action
    if (adminId) {
      await prisma.adminLog.create({
        data: {
          adminId,
          action: action.toUpperCase() + '_USER',
          target: `user:${userId}`,
          details: { banReason },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `User berhasil di-${action}`,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate user' },
      { status: 500 }
    );
  }
}
