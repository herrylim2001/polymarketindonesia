import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import {
  withRateLimit,
  successResponse,
  errorResponse,
  validationErrorResponse,
  RATE_LIMITS,
} from '@/lib/api/middleware';
import {
  validateSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from '@/lib/api/validation';
import { generatePasswordResetToken, sendPasswordResetEmail } from '@/lib/email';

// POST /api/auth/password-reset - Request password reset
export const POST = withRateLimit(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = validateSchema(passwordResetRequestSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { email } = validation.data;

    // Generate token (returns null if user not found, but we don't reveal that)
    const token = await generatePasswordResetToken(email);

    // Send email only if user exists
    if (token) {
      await sendPasswordResetEmail(email, token);
    }

    // Always return success to prevent email enumeration
    return successResponse({
      message: 'Jika email terdaftar, link reset password akan dikirim ke email Anda',
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return errorResponse('Gagal memproses permintaan', 500);
  }
}, RATE_LIMITS.auth);

// PUT /api/auth/password-reset - Reset password with token
export const PUT = withRateLimit(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = validateSchema(passwordResetSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors);
    }

    const { token, password } = validation.data;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    // We're using a raw query because metadata is a JSON field
    const users = await prisma.user.findMany({
      where: {
        metadata: {
          path: ['passwordResetToken'],
          equals: hashedToken,
        },
      },
    });

    if (users.length === 0) {
      return errorResponse('Token tidak valid atau sudah kadaluarsa', 400);
    }

    const user = users[0];

    // Check if metadata exists and has the required fields
    const metadata = user.metadata as Record<string, unknown> | null;
    if (!metadata || !metadata.passwordResetExpires) {
      return errorResponse('Token tidak valid', 400);
    }

    // Check expiration
    const expiresAt = new Date(metadata.passwordResetExpires as string);
    if (expiresAt < new Date()) {
      return errorResponse('Token sudah kadaluarsa. Silakan minta reset password baru.', 400);
    }

    // Hash new password
    const passwordHash = await hash(password, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        metadata: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM',
        title: 'Password Berhasil Diubah',
        message: 'Password akun Anda telah berhasil diubah. Jika ini bukan Anda, segera hubungi support.',
        link: '/profile',
      },
    });

    return successResponse({
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return errorResponse('Gagal mereset password', 500);
  }
}, RATE_LIMITS.auth);
