/**
 * Odds Calculation System untuk Polymarket Indonesia
 *
 * Sistem ini menggunakan model Automated Market Maker (AMM)
 * yang mirip dengan Polymarket asli.
 *
 * Standard odds yang didukung:
 * - Indonesia: +0.01 s/d +99.00 (positif), -1.01 s/d -99.00 (negatif)
 * - Desimal: 1.01 s/d 100.00
 * - Hong Kong: 0.01 s/d 99.00
 * - Malay: -0.01 s/d -1.00 atau +0.01 s/d +1.00
 */
export interface OddsValidation {
    valid: boolean;
    error?: string;
    correctedValue?: number;
}
/**
 * Validasi probabilitas (1-99%)
 */
export declare function validateProbability(probability: number): OddsValidation;
/**
 * Validasi odds desimal (1.01 - 100.00)
 */
export declare function validateDecimalOdds(odds: number): OddsValidation;
/**
 * Validasi odds Indonesia
 * Positif: +0.01 s/d +99.00 (underdog)
 * Negatif: -1.01 s/d -99.00 (favorit)
 * Tidak boleh: 0, atau antara -1.00 dan 0
 */
export declare function validateIndonesianOdds(odds: number): OddsValidation;
/**
 * Validasi bet amount
 */
export declare function validateBetAmount(amount: number, minBet?: number, maxBet?: number): OddsValidation;
/**
 * Sanitize probability: clamp ke range valid dan return angka yang aman
 */
export declare function sanitizeProbability(probability: number): number;
/**
 * Sanitize Indonesian odds: clamp ke range valid
 */
export declare function sanitizeIndonesianOdds(odds: number): number;
export interface OddsCalculation {
    probability: number;
    decimalOdds: number;
    fractionalOdds: string;
    americanOdds: string;
    indonesianOdds: string;
    hongkongOdds: string;
    malayOdds: string;
    impliedProbability: number;
    potentialPayout: number;
    potentialProfit: number;
    pricePerShare: number;
    sharesReceived: number;
}
export interface MarketMakerState {
    yesShares: number;
    noShares: number;
    liquidity: number;
    k: number;
}
/**
 * Konversi probabilitas ke berbagai format odds
 * Probability di-sanitize otomatis ke range 1-99%
 */
export declare function probabilityToOdds(probability: number): OddsCalculation;
/**
 * Hitung payout dan profit untuk jumlah taruhan tertentu
 */
export declare function calculateBetOutcome(betAmount: number, probability: number): OddsCalculation;
/**
 * Hitung payout berdasarkan Indonesian odds
 *
 * @param betAmount - Jumlah taruhan dalam Rupiah
 * @param indoOdds - Odds format Indonesia (number, bisa positif/negatif)
 * @returns { totalReturn, profit, effectiveOdds }
 */
export declare function calculatePayoutIndonesian(betAmount: number, indoOdds: number): {
    totalReturn: number;
    profit: number;
    effectiveOdds: number;
    riskAmount: number;
    description: string;
};
/**
 * Konversi Indonesian odds ke probability
 */
export declare function indonesianOddsToProbability(indoOdds: number): number;
/**
 * Konversi probability ke Indonesian odds (number)
 */
export declare function probabilityToIndonesianOdds(probability: number): number;
/**
 * Constant Product Market Maker (CPMM)
 * Mirip dengan Uniswap/Polymarket
 */
export declare class ConstantProductMarketMaker {
    private yesShares;
    private noShares;
    private k;
    private liquidity;
    constructor(initialLiquidity?: number, initialProbability?: number);
    /**
     * Get current state
     */
    getState(): MarketMakerState;
    /**
     * Get current probability for YES outcome
     */
    getYesProbability(): number;
    /**
     * Get current probability for NO outcome
     */
    getNoProbability(): number;
    /**
     * Simulasi pembelian YES shares
     * Returns: jumlah shares yang didapat
     */
    simulateBuyYes(amount: number): {
        sharesReceived: number;
        avgPrice: number;
        priceImpact: number;
        newProbability: number;
    };
    /**
     * Simulasi pembelian NO shares
     */
    simulateBuyNo(amount: number): {
        sharesReceived: number;
        avgPrice: number;
        priceImpact: number;
        newProbability: number;
    };
    /**
     * Execute buy YES
     */
    buyYes(amount: number): number;
    /**
     * Execute buy NO
     */
    buyNo(amount: number): number;
}
/**
 * Odds calculator untuk multiple outcomes
 */
export declare function calculateMultiOutcomeOdds(outcomes: Array<{
    id: string;
    volume: number;
    totalBets: number;
}>): Array<{
    id: string;
    probability: number;
    decimalOdds: number;
}>;
/**
 * Estimate new probability after a bet
 */
export declare function estimateProbabilityAfterBet(currentProbability: number, betAmount: number, totalVolume: number, isYesBet: boolean): number;
/**
 * Format odds untuk display
 */
export declare function formatOddsDisplay(probability: number): {
    decimal: string;
    fractional: string;
    american: string;
    indonesian: string;
    hongkong: string;
    malay: string;
    multiplier: string;
};
//# sourceMappingURL=odds.d.ts.map