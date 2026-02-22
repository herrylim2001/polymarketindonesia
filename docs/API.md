# Polymarket Indonesia API Documentation

> Dokumentasi lengkap untuk semua API endpoint yang tersedia di platform Polymarket Indonesia.

---

## Daftar Isi

1. [Autentikasi](#autentikasi)
2. [Rate Limiting](#rate-limiting)
3. [Response Format](#response-format)
4. [Auth Endpoints](#auth-endpoints)
5. [Markets Endpoints](#markets-endpoints)
6. [Bets Endpoints](#bets-endpoints)
7. [Transactions Endpoints](#transactions-endpoints)
8. [KYC Endpoints](#kyc-endpoints)
9. [Users Endpoints](#users-endpoints)
10. [Notifications Endpoints](#notifications-endpoints)
11. [Bookmarks Endpoints](#bookmarks-endpoints)
12. [Comments Endpoints](#comments-endpoints)
13. [News Endpoints](#news-endpoints)
14. [Real-time (SSE) Endpoints](#real-time-sse-endpoints)
15. [Admin Endpoints](#admin-endpoints)
16. [Webhooks](#webhooks)

---

## Autentikasi

API menggunakan NextAuth.js dengan JWT session. Autentikasi dilakukan melalui cookies yang dikirim otomatis oleh browser.

### Metode Login

1. **Email/Password** - `POST /api/auth/callback/credentials`
2. **Google OAuth** - `GET /api/auth/signin/google`

### Session

Session token disimpan dalam cookie `next-auth.session-token` dan berlaku selama 30 hari.

---

## Rate Limiting

Semua endpoint memiliki rate limiting untuk mencegah abuse:

| Tipe Endpoint | Limit | Window |
|---------------|-------|--------|
| Auth | 10 requests | 15 menit |
| Public Read | 100 requests | 1 menit |
| Authenticated | 60 requests | 1 menit |
| Write Operations | 30 requests | 1 menit |
| Admin | 120 requests | 1 menit |
| Sensitive (Withdrawal) | 10 requests | 1 jam |

Header response untuk rate limit:
```
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T00:01:00Z
Retry-After: 60
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Pesan error",
  "code": "ERROR_CODE"
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": "Validasi gagal",
  "code": "VALIDATION_ERROR",
  "errors": {
    "fieldName": ["Error message 1", "Error message 2"]
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Auth Endpoints

### Request Password Reset

```http
POST /api/auth/password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Jika email terdaftar, link reset password akan dikirim ke email Anda"
  }
}
```

### Reset Password with Token

```http
PUT /api/auth/password-reset
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "NewPassword123"
}
```

---

## Markets Endpoints

### List Markets

```http
GET /api/markets?category=POLITIK&status=ACTIVE&page=1&limit=20
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category (POLITIK, EKONOMI, etc.) |
| status | string | Filter by status (ACTIVE, RESOLVED, CANCELLED) |
| featured | boolean | Filter featured markets |
| trending | boolean | Filter trending markets |
| search | string | Search by title/description |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

### Get Market Details

```http
GET /api/markets/{id}
```

### Create Market (Admin)

```http
POST /api/markets
Content-Type: application/json

{
  "title": "Apakah Timnas Indonesia akan lolos Piala Dunia 2026?",
  "description": "Market ini akan resolve berdasarkan hasil kualifikasi...",
  "category": "OLAHRAGA",
  "endDate": "2026-06-01T00:00:00Z",
  "resolutionSource": "FIFA Official",
  "outcomes": [
    { "label": "Ya", "probability": 35 },
    { "label": "Tidak", "probability": 65 }
  ],
  "initialLiquidity": 1000000
}
```

### Update Market (Admin)

```http
PATCH /api/admin/markets/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "isFeatured": true,
  "status": "PAUSED"
}
```

### Resolve Market (Admin)

```http
POST /api/admin/markets/{id}
Content-Type: application/json

{
  "winningOutcomeId": "outcome_cuid",
  "resolutionDetails": "Berdasarkan hasil resmi FIFA..."
}
```

### Cancel Market with Refunds (Admin)

```http
DELETE /api/admin/markets/{id}
```

---

## Bets Endpoints

### List User's Bets

```http
GET /api/bets?userId={userId}&status=ACTIVE&page=1
```

### Place Bet

```http
POST /api/bets
Content-Type: application/json

{
  "marketId": "market_cuid",
  "outcomeId": "outcome_cuid",
  "amount": 100000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "bet_cuid",
    "amount": 100000,
    "shares": 285.71,
    "probability": 35,
    "avgPrice": 0.35,
    "potentialPayout": 285714,
    "status": "ACTIVE"
  }
}
```

### Get Cash-out Quote

```http
POST /api/bets/cashout
Content-Type: application/json

{
  "betId": "bet_cuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "betId": "bet_cuid",
    "originalAmount": 100000,
    "shares": 285.71,
    "originalProbability": 35,
    "currentProbability": 45,
    "cashOutValue": 125000,
    "currentPrice": 0.45,
    "profitLoss": 25000,
    "profitLossPercent": 25,
    "fees": 2500
  }
}
```

### Execute Cash-out

```http
PUT /api/bets/cashout
Content-Type: application/json

{
  "betId": "bet_cuid"
}
```

---

## Transactions Endpoints

### List Transactions

```http
GET /api/transactions?userId={userId}&type=DEPOSIT&status=COMPLETED&page=1
```

### Create Deposit

```http
POST /api/transactions
Content-Type: application/json

{
  "type": "DEPOSIT",
  "amount": 500000,
  "paymentMethod": "CRYPTO",
  "paymentDetails": {
    "cryptoCurrency": "usdt_trc20"
  }
}
```

### Create Withdrawal (Requires KYC)

```http
POST /api/transactions
Content-Type: application/json

{
  "type": "WITHDRAWAL",
  "amount": 500000,
  "paymentMethod": "BANK_TRANSFER",
  "paymentDetails": {
    "bankCode": "BCA",
    "accountNumber": "1234567890",
    "accountName": "John Doe"
  }
}
```

---

## KYC Endpoints

### Get KYC Status

```http
GET /api/kyc?userId={userId}
```

### Submit KYC Document

```http
POST /api/kyc
Content-Type: application/json

{
  "userId": "user_cuid",
  "type": "ktp",
  "documentUrl": "https://storage.example.com/ktp.jpg"
}
```

### Review KYC (Admin)

```http
POST /api/admin/kyc
Content-Type: application/json

{
  "documentId": "document_cuid",
  "status": "APPROVED",
  "verifiedData": {
    "name": "John Doe",
    "idNumber": "1234567890"
  }
}
```

### Bulk Review KYC (Admin)

```http
PUT /api/admin/kyc
Content-Type: application/json

{
  "documentIds": ["doc1", "doc2", "doc3"],
  "status": "APPROVED"
}
```

---

## Notifications Endpoints

### List Notifications

```http
GET /api/notifications?unreadOnly=true&page=1
```

### Mark as Read

```http
PATCH /api/notifications
Content-Type: application/json

{
  "notificationIds": ["notif1", "notif2"]
}
```

### Mark All as Read

```http
PATCH /api/notifications
Content-Type: application/json

{
  "markAll": true
}
```

### Delete Notifications

```http
DELETE /api/notifications?id={notificationId}
DELETE /api/notifications?all=true&read=true
```

---

## Bookmarks Endpoints

### List Bookmarks

```http
GET /api/bookmarks?page=1&limit=20
```

### Toggle Bookmark

```http
POST /api/bookmarks
Content-Type: application/json

{
  "marketId": "market_cuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookmarked": true,
    "message": "Market di-bookmark"
  }
}
```

### Remove Bookmark

```http
DELETE /api/bookmarks?marketId={marketId}
```

---

## Comments Endpoints

### List Comments

```http
GET /api/comments?marketId={marketId}&page=1
GET /api/comments?marketId={marketId}&parentId={parentId}
```

### Create Comment

```http
POST /api/comments
Content-Type: application/json

{
  "marketId": "market_cuid",
  "content": "Ini adalah komentar saya",
  "parentId": "parent_comment_cuid"  // Optional, for replies
}
```

### Delete Comment

```http
DELETE /api/comments?id={commentId}
```

### Moderate Comment (Admin)

```http
POST /api/admin/comments
Content-Type: application/json

{
  "commentId": "comment_cuid",
  "action": "hide",  // hide, delete, approve, reject
  "reason": "Melanggar kebijakan"
}
```

---

## News Endpoints

### Get Trending News

```http
GET /api/news?type=trending&limit=10
```

### Get News by Category

```http
GET /api/news?type=category&category=politik&limit=20
```

### Search News

```http
GET /api/news?type=search&q=prabowo&limit=20
```

### Get News for Market

```http
GET /api/news/market/{marketId}
```

---

## Real-time (SSE) Endpoints

### Connect to Real-time Stream

```http
GET /api/realtime
Accept: text/event-stream
```

**Events:**

| Event | Description |
|-------|-------------|
| `connected` | Connection established |
| `initial_data` | Initial state (notifications, balance) |
| `market_update` | Market probability/volume changed |
| `notification` | New notification |
| `bet_update` | Bet status changed |
| `balance_update` | User balance changed |
| `market_resolved` | Market has been resolved |

**JavaScript Example:**
```javascript
const eventSource = new EventSource('/api/realtime');

eventSource.addEventListener('market_update', (e) => {
  const data = JSON.parse(e.data);
  console.log('Market updated:', data);
});

eventSource.addEventListener('notification', (e) => {
  const data = JSON.parse(e.data);
  showNotification(data);
});
```

---

## Admin Endpoints

### Analytics Dashboard

```http
GET /api/admin/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1500,
    "totalMarkets": 50,
    "totalVolume": 500000000,
    "activeMarkets": 25,
    "pendingKyc": 12,
    "todayVolume": 5000000,
    "recentTransactions": [...],
    "categoryDistribution": {...}
  }
}
```

### User Management

```http
GET /api/admin/users?search=john&kycStatus=PENDING&page=1
```

### Ban/Unban User

```http
PATCH /api/admin/users
Content-Type: application/json

{
  "userId": "user_cuid",
  "action": "ban",
  "banReason": "Melanggar ToS"
}
```

---

## Webhooks

### Uniwire Payment Webhook

```http
POST /api/webhooks/uniwire
Content-Type: application/json
X-Uniwire-Signature: sha256_hmac_signature

{
  "event": "payment.confirmed",
  "data": {
    "invoiceId": "INV123",
    "status": "paid",
    "amount": 500000,
    "amountCrypto": 31.25,
    "currency": "USDT",
    "txHash": "0x...",
    "confirmations": 6
  },
  "timestamp": 1704067200
}
```

**Events:**
- `payment.confirmed` - Payment confirmed on blockchain
- `payment.pending` - Payment detected, waiting confirmations
- `payment.expired` - Invoice expired
- `payment.failed` - Payment failed

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Categories

```
POLITIK | EKONOMI | OLAHRAGA | HIBURAN | TEKNOLOGI | SOSIAL | HUKUM | INTERNASIONAL
```

## Market Status

```
PENDING | ACTIVE | PAUSED | RESOLVED | CANCELLED | DISPUTED
```

## Bet Status

```
ACTIVE | WON | LOST | REFUNDED | CASHED_OUT
```

## Transaction Types

```
DEPOSIT | WITHDRAWAL | BET_PLACED | BET_WON | REFERRAL_BONUS | REFUND
```

## KYC Status

```
NONE | PENDING | VERIFIED | REJECTED
```

---

*Dokumentasi ini dibuat untuk Polymarket Indonesia Platform v1.0*
