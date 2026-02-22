import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withAuth,
  successResponse,
  errorResponse,
  validationErrorResponse,
  getPaginationParams,
  getSearchParams,
  RATE_LIMITS,
} from '@/lib/api/middleware';
import { validateSchema, markNotificationReadSchema } from '@/lib/api/validation';

// GET /api/notifications - Get user's notifications
export const GET = withAuth(async ({ user, request }) => {
  try {
    const { page, limit, skip } = getPaginationParams(request);
    const params = getSearchParams(request);
    const unreadOnly = params.get('unreadOnly') === 'true';
    const type = params.get('type');

    const where: Record<string, unknown> = { userId: user!.id };
    if (unreadOnly) where.read = false;
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user!.id, read: false },
      }),
    ]);

    return successResponse({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse('Gagal mengambil notifikasi', 500);
  }
}, RATE_LIMITS.user)

// PATCH /api/notifications - Mark notifications as read
export const PATCH = withAuth(async ({ user, request }) => {
  try {
    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      // Mark all as read
      const result = await prisma.notification.updateMany({
        where: { userId: user!.id, read: false },
        data: { read: true },
      });

      return successResponse({
        message: `${result.count} notifikasi ditandai sudah dibaca`,
        count: result.count,
      });
    }

    // Mark specific notifications as read
    const validation = validateSchema(markNotificationReadSchema, { notificationIds });

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: { in: validation.data.notificationIds },
        userId: user!.id, // Ensure user owns the notifications
      },
      data: { read: true },
    });

    return successResponse({
      message: `${result.count} notifikasi ditandai sudah dibaca`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return errorResponse('Gagal mengupdate notifikasi', 500);
  }
}, RATE_LIMITS.user);

// DELETE /api/notifications - Delete notifications
export const DELETE = withAuth(async ({ user, request }) => {
  try {
    const params = getSearchParams(request);
    const notificationId = params.get('id');
    const deleteAll = params.get('all') === 'true';
    const deleteRead = params.get('read') === 'true';

    if (deleteAll) {
      const where: Record<string, unknown> = { userId: user!.id };
      if (deleteRead) {
        where.read = true; // Only delete read notifications
      }

      const result = await prisma.notification.deleteMany({ where });

      return successResponse({
        message: `${result.count} notifikasi dihapus`,
        count: result.count,
      });
    }

    if (notificationId) {
      // Delete specific notification
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: user!.id,
        },
      });

      if (!notification) {
        return errorResponse('Notifikasi tidak ditemukan', 404);
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      });

      return successResponse({ message: 'Notifikasi dihapus' });
    }

    return errorResponse('ID notifikasi atau parameter all wajib diisi', 400);
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return errorResponse('Gagal menghapus notifikasi', 500);
  }
}, RATE_LIMITS.user);
