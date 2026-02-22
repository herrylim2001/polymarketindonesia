import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withAuth,
  withRateLimit,
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  getPaginationParams,
  getSearchParams,
  RATE_LIMITS,
} from '@/lib/api/middleware';
import { validateSchema, createCommentSchema } from '@/lib/api/validation';

// GET /api/comments - Get comments for a market
export const GET = withRateLimit(async ({ request }) => {
  try {
    const { page, limit, skip } = getPaginationParams(request);
    const params = getSearchParams(request);
    const marketId = params.get('marketId');
    const parentId = params.get('parentId');

    if (!marketId) {
      return errorResponse('Market ID wajib diisi', 400);
    }

    const where: Record<string, unknown> = {
      marketId,
      isHidden: false,
    };

    // If parentId is specified, get replies; otherwise get top-level comments
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null;
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              replies: {
                where: { isHidden: false },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return successResponse({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return errorResponse('Gagal mengambil komentar', 500);
  }
}, RATE_LIMITS.public);

// POST /api/comments - Create a comment
export const POST = withAuth(async ({ user, request }) => {
  try {
    const body = await request.json();
    const validation = validateSchema(createCommentSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { marketId, content, parentId } = validation.data;

    // Verify market exists
    const market = await prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market) {
      return notFoundResponse('Market tidak ditemukan');
    }

    // If replying, verify parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return notFoundResponse('Komentar parent tidak ditemukan');
      }

      if (parentComment.marketId !== marketId) {
        return errorResponse('Parent comment bukan dari market ini', 400);
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        userId: user!.id,
        marketId,
        content,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // If it's a reply, notify the parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true },
      });

      if (parentComment && parentComment.userId !== user!.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: 'SYSTEM',
            title: 'Balasan Komentar',
            message: `${user!.username} membalas komentar Anda di "${market.title}"`,
            link: `/market/${marketId}`,
          },
        });
      }
    }

    return successResponse(comment, 201);
  } catch (error) {
    console.error('Error creating comment:', error);
    return errorResponse('Gagal membuat komentar', 500);
  }
}, RATE_LIMITS.write);

// DELETE /api/comments - Delete own comment
export const DELETE = withAuth(async ({ user, request }) => {
  try {
    const params = getSearchParams(request);
    const commentId = params.get('id');

    if (!commentId) {
      return errorResponse('Comment ID wajib diisi', 400);
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return notFoundResponse('Komentar tidak ditemukan');
    }

    // Only owner or admin can delete
    if (comment.userId !== user!.id && !user!.isAdmin) {
      return errorResponse('Anda tidak memiliki akses untuk menghapus komentar ini', 403);
    }

    // Soft delete - just hide the comment
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        isHidden: true,
        content: '[Komentar dihapus]',
      },
    });

    return successResponse({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return errorResponse('Gagal menghapus komentar', 500);
  }
}, RATE_LIMITS.write);
