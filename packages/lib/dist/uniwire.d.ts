/**
 * Uniwire Crypto Payment Gateway Integration
 * Documentation: https://docs.uniwire.com/
 * API Reference: https://docs.uniwire.com/v1/
 */
import { CryptoCode, UniwireConfig, UniwireInvoice } from '@polymarket/types';
/**
 * Convert IDR amount to crypto amount
 */
export declare function convertIDRToCrypto(amountIDR: number, cryptoCode: CryptoCode): number;
/**
 * Convert crypto amount to IDR
 */
export declare function convertCryptoToIDR(cryptoAmount: number, cryptoCode: CryptoCode): number;
/**
 * Format crypto amount with appropriate decimals
 */
export declare function formatCryptoAmount(amount: number, cryptoCode: CryptoCode): string;
/**
 * Get crypto symbol for display
 */
export declare function getCryptoSymbol(cryptoCode: CryptoCode): string;
/**
 * Create a crypto invoice using Uniwire API
 * This is a simulation - in production, call the actual API
 */
export declare function createCryptoInvoice(amountIDR: number, cryptoCode: CryptoCode, config?: UniwireConfig): Promise<UniwireInvoice>;
/**
 * Check invoice status (simulated)
 */
export declare function checkInvoiceStatus(invoiceId: string): Promise<UniwireInvoice['status']>;
/**
 * Validate callback signature from Uniwire
 */
export declare function validateCallback(payload: string, signature: string, config?: UniwireConfig): boolean;
/**
 * Get estimated confirmation time
 */
export declare function getEstimatedConfirmationTime(cryptoCode: CryptoCode): string;
/**
 * Get network fee estimate
 */
export declare function getNetworkFeeEstimate(cryptoCode: CryptoCode): string;
//# sourceMappingURL=uniwire.d.ts.map