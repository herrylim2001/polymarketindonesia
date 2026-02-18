import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/kyc - Get user's KYC status and documents
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        kycStatus: true,
        kycLevel: true,
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
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
  } catch (error) {
    console.error('Error fetching KYC:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data KYC' },
      { status: 500 }
    );
  }
}

// POST /api/kyc - Submit KYC document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, documentUrl } = body;

    if (!userId || !type || !documentUrl) {
      return NextResponse.json(
        { success: false, error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Valid document types
    const validTypes = ['ktp', 'sim', 'passport', 'selfie', 'npwp'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Tipe dokumen tidak valid' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check for existing pending document of same type
    const existingDoc = await prisma.kycDocument.findFirst({
      where: {
        userId,
        type,
        status: 'PENDING',
      },
    });

    if (existingDoc) {
      return NextResponse.json(
        { success: false, error: 'Dokumen dengan tipe yang sama sedang dalam review' },
        { status: 400 }
      );
    }

    // Create KYC document
    const document = await prisma.kycDocument.create({
      data: {
        userId,
        type,
        documentUrl,
        status: 'PENDING',
      },
    });

    // Update user KYC status to pending
    if (user.kycStatus === 'NONE' || user.kycStatus === 'REJECTED') {
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: 'PENDING' },
      });
    }

    return NextResponse.json({
      success: true,
      data: document,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengajukan KYC' },
      { status: 500 }
    );
  }
}
