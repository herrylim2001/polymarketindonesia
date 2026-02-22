import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import crypto from 'crypto';

// ============================================================
// EMAIL CONFIGURATION
// ============================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@polymarket.id';
const APP_NAME = 'Polymarket Indonesia';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// ============================================================
// EMAIL TEMPLATES
// ============================================================

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .button { display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background-color: #1d4ed8; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
    .code { background-color: #f3f4f6; padding: 15px 25px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block; margin: 15px 0; }
    .info-box { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; }
    .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 ${APP_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================
// PASSWORD RESET
// ============================================================

export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store token in user record (or separate table)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Using JSON field for reset token data
      metadata: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt.toISOString(),
      },
    },
  });

  return token;
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  const content = `
    <h2>Reset Password</h2>
    <p>Halo,</p>
    <p>Kami menerima permintaan untuk mereset password akun Anda di ${APP_NAME}.</p>
    <p>Klik tombol di bawah ini untuk membuat password baru:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <div class="warning-box">
      <strong>⚠️ Penting:</strong>
      <ul style="margin: 5px 0; padding-left: 20px;">
        <li>Link ini hanya berlaku selama 1 jam</li>
        <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
        <li>Jangan bagikan link ini kepada siapa pun</li>
      </ul>
    </div>
    <p>Atau copy link berikut ke browser Anda:</p>
    <p style="word-break: break-all; color: #6b7280; font-size: 12px;">${resetUrl}</p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Reset Password - ${APP_NAME}`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// ============================================================
// KYC NOTIFICATIONS
// ============================================================

export async function sendKycApprovedEmail(email: string, username: string, kycLevel: number): Promise<boolean> {
  const limits = {
    1: 'Rp 10.000.000/hari',
    2: 'Rp 50.000.000/hari',
    3: 'Unlimited',
  };

  const content = `
    <h2>KYC Anda Telah Diverifikasi! 🎉</h2>
    <p>Halo ${username},</p>
    <p>Selamat! Dokumen KYC Anda telah berhasil diverifikasi.</p>
    <div class="success-box">
      <strong>Level KYC Anda: ${kycLevel}</strong>
      <p style="margin: 5px 0;">Limit penarikan: ${limits[kycLevel as keyof typeof limits] || 'N/A'}</p>
    </div>
    <p>Sekarang Anda dapat:</p>
    <ul>
      <li>Melakukan withdrawal ke rekening bank Anda</li>
      <li>Mengakses fitur trading premium</li>
      <li>Mengikuti market dengan volume tinggi</li>
    </ul>
    <p style="text-align: center;">
      <a href="${APP_URL}/markets" class="button">Mulai Trading</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `KYC Disetujui - ${APP_NAME}`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending KYC approved email:', error);
    return false;
  }
}

export async function sendKycRejectedEmail(email: string, username: string, reason: string): Promise<boolean> {
  const content = `
    <h2>Dokumen KYC Ditolak</h2>
    <p>Halo ${username},</p>
    <p>Mohon maaf, dokumen KYC yang Anda ajukan tidak dapat kami verifikasi.</p>
    <div class="warning-box">
      <strong>Alasan penolakan:</strong>
      <p style="margin: 5px 0;">${reason}</p>
    </div>
    <p>Langkah selanjutnya:</p>
    <ol>
      <li>Pastikan dokumen yang diupload jelas dan tidak blur</li>
      <li>Pastikan informasi pada dokumen sesuai dengan data yang dimasukkan</li>
      <li>Gunakan dokumen yang masih berlaku (tidak kadaluarsa)</li>
    </ol>
    <p style="text-align: center;">
      <a href="${APP_URL}/profile?tab=kyc" class="button">Upload Ulang</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `KYC Ditolak - ${APP_NAME}`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending KYC rejected email:', error);
    return false;
  }
}

// ============================================================
// TRANSACTION NOTIFICATIONS
// ============================================================

export async function sendDepositConfirmationEmail(
  email: string,
  username: string,
  amount: number,
  method: string
): Promise<boolean> {
  const content = `
    <h2>Deposit Berhasil! 💰</h2>
    <p>Halo ${username},</p>
    <p>Deposit Anda telah berhasil dikonfirmasi.</p>
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0;">Jumlah:</td>
          <td style="padding: 5px 0; text-align: right; font-weight: bold;">Rp ${amount.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Metode:</td>
          <td style="padding: 5px 0; text-align: right;">${method}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Waktu:</td>
          <td style="padding: 5px 0; text-align: right;">${new Date().toLocaleString('id-ID')}</td>
        </tr>
      </table>
    </div>
    <p>Saldo Anda telah diperbarui dan siap digunakan untuk trading.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/markets" class="button">Mulai Trading</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Deposit Berhasil - Rp ${amount.toLocaleString('id-ID')}`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending deposit confirmation email:', error);
    return false;
  }
}

export async function sendWithdrawalConfirmationEmail(
  email: string,
  username: string,
  amount: number,
  fee: number,
  method: string,
  destination: string
): Promise<boolean> {
  const content = `
    <h2>Withdrawal Berhasil! 💸</h2>
    <p>Halo ${username},</p>
    <p>Permintaan withdrawal Anda telah berhasil diproses.</p>
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0;">Jumlah:</td>
          <td style="padding: 5px 0; text-align: right; font-weight: bold;">Rp ${amount.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Biaya:</td>
          <td style="padding: 5px 0; text-align: right;">Rp ${fee.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Total Diterima:</td>
          <td style="padding: 5px 0; text-align: right; font-weight: bold;">Rp ${(amount - fee).toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Tujuan:</td>
          <td style="padding: 5px 0; text-align: right;">${method} - ${destination}</td>
        </tr>
      </table>
    </div>
    <p>Dana akan masuk ke rekening tujuan dalam 1-3 hari kerja.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Withdrawal Berhasil - Rp ${amount.toLocaleString('id-ID')}`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending withdrawal confirmation email:', error);
    return false;
  }
}

// ============================================================
// BET NOTIFICATIONS
// ============================================================

export async function sendBetWonEmail(
  email: string,
  username: string,
  marketTitle: string,
  betAmount: number,
  payout: number
): Promise<boolean> {
  const profit = payout - betAmount;

  const content = `
    <h2>Selamat, Anda Menang! 🎉</h2>
    <p>Halo ${username},</p>
    <p>Prediksi Anda pada market berikut telah terbukti benar!</p>
    <div class="success-box">
      <strong>${marketTitle}</strong>
    </div>
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0;">Taruhan Awal:</td>
          <td style="padding: 5px 0; text-align: right;">Rp ${betAmount.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Profit:</td>
          <td style="padding: 5px 0; text-align: right; color: #10b981; font-weight: bold;">+Rp ${profit.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Total Diterima:</td>
          <td style="padding: 5px 0; text-align: right; font-weight: bold;">Rp ${payout.toLocaleString('id-ID')}</td>
        </tr>
      </table>
    </div>
    <p>Saldo Anda telah diperbarui. Terus tingkatkan prediksi Anda!</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/markets" class="button">Cari Market Lain</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `🎉 Anda Menang! +Rp ${profit.toLocaleString('id-ID')}`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending bet won email:', error);
    return false;
  }
}

export async function sendBetLostEmail(
  email: string,
  username: string,
  marketTitle: string,
  betAmount: number
): Promise<boolean> {
  const content = `
    <h2>Hasil Market</h2>
    <p>Halo ${username},</p>
    <p>Market berikut telah selesai dan sayangnya prediksi Anda tidak tepat:</p>
    <div class="warning-box">
      <strong>${marketTitle}</strong>
    </div>
    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0;">Taruhan:</td>
          <td style="padding: 5px 0; text-align: right;">Rp ${betAmount.toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Hasil:</td>
          <td style="padding: 5px 0; text-align: right; color: #ef4444;">Kalah</td>
        </tr>
      </table>
    </div>
    <p>Jangan menyerah! Analisis market dengan lebih baik dan coba lagi.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/markets" class="button">Lihat Market Lain</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Hasil Market - ${marketTitle.substring(0, 30)}...`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending bet lost email:', error);
    return false;
  }
}

// ============================================================
// WELCOME EMAIL
// ============================================================

export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  const content = `
    <h2>Selamat Datang di ${APP_NAME}! 🎯</h2>
    <p>Halo ${username},</p>
    <p>Terima kasih telah bergabung dengan ${APP_NAME} - platform prediksi market terpercaya di Indonesia!</p>
    <div class="info-box">
      <strong>Langkah selanjutnya:</strong>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>Lengkapi verifikasi KYC untuk mengaktifkan fitur withdrawal</li>
        <li>Deposit saldo untuk mulai trading</li>
        <li>Jelajahi market dan mulai prediksi!</li>
      </ol>
    </div>
    <p>Punya pertanyaan? Hubungi tim support kami di support@polymarket.id</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/markets" class="button">Jelajahi Market</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Selamat Datang di ${APP_NAME}! 🎯`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// ============================================================
// MARKET RESOLUTION NOTIFICATION
// ============================================================

export async function sendMarketResolvedEmail(
  email: string,
  username: string,
  marketTitle: string,
  winningOutcome: string
): Promise<boolean> {
  const content = `
    <h2>Market Telah Selesai 📊</h2>
    <p>Halo ${username},</p>
    <p>Market yang Anda ikuti telah selesai dan hasilnya telah diumumkan:</p>
    <div class="info-box">
      <strong>${marketTitle}</strong>
      <p style="margin: 10px 0;">Hasil: <strong>${winningOutcome}</strong></p>
    </div>
    <p>Cek portfolio Anda untuk melihat hasil taruhan.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/portfolio" class="button">Lihat Portfolio</a>
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Market Selesai - ${marketTitle.substring(0, 40)}...`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Error sending market resolved email:', error);
    return false;
  }
}
