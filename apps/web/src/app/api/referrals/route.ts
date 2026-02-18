import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ReferralType {
  id: string;
  bonusAmount: number;
}

// GET /api/referrals - Get user's referrals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID wajib diisi' },
        { status: 400 }
      );
    }

    // Get user's referral code and earnings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referralCode: true,
        referralEarnings: true,
        referrals: {
          select: {
            id: true,
            username: true,
            avatar: true,
            createdAt: true,
            totalBets: true,
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

    // Get referral records
    const referralRecords = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalEarnings: Number(user.referralEarnings),
        totalReferrals: user.referrals.length,
        referrals: user.referrals,
        records: referralRecords,
      },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data referral' },
      { status: 500 }
    );
  }
}

// POST /api/referrals/claim - Claim referral bonus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID wajib diisi' },
        { status: 400 }
      );
    }

    // Get unpaid referral bonuses
    const unpaidReferrals = await prisma.referral.findMany({
      where: {
        referrerId: userId,
        bonusPaid: false,
      },
    });

    if (unpaidReferrals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada bonus referral yang bisa diklaim' },
        { status: 400 }
      );
    }

    // Calculate total bonus
    const totalBonus = (unpaidReferrals as ReferralType[]).reduce(
      (sum: number, ref: ReferralType) => sum + Number(ref.bonusAmount),
      0
    );

    // Process claim
    await prisma.$transaction(async (tx: typeof prisma) => {
      // Update referral records
      await tx.referral.updateMany({
        where: {
          id: { in: (unpaidReferrals as ReferralType[]).map((r: ReferralType) => r.id) },
        },
        data: {
          bonusPaid: true,
          paidAt: new Date(),
        },
      });

      // Add bonus to user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: totalBonus },
          referralEarnings: { increment: totalBonus },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: 'REFERRAL_BONUS',
          amount: totalBonus,
          totalAmount: totalBonus,
          paymentMethod: 'BANK_TRANSFER', // Internal
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: 'REFERRAL_BONUS',
          title: 'Bonus Referral Diklaim',
          message: `Anda berhasil mengklaim bonus referral sebesar Rp ${totalBonus.toLocaleString('id-ID')}`,
          link: '/profile?tab=referral',
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        claimed: unpaidReferrals.length,
        totalBonus,
      },
    });
  } catch (error) {
    console.error('Error claiming referral bonus:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengklaim bonus referral' },
      { status: 500 }
    );
  }
}
