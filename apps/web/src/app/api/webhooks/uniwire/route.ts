import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendDepositConfirmationEmail } from '@/lib/email';

// Webhook secret for verifying signatures
const WEBHOOK_SECRET = process.env.UNIWIRE_WEBHOOK_SECRET || '';

interface UniwireWebhookPayload {
  event: 'payment.confirmed' | 'payment.pending' | 'payment.expired' | 'payment.failed';
  data: {
    invoiceId: string;
    externalId?: string;
    status: string;
    amount: number;
    amountCrypto: number;
    currency: string;
    cryptoKind: string;
    txHash?: string;
    confirmations?: number;
    paidAt?: string;
    metadata?: Record<string, unknown>;
  };
  timestamp: number;
  signature?: string;
}

/**
 * Verify webhook signature from Uniwire
 */
function verifySignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('UNIWIRE_WEBHOOK_SECRET not set, skipping signature verification');
    return true; // Allow in development
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// POST /api/webhooks/uniwire - Handle Uniwire payment callbacks
export async function POST(request: NextRequest) {
  try {
    const rawPayload = await request.text();
    const signature = request.headers.get('x-uniwire-signature') || '';

    // Verify signature in production
    if (process.env.NODE_ENV === 'production' && !verifySignature(rawPayload, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: UniwireWebhookPayload = JSON.parse(rawPayload);
    const { event, data } = payload;

    console.log(`Received Uniwire webhook: ${event}`, data);

    // Find the transaction by external ID or invoice ID
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { externalId: data.invoiceId },
          { externalId: data.externalId },
        ],
        type: 'DEPOSIT',
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!transaction) {
      console.warn(`Transaction not found for invoice: ${data.invoiceId}`);
      // Return 200 to prevent retries for unknown transactions
      return NextResponse.json({ received: true, status: 'transaction_not_found' });
    }

    switch (event) {
      case 'payment.confirmed': {
        // Payment has been confirmed on blockchain
        await prisma.$transaction(async (tx: typeof prisma) => {
          // Update transaction status
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
              metadata: {
                txHash: data.txHash,
                confirmations: data.confirmations,
                cryptoAmount: data.amountCrypto,
                cryptoKind: data.cryptoKind,
              },
            },
          });

          // Add balance to user
          await tx.user.update({
            where: { id: transaction.userId },
            data: {
              balance: { increment: transaction.amount },
            },
          });

          // Create notification
          await tx.notification.create({
            data: {
              userId: transaction.userId,
              type: 'DEPOSIT_COMPLETED',
              title: 'Deposit Berhasil',
              message: `Deposit Rp ${Number(transaction.amount).toLocaleString('id-ID')} via ${data.currency} telah dikonfirmasi.`,
              link: '/transactions',
            },
          });
        });

        // Send email notification
        if (transaction.user.email) {
          await sendDepositConfirmationEmail(
            transaction.user.email,
            transaction.user.username,
            Number(transaction.amount),
            `Crypto (${data.currency})`
          );
        }

        console.log(`Payment confirmed for transaction ${transaction.id}`);
        break;
      }

      case 'payment.pending': {
        // Payment detected but waiting for confirmations
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'PROCESSING',
            metadata: {
              txHash: data.txHash,
              confirmations: data.confirmations || 0,
              cryptoAmount: data.amountCrypto,
            },
          },
        });

        console.log(`Payment pending for transaction ${transaction.id}`);
        break;
      }

      case 'payment.expired': {
        // Invoice expired without payment
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'EXPIRED',
            metadata: {
              expiredAt: new Date().toISOString(),
            },
          },
        });

        // Notify user
        await prisma.notification.create({
          data: {
            userId: transaction.userId,
            type: 'SYSTEM',
            title: 'Deposit Expired',
            message: `Invoice deposit Rp ${Number(transaction.amount).toLocaleString('id-ID')} telah kadaluarsa. Silakan buat deposit baru.`,
            link: '/deposit',
          },
        });

        console.log(`Payment expired for transaction ${transaction.id}`);
        break;
      }

      case 'payment.failed': {
        // Payment failed
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            metadata: {
              failedAt: new Date().toISOString(),
              reason: 'Payment failed on blockchain',
            },
          },
        });

        console.log(`Payment failed for transaction ${transaction.id}`);
        break;
      }

      default:
        console.warn(`Unknown webhook event: ${event}`);
    }

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error) {
    console.error('Error processing Uniwire webhook:', error);
    // Return 500 to trigger retry
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification (some providers require this)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');

  if (challenge) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ status: 'Webhook endpoint active' });
}
