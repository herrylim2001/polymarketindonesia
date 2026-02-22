import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ============================================================
// TYPES
// ============================================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  kycStatus: string;
  kycLevel: number;
  balance: number;
  isBanned: boolean;
}

export interface ApiContext {
  user?: AuthenticatedUser;
  request: NextRequest;
}

export type ApiHandler<T = unknown> = (
  context: ApiContext
) => Promise<NextResponse<T>>;

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// ============================================================
// RATE LIMITING (In-memory, untuk production gunakan Redis)
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }

  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return { allowed, remaining, resetAt: entry.resetAt };
}

// Rate limit configs per endpoint type
export const RATE_LIMITS = {
  // Auth endpoints - lebih ketat
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 per 15 menit

  // Public read endpoints
  public: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per menit

  // Authenticated user actions
  user: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 per menit

  // Write operations (bet, transaction)
  write: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per menit

  // Admin operations
  admin: { windowMs: 60 * 1000, maxRequests: 120 }, // 120 per menit

  // Sensitive operations (withdrawal, KYC)
  sensitive: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 per jam
} as const;

// ============================================================
// ERROR RESPONSES
// ============================================================

export function errorResponse(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: code || 'ERROR',
    },
    { status }
  );
}

export function unauthorizedResponse(message = 'Anda harus login terlebih dahulu'): NextResponse {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

export function forbiddenResponse(message = 'Anda tidak memiliki akses'): NextResponse {
  return errorResponse(message, 403, 'FORBIDDEN');
}

export function notFoundResponse(message = 'Data tidak ditemukan'): NextResponse {
  return errorResponse(message, 404, 'NOT_FOUND');
}

export function rateLimitResponse(resetAt: number): NextResponse {
  const resetDate = new Date(resetAt);
  return NextResponse.json(
    {
      success: false,
      error: 'Terlalu banyak permintaan. Coba lagi nanti.',
      code: 'RATE_LIMITED',
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': resetDate.toISOString(),
      },
    }
  );
}

export function validationErrorResponse(errors: Record<string, string[]>): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Validasi gagal',
      code: 'VALIDATION_ERROR',
      errors,
    },
    { status: 400 }
  );
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        kycStatus: true,
        kycLevel: true,
        balance: true,
        isBanned: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      kycStatus: user.kycStatus,
      kycLevel: user.kycLevel,
      balance: Number(user.balance),
      isBanned: user.isBanned,
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

// ============================================================
// MIDDLEWARE WRAPPERS
// ============================================================

/**
 * Middleware untuk endpoint yang membutuhkan autentikasi
 */
export function withAuth(
  handler: ApiHandler,
  options?: {
    rateLimit?: RateLimitConfig;
    requireAdmin?: boolean;
    requireKyc?: boolean;
    kycLevel?: number;
  }
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      // Get authenticated user
      const user = await getAuthenticatedUser(request);

      if (!user) {
        return unauthorizedResponse();
      }

      // Check if banned
      if (user.isBanned) {
        return forbiddenResponse('Akun Anda telah diblokir');
      }

      // Check admin requirement
      if (options?.requireAdmin && !user.isAdmin) {
        return forbiddenResponse('Hanya admin yang dapat mengakses');
      }

      // Check KYC requirement
      if (options?.requireKyc && user.kycStatus !== 'VERIFIED') {
        return forbiddenResponse('Anda harus menyelesaikan verifikasi KYC terlebih dahulu');
      }

      // Check KYC level
      if (options?.kycLevel && user.kycLevel < options.kycLevel) {
        return forbiddenResponse(`Diperlukan KYC level ${options.kycLevel}`);
      }

      // Check rate limit
      if (options?.rateLimit) {
        const identifier = `user:${user.id}:${request.nextUrl.pathname}`;
        const result = checkRateLimit(identifier, options.rateLimit);

        if (!result.allowed) {
          return rateLimitResponse(result.resetAt);
        }
      }

      // Call handler
      return handler({ user, request });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return errorResponse('Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
  };
}

/**
 * Middleware untuk endpoint public dengan rate limiting
 */
export function withRateLimit(
  handler: ApiHandler,
  config: RateLimitConfig = RATE_LIMITS.public
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      // Get identifier (IP or user)
      const user = await getAuthenticatedUser(request);
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                 request.headers.get('x-real-ip') ||
                 'unknown';
      const identifier = user ? `user:${user.id}` : `ip:${ip}`;
      const key = `${identifier}:${request.nextUrl.pathname}`;

      const result = checkRateLimit(key, config);

      if (!result.allowed) {
        return rateLimitResponse(result.resetAt);
      }

      return handler({ user: user || undefined, request });
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return errorResponse('Terjadi kesalahan server', 500, 'INTERNAL_ERROR');
    }
  };
}

/**
 * Middleware khusus untuk admin
 */
export function withAdmin(
  handler: ApiHandler,
  rateLimit: RateLimitConfig = RATE_LIMITS.admin
): (request: NextRequest) => Promise<NextResponse> {
  return withAuth(handler, { requireAdmin: true, rateLimit });
}

/**
 * Middleware untuk operasi sensitif (memerlukan KYC)
 */
export function withKyc(
  handler: ApiHandler,
  options?: { kycLevel?: number; rateLimit?: RateLimitConfig }
): (request: NextRequest) => Promise<NextResponse> {
  return withAuth(handler, {
    requireKyc: true,
    kycLevel: options?.kycLevel,
    rateLimit: options?.rateLimit || RATE_LIMITS.sensitive,
  });
}

// ============================================================
// LOGGING
// ============================================================

export async function logAdminAction(
  adminId: string,
  action: string,
  target: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        target,
        details: details || {},
      },
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

// ============================================================
// REQUEST PARSING
// ============================================================

export async function parseJsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function getSearchParams(request: NextRequest): URLSearchParams {
  return new URL(request.url).searchParams;
}

export function getPaginationParams(request: NextRequest): {
  page: number;
  limit: number;
  skip: number;
} {
  const params = getSearchParams(request);
  const page = Math.max(1, parseInt(params.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20')));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
