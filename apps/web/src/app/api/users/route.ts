import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET /api/users - Get user profile or leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    // Get leaderboard
    if (type === 'leaderboard') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const users = await prisma.user.findMany({
        where: {
          totalBets: { gt: 0 },
          isBanned: false,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
          totalBets: true,
          totalWins: true,
          totalProfit: true,
        },
        orderBy: { totalProfit: 'desc' },
        take: limit,
      });

      return NextResponse.json({
        success: true,
        data: users,
      });
    }

    // Get user by ID
    if (id) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          phone: true,
          balance: true,
          totalBets: true,
          totalWins: true,
          totalProfit: true,
          kycStatus: true,
          kycLevel: true,
          referralCode: true,
          referralEarnings: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              bets: true,
              referrals: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: user,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Parameter tidak valid' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data user' },
      { status: 500 }
    );
  }
}

// POST /api/users - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, referralCode } = body;

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, username, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Check existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Generate referral code
    const userReferralCode = `${username.toUpperCase().substring(0, 4)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Check referrer
    let referrerId: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        referralCode: userReferralCode,
        referredById: referrerId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        referralCode: true,
        createdAt: true,
      },
    });

    // If referred, create referral record
    if (referrerId) {
      await prisma.referral.create({
        data: {
          referrerId,
          referredUserId: user.id,
          bonusAmount: 50000, // Rp 50,000 bonus
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: user,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mendaftar user' },
      { status: 500 }
    );
  }
}
