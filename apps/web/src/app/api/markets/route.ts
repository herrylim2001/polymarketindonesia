import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/markets - Get all markets with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured') === 'true';
    const trending = searchParams.get('trending') === 'true';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Record<string, unknown> = {};

    if (category) where.category = category;
    if (status) where.status = status;
    if (featured) where.featured = true;
    if (trending) where.trending = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.market.count({ where });

    // Get markets with outcomes
    const markets = await prisma.market.findMany({
      where,
      include: {
        outcomes: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { bets: true, comments: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: markets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data markets' },
      { status: 500 }
    );
  }
}

// POST /api/markets - Create a new market (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      imageUrl,
      source,
      endDate,
      outcomes,
      featured,
      trending,
      createdById,
    } = body;

    // Validation
    if (!title || !description || !category || !endDate || !outcomes || outcomes.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Create market with outcomes
    const market = await prisma.market.create({
      data: {
        title,
        description,
        category,
        imageUrl,
        source,
        endDate: new Date(endDate),
        featured: featured || false,
        trending: trending || false,
        createdById,
        liquidity: 1000000,
        outcomes: {
          create: outcomes.map((outcome: { label: string; probability?: number }) => ({
            label: outcome.label,
            probability: outcome.probability || 50,
            shares: 500000,
          })),
        },
      },
      include: {
        outcomes: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: market,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating market:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat market' },
      { status: 500 }
    );
  }
}
