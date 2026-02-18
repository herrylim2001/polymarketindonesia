import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

interface KycDocumentType {
  id: string;
  type: string;
  status: string;
}

// PATCH /api/kyc/[id] - Approve/reject KYC document (admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, rejectedReason, adminId } = body;

    if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    if (status === 'REJECTED' && !rejectedReason) {
      return NextResponse.json(
        { success: false, error: 'Alasan penolakan wajib diisi' },
        { status: 400 }
      );
    }

    const document = await prisma.kycDocument.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Dokumen tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx: typeof prisma) => {
      // Update document
      await tx.kycDocument.update({
        where: { id },
        data: {
          status: status,
          rejectedReason: status === 'REJECTED' ? rejectedReason : null,
          verifiedAt: status === 'VERIFIED' ? new Date() : null,
        },
      });

      // Get all user's documents
      const allDocuments = await tx.kycDocument.findMany({
        where: { userId: document.userId },
      });

      // Determine KYC level based on verified documents
      const verifiedDocs = (allDocuments as KycDocumentType[]).filter((d: KycDocumentType) =>
        d.id === id ? status === 'VERIFIED' : d.status === 'VERIFIED'
      );

      let kycLevel = 0;
      let kycStatus = 'PENDING';

      if (verifiedDocs.length > 0) {
        const hasIdDoc = verifiedDocs.some((d: KycDocumentType) => ['ktp', 'sim', 'passport'].includes(d.type));
        const hasSelfie = verifiedDocs.some((d: KycDocumentType) => d.type === 'selfie');
        const hasNpwp = verifiedDocs.some((d: KycDocumentType) => d.type === 'npwp');

        if (hasIdDoc) kycLevel = 1;
        if (hasIdDoc && hasSelfie) kycLevel = 2;
        if (hasIdDoc && hasSelfie && hasNpwp) kycLevel = 3;

        kycStatus = kycLevel > 0 ? 'VERIFIED' : 'PENDING';
      } else if (status === 'REJECTED') {
        const pendingDocs = (allDocuments as KycDocumentType[]).filter((d: KycDocumentType) => d.status === 'PENDING' && d.id !== id);
        kycStatus = pendingDocs.length > 0 ? 'PENDING' : 'REJECTED';
      }

      // Update user KYC status
      await tx.user.update({
        where: { id: document.userId },
        data: {
          kycStatus,
          kycLevel,
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: document.userId,
          type: status === 'VERIFIED' ? 'KYC_APPROVED' : 'KYC_REJECTED',
          title: status === 'VERIFIED' ? 'KYC Disetujui' : 'KYC Ditolak',
          message: status === 'VERIFIED'
            ? `Dokumen ${document.type.toUpperCase()} Anda telah diverifikasi. Level KYC Anda sekarang: ${kycLevel}`
            : `Dokumen ${document.type.toUpperCase()} ditolak. Alasan: ${rejectedReason}`,
          link: '/profile?tab=kyc',
        },
      });

      // Log admin action
      if (adminId) {
        await tx.adminLog.create({
          data: {
            adminId,
            action: status === 'VERIFIED' ? 'APPROVE_KYC' : 'REJECT_KYC',
            target: `kyc:${id}`,
            details: {
              userId: document.userId,
              documentType: document.type,
              rejectedReason,
            },
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: status === 'VERIFIED' ? 'KYC berhasil diverifikasi' : 'KYC ditolak',
    });
  } catch (error) {
    console.error('Error updating KYC:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate KYC' },
      { status: 500 }
    );
  }
}
