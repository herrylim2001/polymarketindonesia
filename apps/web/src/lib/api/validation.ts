import { z } from 'zod';

// ============================================================
// COMMON SCHEMAS
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const idSchema = z.string().cuid();

export const amountSchema = z.coerce.number()
  .min(10000, 'Minimum Rp 10.000')
  .max(100000000, 'Maximum Rp 100.000.000');

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
});

// ============================================================
// MARKET SCHEMAS
// ============================================================

export const createMarketSchema = z.object({
  title: z.string()
    .min(10, 'Judul minimal 10 karakter')
    .max(200, 'Judul maksimal 200 karakter'),
  description: z.string()
    .min(20, 'Deskripsi minimal 20 karakter')
    .max(5000, 'Deskripsi maksimal 5000 karakter'),
  category: z.enum([
    'POLITIK', 'EKONOMI', 'OLAHRAGA', 'HIBURAN',
    'TEKNOLOGI', 'SOSIAL', 'HUKUM', 'INTERNASIONAL'
  ]),
  endDate: z.coerce.date().refine(
    date => date > new Date(),
    'Tanggal berakhir harus di masa depan'
  ),
  resolutionSource: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  outcomes: z.array(z.object({
    label: z.string().min(1).max(100),
    probability: z.number().min(1).max(99),
  })).min(2, 'Minimal 2 outcome').max(10, 'Maksimal 10 outcome'),
  initialLiquidity: amountSchema.optional().default(1000000),
});

export const updateMarketSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  category: z.enum([
    'POLITIK', 'EKONOMI', 'OLAHRAGA', 'HIBURAN',
    'TEKNOLOGI', 'SOSIAL', 'HUKUM', 'INTERNASIONAL'
  ]).optional(),
  endDate: z.coerce.date().optional(),
  resolutionSource: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
});

export const resolveMarketSchema = z.object({
  winningOutcomeId: z.string().cuid('Outcome ID tidak valid'),
  resolutionDetails: z.string().max(1000).optional(),
});

// ============================================================
// BET SCHEMAS
// ============================================================

export const placeBetSchema = z.object({
  marketId: z.string().cuid('Market ID tidak valid'),
  outcomeId: z.string().cuid('Outcome ID tidak valid'),
  amount: amountSchema,
});

export const cashOutSchema = z.object({
  betId: z.string().cuid('Bet ID tidak valid'),
});

// ============================================================
// TRANSACTION SCHEMAS
// ============================================================

export const depositSchema = z.object({
  amount: amountSchema,
  paymentMethod: z.enum([
    'BANK_TRANSFER', 'EWALLET', 'CRYPTO', 'QRIS'
  ]),
  paymentDetails: z.object({
    bankCode: z.string().optional(),
    ewalletType: z.string().optional(),
    cryptoCurrency: z.string().optional(),
    cryptoNetwork: z.string().optional(),
  }).optional(),
});

export const withdrawalSchema = z.object({
  amount: amountSchema,
  paymentMethod: z.enum([
    'BANK_TRANSFER', 'EWALLET', 'CRYPTO'
  ]),
  paymentDetails: z.object({
    bankCode: z.string().optional(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    ewalletType: z.string().optional(),
    ewalletNumber: z.string().optional(),
    cryptoCurrency: z.string().optional(),
    cryptoNetwork: z.string().optional(),
    walletAddress: z.string().optional(),
  }),
});

// ============================================================
// KYC SCHEMAS
// ============================================================

export const submitKycSchema = z.object({
  documentType: z.enum(['KTP', 'SIM', 'PASSPORT', 'SELFIE', 'NPWP']),
  documentUrl: z.string().url('URL dokumen tidak valid'),
  documentNumber: z.string().min(1).max(50).optional(),
  fullName: z.string().min(3).max(100).optional(),
  dateOfBirth: z.coerce.date().optional(),
  address: z.string().max(500).optional(),
});

export const reviewKycSchema = z.object({
  documentId: z.string().cuid('Document ID tidak valid'),
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
  verifiedData: z.record(z.unknown()).optional(),
});

export const bulkKycReviewSchema = z.object({
  documentIds: z.array(z.string().cuid()).min(1).max(50),
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
});

// ============================================================
// USER SCHEMAS
// ============================================================

export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore')
    .optional(),
  avatar: z.string().url().optional(),
  phone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Nomor telepon tidak valid')
    .optional(),
});

export const adminUserActionSchema = z.object({
  userId: z.string().cuid('User ID tidak valid'),
  action: z.enum(['ban', 'unban', 'makeAdmin', 'removeAdmin']),
  banReason: z.string().max(500).optional(),
});

// ============================================================
// COMMENT SCHEMAS
// ============================================================

export const createCommentSchema = z.object({
  marketId: z.string().cuid('Market ID tidak valid'),
  content: z.string()
    .min(1, 'Komentar tidak boleh kosong')
    .max(1000, 'Komentar maksimal 1000 karakter'),
  parentId: z.string().cuid().optional(),
});

export const moderateCommentSchema = z.object({
  commentId: z.string().cuid('Comment ID tidak valid'),
  action: z.enum(['approve', 'reject', 'delete', 'hide']),
  reason: z.string().max(500).optional(),
});

// ============================================================
// BOOKMARK SCHEMAS
// ============================================================

export const toggleBookmarkSchema = z.object({
  marketId: z.string().cuid('Market ID tidak valid'),
});

// ============================================================
// NOTIFICATION SCHEMAS
// ============================================================

export const markNotificationReadSchema = z.object({
  notificationIds: z.array(z.string().cuid()).min(1).max(100),
});

// ============================================================
// WEBHOOK SCHEMAS
// ============================================================

export const uniwireWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    txHash: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  timestamp: z.string().or(z.number()),
  signature: z.string().optional(),
});

// ============================================================
// VALIDATION HELPER
// ============================================================

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const error of result.error.errors) {
    const path = error.path.join('.') || '_root';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(error.message);
  }

  return { success: false, errors };
}

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMarketInput = z.infer<typeof createMarketSchema>;
export type UpdateMarketInput = z.infer<typeof updateMarketSchema>;
export type PlaceBetInput = z.infer<typeof placeBetSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type SubmitKycInput = z.infer<typeof submitKycSchema>;
export type ReviewKycInput = z.infer<typeof reviewKycSchema>;
