/**
 * Odds Calculation System untuk Polymarket Indonesia
 *
 * Sistem ini menggunakan model Automated Market Maker (AMM)
 * yang mirip dengan Polymarket asli.
 */

export interface OddsCalculation {
  probability: number;          // Probabilitas dalam persen (0-100)
  decimalOdds: number;         // Odds desimal (misalnya 2.5)
  fractionalOdds: string;      // Odds fraksional (misalnya 3/2)
  americanOdds: string;        // Odds Amerika (misalnya +150 atau -200)
  indonesianOdds: string;      // Odds Indonesia (misalnya 1.50 atau -1.50)
  hongkongOdds: string;        // Odds Hong Kong (mirip desimal - 1)
  malayOdds: string;           // Odds Malay (kebalikan Indo untuk underdog)
  impliedProbability: number;  // Probabilitas tersirat
  potentialPayout: number;     // Potensi pembayaran
  potentialProfit: number;     // Potensi keuntungan
  pricePerShare: number;       // Harga per share (0.01 - 1.00)
  sharesReceived: number;      // Jumlah shares yang didapat
}

export interface MarketMakerState {
  yesShares: number;
  noShares: number;
  liquidity: number;
  k: number; // Constant product (x * y = k)
}

/**
 * Konversi probabilitas ke berbagai format odds
 */
export function probabilityToOdds(probability: number): OddsCalculation {
  // Pastikan probability valid
  const prob = Math.max(1, Math.min(99, probability));

  // Price per share (sama dengan probabilitas / 100)
  const pricePerShare = prob / 100;

  // Decimal odds = 1 / probability
  const decimalOdds = 1 / pricePerShare;

  // Fractional odds
  const fractionalOdds = decimalToFractional(decimalOdds);

  // American odds
  const americanOdds = decimalToAmerican(decimalOdds);

  // Indonesian odds (format Asia Tenggara)
  const indonesianOdds = decimalToIndonesian(decimalOdds);

  // Hong Kong odds (decimal - 1, selalu positif)
  const hongkongOdds = decimalToHongkong(decimalOdds);

  // Malay odds
  const malayOdds = decimalToMalay(decimalOdds);

  // Implied probability (seharusnya sama dengan input, tapi bisa berbeda karena margin)
  const impliedProbability = (1 / decimalOdds) * 100;

  return {
    probability: prob,
    decimalOdds: Math.round(decimalOdds * 100) / 100,
    fractionalOdds,
    americanOdds,
    indonesianOdds,
    hongkongOdds,
    malayOdds,
    impliedProbability: Math.round(impliedProbability * 100) / 100,
    potentialPayout: 0,
    potentialProfit: 0,
    pricePerShare: Math.round(pricePerShare * 100) / 100,
    sharesReceived: 0,
  };
}

/**
 * Hitung payout dan profit untuk jumlah taruhan tertentu
 */
export function calculateBetOutcome(
  betAmount: number,
  probability: number
): OddsCalculation {
  const odds = probabilityToOdds(probability);

  // Shares yang didapat = betAmount / pricePerShare
  const sharesReceived = betAmount / odds.pricePerShare;

  // Potential payout jika menang = shares * 1 (karena setiap share bernilai 1 jika menang)
  const potentialPayout = sharesReceived;

  // Potential profit = payout - betAmount
  const potentialProfit = potentialPayout - betAmount;

  return {
    ...odds,
    potentialPayout: Math.round(potentialPayout),
    potentialProfit: Math.round(potentialProfit),
    sharesReceived: Math.round(sharesReceived * 100) / 100,
  };
}

/**
 * Konversi decimal odds ke fractional
 */
function decimalToFractional(decimal: number): string {
  const profit = decimal - 1;

  // Cari pembilang dan penyebut yang sesuai
  const tolerance = 0.01;
  let bestNumerator = 1;
  let bestDenominator = 1;
  let bestError = Math.abs(profit - 1);

  for (let d = 1; d <= 100; d++) {
    const n = Math.round(profit * d);
    if (n > 0) {
      const error = Math.abs(profit - n / d);
      if (error < bestError) {
        bestError = error;
        bestNumerator = n;
        bestDenominator = d;
      }
      if (error < tolerance) break;
    }
  }

  // Simplifikasi
  const gcd = getGCD(bestNumerator, bestDenominator);
  return `${bestNumerator / gcd}/${bestDenominator / gcd}`;
}

/**
 * Konversi decimal odds ke American
 */
function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) {
    // Positive odds
    const american = (decimal - 1) * 100;
    return `+${Math.round(american)}`;
  } else {
    // Negative odds
    const american = -100 / (decimal - 1);
    return `${Math.round(american)}`;
  }
}

/**
 * Konversi decimal odds ke Indonesian odds
 *
 * Format Odds Indonesia (umum dipakai di Asia Tenggara):
 * - Positif (contoh 1.50): Taruhan underdog. Profit = taruhan × odds.
 *   Taruhan Rp 100.000 odds 1.50 → profit Rp 150.000, total kembali Rp 250.000
 * - Negatif (contoh -1.50): Taruhan favorit. Harus taruhan lebih besar.
 *   Odds -1.50 → taruhan Rp 150.000 untuk profit Rp 100.000
 *
 * Rumus dari decimal:
 *   Jika decimal >= 2.0 → Indo = +(decimal - 1)
 *   Jika decimal < 2.0  → Indo = -1/(decimal - 1)
 */
function decimalToIndonesian(decimal: number): string {
  if (decimal >= 2.0) {
    const indo = decimal - 1;
    return `+${indo.toFixed(2)}`;
  } else {
    const indo = -1 / (decimal - 1);
    return `-${indo.toFixed(2)}`;
  }
}

/**
 * Konversi decimal odds ke Hong Kong odds
 * HK odds = decimal odds - 1 (selalu positif)
 * Contoh: decimal 2.50 → HK 1.50
 */
function decimalToHongkong(decimal: number): string {
  const hk = decimal - 1;
  return hk.toFixed(2);
}

/**
 * Konversi decimal odds ke Malay odds
 *
 * Malay odds kebalikan dari Indonesian odds:
 *   Jika decimal >= 2.0 → Malay = -1/(decimal - 1) (negatif, favorit)
 *   Jika decimal < 2.0  → Malay = +(decimal - 1) (positif, underdog)
 *
 * Perspektif dari sisi "menang mudah" vs "menang sulit"
 */
function decimalToMalay(decimal: number): string {
  if (decimal >= 2.0) {
    const malay = -1 / (decimal - 1);
    return malay.toFixed(2);
  } else {
    const malay = decimal - 1;
    return `+${malay.toFixed(2)}`;
  }
}

/**
 * Hitung payout berdasarkan Indonesian odds
 *
 * @param betAmount - Jumlah taruhan dalam Rupiah
 * @param indoOdds - Odds format Indonesia (number, bisa positif/negatif)
 * @returns { totalReturn, profit, effectiveOdds }
 */
export function calculatePayoutIndonesian(
  betAmount: number,
  indoOdds: number
): {
  totalReturn: number;
  profit: number;
  effectiveOdds: number;
  riskAmount: number;
  description: string;
} {
  if (indoOdds > 0) {
    // Positif: profit = taruhan × odds
    const profit = betAmount * indoOdds;
    return {
      totalReturn: betAmount + profit,
      profit: Math.round(profit),
      effectiveOdds: indoOdds,
      riskAmount: betAmount,
      description: `Taruhan Rp ${betAmount.toLocaleString('id-ID')} × ${indoOdds.toFixed(2)} = profit Rp ${Math.round(profit).toLocaleString('id-ID')}`,
    };
  } else {
    // Negatif: profit = taruhan / |odds|
    const absOdds = Math.abs(indoOdds);
    const profit = betAmount / absOdds;
    return {
      totalReturn: betAmount + profit,
      profit: Math.round(profit),
      effectiveOdds: indoOdds,
      riskAmount: betAmount,
      description: `Taruhan Rp ${betAmount.toLocaleString('id-ID')} ÷ ${absOdds.toFixed(2)} = profit Rp ${Math.round(profit).toLocaleString('id-ID')}`,
    };
  }
}

/**
 * Konversi Indonesian odds ke probability
 */
export function indonesianOddsToProbability(indoOdds: number): number {
  if (indoOdds > 0) {
    // Positif: probability = 1 / (indoOdds + 1) × 100
    return Math.round((1 / (indoOdds + 1)) * 10000) / 100;
  } else {
    // Negatif: probability = |indoOdds| / (|indoOdds| + 1) × 100
    const absOdds = Math.abs(indoOdds);
    return Math.round((absOdds / (absOdds + 1)) * 10000) / 100;
  }
}

/**
 * Konversi probability ke Indonesian odds (number)
 */
export function probabilityToIndonesianOdds(probability: number): number {
  const prob = Math.max(1, Math.min(99, probability));
  const decimal = 100 / prob;

  if (decimal >= 2.0) {
    return Math.round((decimal - 1) * 100) / 100;
  } else {
    return -Math.round((1 / (decimal - 1)) * 100) / 100;
  }
}

/**
 * Greatest Common Divisor
 */
function getGCD(a: number, b: number): number {
  return b === 0 ? a : getGCD(b, a % b);
}

/**
 * Constant Product Market Maker (CPMM)
 * Mirip dengan Uniswap/Polymarket
 */
export class ConstantProductMarketMaker {
  private yesShares: number;
  private noShares: number;
  private k: number;
  private liquidity: number;

  constructor(initialLiquidity: number = 1000000, initialProbability: number = 50) {
    this.liquidity = initialLiquidity;

    // Initialize shares berdasarkan probabilitas awal
    // Probability = noShares / (yesShares + noShares)
    // Atau bisa juga: yesPrice = noShares / (yesShares + noShares)
    const prob = initialProbability / 100;

    // Menggunakan formula: yesShares * noShares = k
    // Dan yesPrice = noShares / (yesShares + noShares)
    this.yesShares = initialLiquidity * (1 - prob);
    this.noShares = initialLiquidity * prob;
    this.k = this.yesShares * this.noShares;
  }

  /**
   * Get current state
   */
  getState(): MarketMakerState {
    return {
      yesShares: this.yesShares,
      noShares: this.noShares,
      liquidity: this.liquidity,
      k: this.k,
    };
  }

  /**
   * Get current probability for YES outcome
   */
  getYesProbability(): number {
    const total = this.yesShares + this.noShares;
    // YES price = noShares / total (karena semakin sedikit noShares, semakin tinggi YES price)
    return Math.round((this.noShares / total) * 10000) / 100;
  }

  /**
   * Get current probability for NO outcome
   */
  getNoProbability(): number {
    return Math.round((100 - this.getYesProbability()) * 100) / 100;
  }

  /**
   * Simulasi pembelian YES shares
   * Returns: jumlah shares yang didapat
   */
  simulateBuyYes(amount: number): {
    sharesReceived: number;
    avgPrice: number;
    priceImpact: number;
    newProbability: number;
  } {
    const currentYesProb = this.getYesProbability();

    // Hitung shares yang didapat menggunakan CPMM formula
    // newNoShares = k / newYesShares
    // amount ditambahkan ke noShares pool
    const newNoShares = this.noShares + amount;
    const newYesShares = this.k / newNoShares;
    const sharesReceived = this.yesShares - newYesShares;

    // Average price
    const avgPrice = amount / sharesReceived;

    // New probability setelah trade
    const newTotal = newYesShares + newNoShares;
    const newProbability = (newNoShares / newTotal) * 100;

    // Price impact
    const priceImpact = newProbability - currentYesProb;

    return {
      sharesReceived: Math.round(sharesReceived * 100) / 100,
      avgPrice: Math.round(avgPrice * 10000) / 10000,
      priceImpact: Math.round(priceImpact * 100) / 100,
      newProbability: Math.round(newProbability * 100) / 100,
    };
  }

  /**
   * Simulasi pembelian NO shares
   */
  simulateBuyNo(amount: number): {
    sharesReceived: number;
    avgPrice: number;
    priceImpact: number;
    newProbability: number;
  } {
    const currentNoProb = this.getNoProbability();

    const newYesShares = this.yesShares + amount;
    const newNoShares = this.k / newYesShares;
    const sharesReceived = this.noShares - newNoShares;

    const avgPrice = amount / sharesReceived;

    const newTotal = newYesShares + newNoShares;
    const newYesProbability = (newNoShares / newTotal) * 100;
    const newNoProbability = 100 - newYesProbability;

    const priceImpact = newNoProbability - currentNoProb;

    return {
      sharesReceived: Math.round(sharesReceived * 100) / 100,
      avgPrice: Math.round(avgPrice * 10000) / 10000,
      priceImpact: Math.round(priceImpact * 100) / 100,
      newProbability: Math.round(newNoProbability * 100) / 100,
    };
  }

  /**
   * Execute buy YES
   */
  buyYes(amount: number): number {
    const result = this.simulateBuyYes(amount);
    this.noShares += amount;
    this.yesShares = this.k / this.noShares;
    return result.sharesReceived;
  }

  /**
   * Execute buy NO
   */
  buyNo(amount: number): number {
    const result = this.simulateBuyNo(amount);
    this.yesShares += amount;
    this.noShares = this.k / this.yesShares;
    return result.sharesReceived;
  }
}

/**
 * Odds calculator untuk multiple outcomes
 */
export function calculateMultiOutcomeOdds(
  outcomes: Array<{ id: string; volume: number; totalBets: number }>
): Array<{ id: string; probability: number; decimalOdds: number }> {
  const totalVolume = outcomes.reduce((sum, o) => sum + o.volume, 0);

  if (totalVolume === 0) {
    // Equal probability jika belum ada volume
    const equalProb = 100 / outcomes.length;
    return outcomes.map(o => ({
      id: o.id,
      probability: Math.round(equalProb * 100) / 100,
      decimalOdds: Math.round((100 / equalProb) * 100) / 100,
    }));
  }

  return outcomes.map(o => {
    const probability = (o.volume / totalVolume) * 100;
    const decimalOdds = totalVolume / o.volume;

    return {
      id: o.id,
      probability: Math.round(probability * 100) / 100,
      decimalOdds: Math.round(decimalOdds * 100) / 100,
    };
  });
}

/**
 * Estimate new probability after a bet
 */
export function estimateProbabilityAfterBet(
  currentProbability: number,
  betAmount: number,
  totalVolume: number,
  isYesBet: boolean
): number {
  const currentYesVolume = totalVolume * (currentProbability / 100);
  const currentNoVolume = totalVolume - currentYesVolume;

  let newYesVolume: number;
  let newNoVolume: number;

  if (isYesBet) {
    newYesVolume = currentYesVolume + betAmount;
    newNoVolume = currentNoVolume;
  } else {
    newYesVolume = currentYesVolume;
    newNoVolume = currentNoVolume + betAmount;
  }

  const newTotalVolume = newYesVolume + newNoVolume;
  const newProbability = (newYesVolume / newTotalVolume) * 100;

  return Math.round(newProbability * 100) / 100;
}

/**
 * Format odds untuk display
 */
export function formatOddsDisplay(probability: number): {
  decimal: string;
  fractional: string;
  american: string;
  indonesian: string;
  hongkong: string;
  malay: string;
  multiplier: string;
} {
  const odds = probabilityToOdds(probability);

  return {
    decimal: odds.decimalOdds.toFixed(2),
    fractional: odds.fractionalOdds,
    american: odds.americanOdds,
    indonesian: odds.indonesianOdds,
    hongkong: odds.hongkongOdds,
    malay: odds.malayOdds,
    multiplier: `${odds.decimalOdds.toFixed(2)}x`,
  };
}
