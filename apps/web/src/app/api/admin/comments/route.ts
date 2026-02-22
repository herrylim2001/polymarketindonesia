import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withAdmin,
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  logAdminAction,
  getPaginationParams,
  getSearchParams,
  RATE_LIMITS,
} from '@/lib/api/middleware';
import { validateSchema, moderateCommentSchema } from '@/lib/api/validation';

// GET /api/admin/comments - Get all comments for moderation
export const GET = withAdmin(async ({ request }) => {
  try {
    const { page, limit, skip } = getPaginationParams(request);
    const params = getSearchParams(request);
    const marketId = params.get('marketId');
    const userId = params.get('userId');
    const hidden = params.get('hidden');
    const search = params.get('search');

    const where: Record<string, unknown> = {};

    if (marketId) where.marketId = marketId;
    if (userId) where.userId = userId;
    if (hidden === 'true') where.isHidden = true;
    if (hidden === 'false') where.isHidden = false;
    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
              isBanned: true,
            },
          },
          market: {
            select: {
              id: true,
              title: true,
            },
          },
          parent: {
            select: {
              id: true,
              content: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.comment.groupBy({
      by: ['isHidden'],
      _count: true,
    });

    return successResponse({
      comments,
      stats: {
        visible: stats.find(s => !s.isHidden)?._count || 0,
        hidden: stats.find(s => s.isHidden)?._count || 0,
        total,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments for moderation:', error);
    return errorResponse('Gagal mengambil komentar', 500);
  }
}, RATE_LIMITS.admin);

// POST /api/admin/comments - Moderate a comment
export const POST = withAdmin(async ({ user, request }) => {
  try {
    const body = await request.json();
    const validation = validateSchema(moderateCommentSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { commentId, action, reason } = validation.data;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        market: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!comment) {
      return notFoundResponse('Komentar tidak ditemukan');
    }

    let updateData: Record<string, unknown> = {};
    let notificationMessage = '';

    switch (action) {
      case 'hide':
        updateData = { isHidden: true };
        notificationMessage = `Komentar Anda di "${comment.market.title}" telah disembunyikan karena melanggar kebijakan.`;
        break;

      case 'delete':
        updateData = {
          isHidden: true,
          content: '[Komentar dihapus oleh moderator]',
        };
        notificationMessage = `Komentar Anda di "${comment.market.title}" telah dihapus. Alasan: ${reason || 'Melanggar kebijakan komunitas'}`;
        break;

      case 'approve':
        updateData = { isHidden: false };
        break;

      case 'reject':
        updateData = {
          isHidden: true,
          content: '[Komentar ditolak]',
        };
        notificationMessage = `Komentar Anda di "${comment.market.title}" ditolak. Alasan: ${reason || 'Tidak sesuai kebijakan'}`;
        break;

      default:
        return errorResponse('Aksi tidak valid', 400);
    }

    // Update comment
    await prisma.comment.update({
      where: { id: commentId },
      data: updateData,
    });

    // Notify user if comment was hidden/deleted
    if (notificationMessage) {
      await prisma.notification.create({
        data: {
          userId: comment.userId,
          type: 'SYSTEM',
          title: 'Moderasi Komentar',
          message: notificationMessage,
          link: `/market/${comment.marketId}`,
        },
      });
    }

    // Log admin action
    await logAdminAction(
      user!.id,
      `MODERATE_COMMENT_${action.toUpperCase()}`,
      `comment:${commentId}`,
      {
        commentAuthor: comment.user.username,
        marketId: comment.marketId,
        originalContent: comment.content.substring(0, 200),
        reason,
      }
    );

    return successResponse({
      message: `Komentar berhasil di-${action}`,
      commentId,
      action,
    });
  } catch (error) {
    console.error('Error moderating comment:', error);
    return errorResponse('Gagal memoderasi komentar', 500);
  }
}, RATE_LIMITS.admin);

// PUT /api/admin/comments - Bulk moderate comments
export const PUT = withAdmin(async ({ user, request }) => {
  try {
    const body = await request.json();
    const { commentIds, action, reason } = body;

    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      return errorResponse('Comment IDs harus berupa array', 400);
    }

    if (!['hide', 'delete', 'approve'].includes(action)) {
      return errorResponse('Aksi tidak valid', 400);
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'hide':
        updateData = { isHidden: true };
        break;
      case 'delete':
        updateData = {
          isHidden: true,
          content: '[Komentar dihapus oleh moderator]',
        };
        break;
      case 'approve':
        updateData = { isHidden: false };
        break;
    }

    // Bulk update
    const result = await prisma.comment.updateMany({
      where: {
        id: { in: commentIds },
      },
      data: updateData,
    });

    // Log admin action
    await logAdminAction(
      user!.id,
      `BULK_MODERATE_COMMENTS_${action.toUpperCase()}`,
      `comments:bulk`,
      {
        count: result.count,
        commentIds,
        reason,
      }
    );

    return successResponse({
      message: `${result.count} komentar berhasil di-${action}`,
      processed: result.count,
    });
  } catch (error) {
    console.error('Error bulk moderating comments:', error);
    return errorResponse('Gagal memoderasi komentar secara bulk', 500);
  }
}, RATE_LIMITS.admin);
