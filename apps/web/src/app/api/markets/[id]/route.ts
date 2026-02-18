import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/markets/[id] - Get market by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        outcomes: {
          orderBy: { createdAt: 'asc' },
        },
        comments: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
            replies: {
              include: {
                user: {
                  select: { id: true, username: true, avatar: true },
                },
              },
            },
          },
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
        _count: {
          select: { bets: true, comments: true, bookmarks: true },
        },
      },
    });

    if (!market) {
      return NextResponse.json(
        { success: false, error: 'Market tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: market,
    });
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data market' },
      { status: 500 }
    );
  }
}

// PATCH /api/markets/[id] - Update market (admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const market = await prisma.market.update({
      where: { id },
      data: body,
      include: {
        outcomes: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: market,
    });
  } catch (error) {
    console.error('Error updating market:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate market' },
      { status: 500 }
    );
  }
}

// DELETE /api/markets/[id] - Delete market (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.market.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Market berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting market:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus market' },
      { status: 500 }
    );
  }
}
