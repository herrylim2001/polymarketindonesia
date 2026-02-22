import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withAuth,
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  getPaginationParams,
  RATE_LIMITS,
} from '@/lib/api/middleware';
import { validateSchema, toggleBookmarkSchema } from '@/lib/api/validation';

// GET /api/bookmarks - Get user's bookmarked markets
export const GET = withAuth(async ({ user, request }) => {
  try {
    const { page, limit, skip } = getPaginationParams(request);

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: user!.id },
        include: {
          market: {
            include: {
              outcomes: true,
              _count: {
                select: {
                  bets: true,
                  comments: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bookmark.count({ where: { userId: user!.id } }),
    ]);

    return successResponse({
      bookmarks: bookmarks.map(b => ({
        id: b.id,
        createdAt: b.createdAt,
        market: b.market,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return errorResponse('Gagal mengambil bookmarks', 500);
  }
}, RATE_LIMITS.user);

// POST /api/bookmarks - Toggle bookmark on a market
export const POST = withAuth(async ({ user, request }) => {
  try {
    const body = await request.json();
    const validation = validateSchema(toggleBookmarkSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { marketId } = validation.data;

    // Verify market exists
    const market = await prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market) {
      return notFoundResponse('Market tidak ditemukan');
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_marketId: {
          userId: user!.id,
          marketId,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });

      return successResponse({
        bookmarked: false,
        message: 'Bookmark dihapus',
      });
    } else {
      // Add bookmark
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: user!.id,
          marketId,
        },
      });

      return successResponse({
        bookmarked: true,
        bookmarkId: bookmark.id,
        message: 'Market di-bookmark',
      }, 201);
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return errorResponse('Gagal mengubah bookmark', 500);
  }
}, RATE_LIMITS.write);

// DELETE /api/bookmarks - Remove a specific bookmark
export const DELETE = withAuth(async ({ user, request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('marketId');

    if (!marketId) {
      return errorResponse('Market ID wajib diisi', 400);
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_marketId: {
          userId: user!.id,
          marketId,
        },
      },
    });

    if (!bookmark) {
      return notFoundResponse('Bookmark tidak ditemukan');
    }

    await prisma.bookmark.delete({
      where: { id: bookmark.id },
    });

    return successResponse({ message: 'Bookmark dihapus' });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return errorResponse('Gagal menghapus bookmark', 500);
  }
}, RATE_LIMITS.write);
