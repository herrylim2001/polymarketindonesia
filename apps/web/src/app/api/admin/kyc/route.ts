import { NextRequest, NextResponse } from 'next/server';
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
import { validateSchema, reviewKycSchema, bulkKycReviewSchema } from '@/lib/api/validation';

interface KycDocumentType {
  id: string;
  type: string;
  status: string;
}

// GET /api/admin/kyc - Get all pending KYC documents
export const GET = withAdmin(async ({ request }) => {
  try {
    const { page, limit, skip } = getPaginationParams(request);
    const params = getSearchParams(request);
    const status = params.get('status') || 'PENDING';
    const type = params.get('type');
    const userId = params.get('userId');

    const where: Record<string, unknown> = {};
    if (status !== 'all') where.status = status;
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const [documents, total] = await Promise.all([
      prisma.kycDocument.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              kycStatus: true,
              kycLevel: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.kycDocument.count({ where }),
    ]);

    // Get summary stats
    const stats = await prisma.kycDocument.groupBy({
      by: ['status'],
      _count: true,
    });

    return successResponse({
      documents,
      stats: stats.reduce((acc, s) => {
        acc[s.status.toLowerCase()] = s._count;
        return acc;
      }, {} as Record<string, number>),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching KYC documents:', error);
    return errorResponse('Gagal mengambil data KYC', 500);
  }
}, RATE_LIMITS.admin);

// POST /api/admin/kyc - Review single KYC document
export const POST = withAdmin(async ({ user, request }) => {
  try {
    const body = await request.json();
    const validation = validateSchema(reviewKycSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { documentId, status, rejectionReason, verifiedData } = validation.data;

    const document = await prisma.kycDocument.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) {
      return notFoundResponse('Dokumen KYC tidak ditemukan');
    }

    if (document.status !== 'PENDING') {
      return errorResponse('Dokumen sudah diproses sebelumnya', 400);
    }

    // Process KYC review in transaction
    await prisma.$transaction(async (tx: typeof prisma) => {
      // Update document
      await tx.kycDocument.update({
        where: { id: documentId },
        data: {
          status: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
          rejectedReason: status === 'REJECTED' ? rejectionReason : null,
          verifiedAt: status === 'APPROVED' ? new Date() : null,
          verifiedData: verifiedData || {},
        },
      });

      // Get all user's documents
      const allDocuments = await tx.kycDocument.findMany({
        where: { userId: document.userId },
      });

      // Calculate new KYC level
      const verifiedDocs = (allDocuments as KycDocumentType[]).filter((d: KycDocumentType) =>
        d.id === documentId ? status === 'APPROVED' : d.status === 'VERIFIED'
      );

      let kycLevel = 0;
      let kycStatus = 'PENDING';

      if (verifiedDocs.length > 0) {
        const hasIdDoc = verifiedDocs.some((d: KycDocumentType) =>
          ['ktp', 'sim', 'passport'].includes(d.type.toLowerCase())
        );
        const hasSelfie = verifiedDocs.some((d: KycDocumentType) =>
          d.type.toLowerCase() === 'selfie'
        );
        const hasNpwp = verifiedDocs.some((d: KycDocumentType) =>
          d.type.toLowerCase() === 'npwp'
        );

        if (hasIdDoc) kycLevel = 1;
        if (hasIdDoc && hasSelfie) kycLevel = 2;
        if (hasIdDoc && hasSelfie && hasNpwp) kycLevel = 3;

        kycStatus = kycLevel > 0 ? 'VERIFIED' : 'PENDING';
      } else if (status === 'REJECTED') {
        const pendingDocs = (allDocuments as KycDocumentType[]).filter(
          (d: KycDocumentType) => d.status === 'PENDING' && d.id !== documentId
        );
        kycStatus = pendingDocs.length > 0 ? 'PENDING' : 'REJECTED';
      }

      // Update user KYC status
      await tx.user.update({
        where: { id: document.userId },
        data: { kycStatus, kycLevel },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: document.userId,
          type: status === 'APPROVED' ? 'KYC_APPROVED' : 'KYC_REJECTED',
          title: status === 'APPROVED' ? 'KYC Disetujui' : 'KYC Ditolak',
          message: status === 'APPROVED'
            ? `Dokumen ${document.type.toUpperCase()} Anda telah diverifikasi. Level KYC: ${kycLevel}`
            : `Dokumen ${document.type.toUpperCase()} ditolak. Alasan: ${rejectionReason}`,
          link: '/profile?tab=kyc',
        },
      });
    });

    // Log admin action
    await logAdminAction(
      user!.id,
      status === 'APPROVED' ? 'APPROVE_KYC' : 'REJECT_KYC',
      `kyc:${documentId}`,
      {
        userId: document.userId,
        documentType: document.type,
        rejectionReason,
      }
    );

    return successResponse({
      message: status === 'APPROVED' ? 'KYC berhasil diverifikasi' : 'KYC ditolak',
    });
  } catch (error) {
    console.error('Error reviewing KYC:', error);
    return errorResponse('Gagal memproses KYC', 500);
  }
}, RATE_LIMITS.admin);

// PUT /api/admin/kyc - Bulk review KYC documents
export const PUT = withAdmin(async ({ user, request }) => {
  try {
    const body = await request.json();
    const validation = validateSchema(bulkKycReviewSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { documentIds, status, rejectionReason } = validation.data;

    // Get all documents
    const documents = await prisma.kycDocument.findMany({
      where: {
        id: { in: documentIds },
        status: 'PENDING',
      },
      include: { user: true },
    });

    if (documents.length === 0) {
      return errorResponse('Tidak ada dokumen yang dapat diproses', 400);
    }

    const results = {
      processed: 0,
      skipped: documentIds.length - documents.length,
      userIds: new Set<string>(),
    };

    // Process each document
    for (const document of documents) {
      await prisma.$transaction(async (tx: typeof prisma) => {
        await tx.kycDocument.update({
          where: { id: document.id },
          data: {
            status: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
            rejectedReason: status === 'REJECTED' ? rejectionReason : null,
            verifiedAt: status === 'APPROVED' ? new Date() : null,
          },
        });

        results.userIds.add(document.userId);
        results.processed++;
      });
    }

    // Update user KYC statuses
    for (const userId of results.userIds) {
      const allDocs = await prisma.kycDocument.findMany({
        where: { userId },
      });

      const verifiedDocs = (allDocs as KycDocumentType[]).filter(
        (d: KycDocumentType) => d.status === 'VERIFIED'
      );

      let kycLevel = 0;
      if (verifiedDocs.length > 0) {
        const hasIdDoc = verifiedDocs.some((d: KycDocumentType) =>
          ['ktp', 'sim', 'passport'].includes(d.type.toLowerCase())
        );
        const hasSelfie = verifiedDocs.some((d: KycDocumentType) =>
          d.type.toLowerCase() === 'selfie'
        );
        const hasNpwp = verifiedDocs.some((d: KycDocumentType) =>
          d.type.toLowerCase() === 'npwp'
        );

        if (hasIdDoc) kycLevel = 1;
        if (hasIdDoc && hasSelfie) kycLevel = 2;
        if (hasIdDoc && hasSelfie && hasNpwp) kycLevel = 3;
      }

      const pendingDocs = (allDocs as KycDocumentType[]).filter(
        (d: KycDocumentType) => d.status === 'PENDING'
      );
      const kycStatus = kycLevel > 0 ? 'VERIFIED' : (pendingDocs.length > 0 ? 'PENDING' : 'REJECTED');

      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus, kycLevel },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: status === 'APPROVED' ? 'KYC_APPROVED' : 'KYC_REJECTED',
          title: status === 'APPROVED' ? 'KYC Disetujui' : 'KYC Ditolak',
          message: status === 'APPROVED'
            ? `Dokumen KYC Anda telah diverifikasi. Level KYC: ${kycLevel}`
            : `Dokumen KYC ditolak. Alasan: ${rejectionReason}`,
          link: '/profile?tab=kyc',
        },
      });
    }

    // Log admin action
    await logAdminAction(
      user!.id,
      status === 'APPROVED' ? 'BULK_APPROVE_KYC' : 'BULK_REJECT_KYC',
      `kyc:bulk`,
      {
        documentIds,
        processed: results.processed,
        skipped: results.skipped,
        rejectionReason,
      }
    );

    return successResponse({
      message: `${results.processed} dokumen berhasil diproses`,
      processed: results.processed,
      skipped: results.skipped,
    });
  } catch (error) {
    console.error('Error bulk reviewing KYC:', error);
    return errorResponse('Gagal memproses KYC secara bulk', 500);
  }
}, RATE_LIMITS.admin);
