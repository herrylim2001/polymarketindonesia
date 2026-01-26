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

  // Implied probability (seharusnya sama dengan input, tapi bisa berbeda karena margin)
  const impliedProbability = (1 / decimalOdds) * 100;

  return {
    probability: prob,
    decimalOdds: Math.round(decimalOdds * 100) / 100,
    fractionalOdds,
    americanOdds,
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
  multiplier: string;
} {
  const odds = probabilityToOdds(probability);

  return {
    decimal: odds.decimalOdds.toFixed(2),
    fractional: odds.fractionalOdds,
    american: odds.americanOdds,
    multiplier: `${odds.decimalOdds.toFixed(2)}x`,
  };
}
