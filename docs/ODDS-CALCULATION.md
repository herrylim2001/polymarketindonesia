# Panduan Perhitungan Odds — Polymarket Indonesia

> Dokumen ini menjelaskan sistem perhitungan odds yang digunakan pada platform Polymarket Indonesia,
> mulai dari konsep dasar probabilitas hingga mekanisme Automated Market Maker (AMM).

---

## Daftar Isi

1. [Apa Itu Prediction Market?](#1-apa-itu-prediction-market)
2. [Konsep Probabilitas](#2-konsep-probabilitas)
3. [Harga Share & Koneksi ke Probabilitas](#3-harga-share--koneksi-ke-probabilitas)
4. [Format Odds yang Didukung](#4-format-odds-yang-didukung)
   - [Odds Desimal](#41-odds-desimal)
   - [Odds Indonesia](#42-odds-indonesia)
   - [Odds Hong Kong](#43-odds-hong-kong)
   - [Odds Malay](#44-odds-malay)
   - [Odds Amerika](#45-odds-amerika)
   - [Odds Fraksional](#46-odds-fraksional)
5. [Tabel Perbandingan Format Odds](#5-tabel-perbandingan-format-odds)
6. [Cara Menghitung Payout](#6-cara-menghitung-payout)
7. [Constant Product Market Maker (CPMM)](#7-constant-product-market-maker-cpmm)
8. [Dampak Taruhan terhadap Probabilitas](#8-dampak-taruhan-terhadap-probabilitas)
9. [Contoh Lengkap Step-by-Step](#9-contoh-lengkap-step-by-step)
10. [Ringkasan Formula](#10-ringkasan-formula)

---

## 1. Apa Itu Prediction Market?

Prediction market adalah pasar di mana orang membeli dan menjual **shares** (saham) atas suatu kejadian di masa depan.

```
Pertanyaan: "Apakah Timnas Indonesia akan lolos Piala Dunia 2026?"
  ├── Beli YES → jika yakin akan lolos
  └── Beli NO  → jika yakin tidak akan lolos
```

Setiap share memiliki nilai **Rp 1 jika hasil terbukti benar**, dan **Rp 0 jika salah**. Harga share di pasar mencerminkan probabilitas kolektif pasar.

---

## 2. Konsep Probabilitas

Probabilitas dinyatakan dalam persen (**1% — 99%**).

| Probabilitas | Arti |
|:---:|---|
| **10%** | Kemungkinan terjadi sangat kecil |
| **50%** | Peluang fifty-fifty |
| **75%** | Kemungkinan besar terjadi |
| **90%** | Hampir pasti terjadi |

> Sistem tidak mengizinkan probabilitas 0% atau 100% karena keduanya tidak informatif dan menyebabkan odds tak terhingga.

---

## 3. Harga Share & Koneksi ke Probabilitas

```
Harga per Share = Probabilitas / 100
```

**Contoh:**
- Probabilitas YES = **60%** → Harga 1 share YES = **Rp 0,60** (per unit)
- Probabilitas NO  = **40%** → Harga 1 share NO  = **Rp 0,40** (per unit)

Ketika investor membeli YES dengan **Rp 100.000** pada probabilitas 60%:

```
Shares diterima = Rp 100.000 / 0,60 = 166,67 shares YES

Jika YES menang:
  Payout = 166,67 × Rp 1 = Rp 166.667
  Profit  = Rp 166.667 - Rp 100.000 = Rp 66.667
```

---

## 4. Format Odds yang Didukung

Odds adalah cara lain untuk menyatakan probabilitas. Platform mendukung **6 format odds**.

---

### 4.1 Odds Desimal

Format paling sederhana dan umum digunakan secara global.

```
Odds Desimal = 1 / Probabilitas
```

**Rumus:**
```
Odds Desimal = 1 / (Probabilitas / 100)
             = 100 / Probabilitas
```

**Contoh:**
| Probabilitas | Odds Desimal | Artinya |
|:---:|:---:|---|
| 50% | **2.00** | Taruhan Rp 100.000 → kembali Rp 200.000 |
| 75% | **1.33** | Taruhan Rp 100.000 → kembali Rp 133.333 |
| 25% | **4.00** | Taruhan Rp 100.000 → kembali Rp 400.000 |

```
Total Kembali = Taruhan × Odds Desimal
Profit        = Taruhan × (Odds Desimal - 1)
```

---

### 4.2 Odds Indonesia

Format yang paling umum digunakan di Indonesia dan Asia Tenggara. Terdapat dua jenis: **positif** (underdog) dan **negatif** (favorit).

**Rumus konversi dari Odds Desimal:**

```
Jika Odds Desimal >= 2.0  →  Odds Indonesia = +(Desimal - 1)    [positif, underdog]
Jika Odds Desimal <  2.0  →  Odds Indonesia = -1 / (Desimal - 1) [negatif, favorit]
```

**Cara Menghitung Profit:**

```
Odds Positif (+):  Profit = Taruhan × Odds Indonesia
Odds Negatif (-):  Profit = Taruhan / |Odds Indonesia|
```

**Contoh Odds Positif (Underdog, probabilitas rendah):**

```
Probabilitas = 40%
Odds Desimal = 100 / 40 = 2.50
Odds Indo    = 2.50 - 1 = +1.50

Taruhan: Rp 100.000 dengan odds +1.50
  Profit = Rp 100.000 × 1.50 = Rp 150.000
  Total kembali = Rp 100.000 + Rp 150.000 = Rp 250.000
```

**Contoh Odds Negatif (Favorit, probabilitas tinggi):**

```
Probabilitas = 75%
Odds Desimal = 100 / 75 = 1.333
Odds Indo    = -1 / (1.333 - 1) = -1 / 0.333 = -3.00

Taruhan: Rp 100.000 dengan odds -3.00
  Profit = Rp 100.000 / 3.00 = Rp 33.333
  Total kembali = Rp 100.000 + Rp 33.333 = Rp 133.333
```

> **Makna Odds Negatif:** Anda harus mempertaruhkan lebih besar untuk mendapat profit lebih kecil,
> karena tim/kejadian tersebut sudah diyakini akan menang oleh pasar.

---

### 4.3 Odds Hong Kong

Serupa dengan Odds Indonesia positif — selalu positif dan menunjukkan profit per unit taruhan.

```
Odds Hong Kong = Odds Desimal - 1
```

**Contoh:**

```
Odds Desimal 2.50 → Odds HK = 2.50 - 1 = 1.50
Taruhan Rp 100.000 → Profit = Rp 100.000 × 1.50 = Rp 150.000
```

> Bedanya dengan Indonesia: Odds HK selalu positif, tidak ada varian negatif.

---

### 4.4 Odds Malay

Kebalikan dari Odds Indonesia. Favorit ditunjukkan dengan positif, underdog dengan negatif.

```
Jika Odds Desimal >= 2.0  →  Odds Malay = -1 / (Desimal - 1)  [negatif, underdog dalam pandangan Malay]
Jika Odds Desimal <  2.0  →  Odds Malay = +(Desimal - 1)       [positif, favorit dalam pandangan Malay]
```

**Contoh:**

```
Probabilitas = 40%, Odds Desimal = 2.50
  Odds Indo  = +1.50  (positif = underdog)
  Odds Malay = -1/(2.50-1) = -0.67  (negatif = sama arti tapi perspektif berbeda)

Probabilitas = 75%, Odds Desimal = 1.333
  Odds Indo  = -3.00  (negatif = favorit)
  Odds Malay = +0.333 (positif = favorit dalam format Malay)
```

---

### 4.5 Odds Amerika (Moneyline)

Populer di Amerika Serikat. Menggunakan basis **100**.

```
Jika Odds Desimal >= 2.0  →  Odds Amerika = +(Desimal - 1) × 100
Jika Odds Desimal <  2.0  →  Odds Amerika = -100 / (Desimal - 1)
```

**Contoh:**

```
Probabilitas = 40% → Desimal = 2.50
  Odds Amerika = +(2.50 - 1) × 100 = +150
  Artinya: taruhan Rp 100 → profit Rp 150

Probabilitas = 75% → Desimal = 1.333
  Odds Amerika = -100 / (1.333 - 1) = -300
  Artinya: harus taruhan Rp 300 untuk profit Rp 100
```

---

### 4.6 Odds Fraksional

Format tradisional dari Inggris (N/D = Numerator/Denominator).

```
Odds Fraksional = (Desimal - 1) sebagai pecahan paling sederhana
```

**Contoh:**

```
Odds Desimal 2.50 → profit per taruhan = 1.50 = 3/2  → Odds Fraksional: 3/2
Odds Desimal 4.00 → profit per taruhan = 3.00 = 3/1  → Odds Fraksional: 3/1
Odds Desimal 1.50 → profit per taruhan = 0.50 = 1/2  → Odds Fraksional: 1/2
```

---

## 5. Tabel Perbandingan Format Odds

| Probabilitas | Desimal | Indonesia | Hong Kong | Malay | Amerika | Fraksional |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **10%** | 10.00 | +9.00 | 9.00 | -0.11 | +900 | 9/1 |
| **25%** | 4.00 | +3.00 | 3.00 | -0.33 | +300 | 3/1 |
| **40%** | 2.50 | +1.50 | 1.50 | -0.67 | +150 | 3/2 |
| **50%** | 2.00 | +1.00 | 1.00 | -1.00 | +100 | 1/1 |
| **60%** | 1.67 | -1.50 | 0.67 | +0.67 | -150 | 2/3 |
| **75%** | 1.33 | -3.00 | 0.33 | +0.33 | -300 | 1/3 |
| **90%** | 1.11 | -9.00 | 0.11 | +0.11 | -900 | 1/9 |

---

## 6. Cara Menghitung Payout

### Metode 1: Berbasis Probabilitas (Share System)

```
Shares = Taruhan / Harga per Share
       = Taruhan / (Probabilitas / 100)
       = Taruhan × 100 / Probabilitas

Payout = Shares × Rp 1 (jika menang)
Profit = Payout - Taruhan
```

**Contoh: Taruhan Rp 500.000 pada probabilitas 40% (YES)**

```
Shares = Rp 500.000 / 0.40 = 1.250 shares

Jika menang:
  Payout = 1.250 × Rp 1    = Rp 1.250.000
  Profit = Rp 1.250.000 - Rp 500.000 = Rp 750.000
  ROI    = 750.000 / 500.000 = 150%
```

### Metode 2: Berbasis Odds Indonesia

```
Odds Positif:  Profit = Taruhan × Odds
Odds Negatif:  Profit = Taruhan / |Odds|
Total Kembali  = Taruhan + Profit
```

**Contoh dengan odds +1.50:**
```
Taruhan = Rp 200.000, Odds = +1.50
Profit  = Rp 200.000 × 1.50 = Rp 300.000
Total   = Rp 200.000 + Rp 300.000 = Rp 500.000
```

**Contoh dengan odds -2.00:**
```
Taruhan = Rp 200.000, Odds = -2.00
Profit  = Rp 200.000 / 2.00 = Rp 100.000
Total   = Rp 200.000 + Rp 100.000 = Rp 300.000
```

---

## 7. Constant Product Market Maker (CPMM)

CPMM adalah mekanisme **harga otomatis** yang digunakan Polymarket (dan Uniswap). Tidak ada bandar — harga ditentukan oleh jumlah shares di pool.

### Formula Inti

```
YES shares × NO shares = k  (konstan/tetap)
```

Di mana `k` tidak pernah berubah selama ada transaksi.

### Inisialisasi Pasar

Saat pasar dibuat dengan probabilitas awal **P%** dan likuiditas **L**:

```
YES shares awal = L × (1 - P/100)
NO  shares awal = L × (P/100)
k               = YES shares × NO shares
```

**Contoh: Pasar dengan probabilitas awal 50%, likuiditas Rp 1.000.000**

```
YES shares = 1.000.000 × 0.50 = 500.000
NO  shares = 1.000.000 × 0.50 = 500.000
k          = 500.000 × 500.000 = 250.000.000.000
```

### Cara Kerja Pembelian YES

Ketika seseorang membeli YES dengan sejumlah uang, uang tersebut masuk ke pool NO, sehingga pool NO bertambah dan pool YES berkurang (menjaga k tetap):

```
NO  shares baru = NO shares lama + Jumlah Beli
YES shares baru = k / NO shares baru
Shares diterima = YES shares lama - YES shares baru
```

**Contoh: Beli YES senilai Rp 100.000**

```
Sebelum:
  YES shares = 500.000
  NO  shares = 500.000
  k          = 250.000.000.000

Setelah beli YES Rp 100.000:
  NO  shares baru = 500.000 + 100.000 = 600.000
  YES shares baru = 250.000.000.000 / 600.000 = 416.667
  Shares diterima = 500.000 - 416.667 = 83.333 shares YES

Probabilitas YES setelah transaksi:
  = NO shares baru / (YES + NO) baru
  = 600.000 / (416.667 + 600.000)
  = 600.000 / 1.016.667
  ≈ 59%  (naik dari 50%)
```

### Cara Kerja Pembelian NO

```
YES shares baru = YES shares lama + Jumlah Beli
NO  shares baru = k / YES shares baru
Shares diterima = NO shares lama - NO shares baru
```

**Contoh: Beli NO senilai Rp 100.000**

```
Sebelum:
  YES shares = 500.000
  NO  shares = 500.000
  k          = 250.000.000.000

Setelah beli NO Rp 100.000:
  YES shares baru = 500.000 + 100.000 = 600.000
  NO  shares baru = 250.000.000.000 / 600.000 = 416.667
  Shares diterima = 500.000 - 416.667 = 83.333 shares NO

Probabilitas YES setelah transaksi:
  = NO shares baru / (YES + NO) baru
  = 416.667 / (600.000 + 416.667)
  = 416.667 / 1.016.667
  ≈ 41%  (turun dari 50%)
```

### Price Impact

Price impact adalah perubahan harga/probabilitas akibat sebuah transaksi. Semakin besar taruhan relatif terhadap likuiditas, semakin besar dampaknya.

```
Price Impact = Probabilitas setelah - Probabilitas sebelum
```

| Taruhan | Likuiditas | Price Impact |
|:---:|:---:|:---:|
| Rp 10.000 | Rp 1.000.000 | ~1% |
| Rp 100.000 | Rp 1.000.000 | ~9% |
| Rp 500.000 | Rp 1.000.000 | ~33% |

---

## 8. Dampak Taruhan terhadap Probabilitas

Estimasi perubahan probabilitas setelah taruhan (pendekatan sederhana berbasis volume):

```
Volume YES baru = Volume YES lama + Taruhan YES  (jika beli YES)
Volume NO  baru = Volume NO  lama + Taruhan NO   (jika beli NO)
Probabilitas baru = Volume YES baru / (Volume YES baru + Volume NO baru) × 100
```

**Contoh:**
```
Volume saat ini: YES = Rp 6.000.000, NO = Rp 4.000.000
Probabilitas YES = 6.000.000 / 10.000.000 × 100 = 60%

Seseorang beli YES Rp 500.000:
  Volume YES baru = 6.000.000 + 500.000 = 6.500.000
  Total baru      = 6.500.000 + 4.000.000 = 10.500.000
  Probabilitas baru = 6.500.000 / 10.500.000 × 100 = 61.9%
```

---

## 9. Contoh Lengkap Step-by-Step

### Skenario: Pasar "Timnas Indonesia lolos Piala Dunia 2026"

**Kondisi Pasar:**
- Probabilitas YES: **35%**
- Likuiditas: **Rp 5.000.000**
- YES shares: 3.250.000 | NO shares: 1.750.000 | k = 5.687.500.000.000

---

**Langkah 1 — Baca Odds**

| Format | YES (35%) | NO (65%) |
|---|:---:|:---:|
| Desimal | 2.86 | 1.54 |
| Indonesia | +1.86 | -1.86 _(dibalik)_ |
| Hong Kong | 1.86 | 0.54 |
| Amerika | +186 | -186 |

---

**Langkah 2 — Anda beli YES Rp 200.000**

```
Sebelum:
  YES shares = 3.250.000
  NO  shares = 1.750.000
  k          = 5.687.500.000.000

Setelah:
  NO  shares baru = 1.750.000 + 200.000 = 1.950.000
  YES shares baru = 5.687.500.000.000 / 1.950.000 = 2.916.667
  Shares diterima = 3.250.000 - 2.916.667 = 333.333 shares YES

  Harga rata-rata  = 200.000 / 333.333 = Rp 0.60 per share
  Probabilitas baru = 1.950.000 / (2.916.667 + 1.950.000) = 40%
  Price impact      = 40% - 35% = +5%
```

---

**Langkah 3 — Skenario Hasil**

**Jika YES menang (Timnas lolos):**
```
Payout = 333.333 × Rp 1 = Rp 333.333
Profit = Rp 333.333 - Rp 200.000 = Rp 133.333
ROI    = 133.333 / 200.000 = +66.7%
```

**Jika NO menang (Timnas tidak lolos):**
```
Payout = Rp 0
Rugi   = Rp 200.000
ROI    = -100%
```

---

**Langkah 4 — Verifikasi dengan Odds Indonesia**

```
Probabilitas awal = 35%
Odds Desimal      = 100/35 = 2.857
Odds Indonesia    = 2.857 - 1 = +1.857

Taruhan Rp 200.000 × odds +1.857:
  Profit (teoritis) = Rp 200.000 × 1.857 = Rp 371.429

Catatan: Nilai berbeda karena CPMM memperhitungkan price impact.
Odds Indonesia adalah pendekatan, CPMM adalah nilai aktual yang tepat.
```

---

## 10. Ringkasan Formula

### Konversi Probabilitas → Odds

```
Odds Desimal  = 100 / Probabilitas

Odds Indonesia:
  P < 50%  → +(100/P - 1)       [positif, underdog]
  P > 50%  → -(P / (100 - P))   [negatif, favorit]

Odds HK     = Odds Desimal - 1
Odds Amerika (P < 50%): +(Desimal - 1) × 100
Odds Amerika (P > 50%): -100 / (Desimal - 1)
Odds Malay  = kebalikan Indonesia
```

### Konversi Odds → Probabilitas

```
Dari Desimal:       P = (1 / Desimal) × 100
Dari Indo positif:  P = 1 / (odds + 1) × 100
Dari Indo negatif:  P = |odds| / (|odds| + 1) × 100
```

### Perhitungan Payout

```
Shares     = Taruhan / (P/100)
Payout     = Shares (jika menang)
Profit     = Payout - Taruhan

Odds Indo +:  Profit = Taruhan × odds
Odds Indo -:  Profit = Taruhan / |odds|
```

### CPMM

```
k              = YES shares × NO shares  (konstan)
YES price      = NO shares / (YES + NO shares)
NO  price      = YES shares / (YES + NO shares)

Beli YES:
  NO  baru = NO lama + Taruhan
  YES baru = k / NO baru
  Shares   = YES lama - YES baru

Beli NO:
  YES baru = YES lama + Taruhan
  NO  baru = k / YES baru
  Shares   = NO lama - NO baru
```

---

*Dokumen ini dibuat untuk keperluan presentasi internal Polymarket Indonesia.*
*Semua angka adalah ilustrasi dan dapat berbeda dengan kondisi pasar aktual.*
