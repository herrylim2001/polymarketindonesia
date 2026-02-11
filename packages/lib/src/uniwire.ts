/**
 * Uniwire Crypto Payment Gateway Integration
 * Documentation: https://docs.uniwire.com/
 * API Reference: https://docs.uniwire.com/v1/
 */

import { CryptoCode, CryptoNetwork, UniwireConfig, UniwireInvoice } from '@polymarket/types';

// Default config (use environment variables in production)
const DEFAULT_CONFIG: UniwireConfig = {
  apiKey: process.env.NEXT_PUBLIC_UNIWIRE_API_KEY || '',
  apiSecret: process.env.UNIWIRE_API_SECRET || '',
  profileId: process.env.NEXT_PUBLIC_UNIWIRE_PROFILE_ID || '',
  callbackToken: process.env.UNIWIRE_CALLBACK_TOKEN || '',
  callbackUrl: process.env.NEXT_PUBLIC_UNIWIRE_CALLBACK_URL || '',
  isTestMode: process.env.NODE_ENV !== 'production',
};

// Uniwire API base URL
const API_BASE_URL = 'https://api.uniwire.com/v1';

// Map our crypto codes to Uniwire's "kind" parameter
const CRYPTO_TO_UNIWIRE_KIND: Record<CryptoCode, string> = {
  btc: 'btc',
  btc_lightning: 'btc-lightning',
  eth: 'eth',
  usdt_trc20: 'usdt-trc20',
  usdt_erc20: 'usdt-erc20',
  usdt_ton: 'usdt-ton',
  usdc: 'usdc-erc20',
  matic: 'matic',
  ton: 'ton',
  xrp: 'xrp',
  arb: 'eth-arb',
  base: 'eth-base',
};

// Exchange rates cache (simulated - in production, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  btc: 97000, // 1 BTC = $97,000 USD
  eth: 3200,  // 1 ETH = $3,200 USD
  usdt: 1,
  usdc: 1,
  matic: 0.45,
  ton: 5.2,
  xrp: 2.3,
  arb: 0.8,
};

// IDR to USD rate
const IDR_TO_USD = 16000; // 1 USD = 16,000 IDR

/**
 * Convert IDR amount to crypto amount
 */
export function convertIDRToCrypto(amountIDR: number, cryptoCode: CryptoCode): number {
  const usdAmount = amountIDR / IDR_TO_USD;

  // Get base currency for the crypto
  let baseCurrency = cryptoCode.split('_')[0];
  if (baseCurrency === 'btc') baseCurrency = 'btc';
  if (cryptoCode.startsWith('usdt')) baseCurrency = 'usdt';
  if (cryptoCode === 'usdc') baseCurrency = 'usdc';

  const rate = EXCHANGE_RATES[baseCurrency] || 1;
  return usdAmount / rate;
}

/**
 * Convert crypto amount to IDR
 */
export function convertCryptoToIDR(cryptoAmount: number, cryptoCode: CryptoCode): number {
  let baseCurrency = cryptoCode.split('_')[0];
  if (baseCurrency === 'btc') baseCurrency = 'btc';
  if (cryptoCode.startsWith('usdt')) baseCurrency = 'usdt';
  if (cryptoCode === 'usdc') baseCurrency = 'usdc';

  const rate = EXCHANGE_RATES[baseCurrency] || 1;
  const usdAmount = cryptoAmount * rate;
  return usdAmount * IDR_TO_USD;
}

/**
 * Format crypto amount with appropriate decimals
 */
export function formatCryptoAmount(amount: number, cryptoCode: CryptoCode): string {
  if (cryptoCode.startsWith('usdt') || cryptoCode === 'usdc') {
    return amount.toFixed(2);
  }
  if (cryptoCode === 'btc' || cryptoCode === 'btc_lightning') {
    return amount.toFixed(8);
  }
  if (cryptoCode === 'eth') {
    return amount.toFixed(6);
  }
  return amount.toFixed(4);
}

/**
 * Get crypto symbol for display
 */
export function getCryptoSymbol(cryptoCode: CryptoCode): string {
  const symbols: Record<CryptoCode, string> = {
    btc: 'BTC',
    btc_lightning: 'BTC',
    eth: 'ETH',
    usdt_trc20: 'USDT',
    usdt_erc20: 'USDT',
    usdt_ton: 'USDT',
    usdc: 'USDC',
    matic: 'MATIC',
    ton: 'TON',
    xrp: 'XRP',
    arb: 'ARB',
    base: 'ETH',
  };
  return symbols[cryptoCode];
}

/**
 * Generate a simulated crypto address (for demo purposes)
 * In production, this would call the Uniwire API
 */
function generateSimulatedAddress(cryptoCode: CryptoCode): string {
  const prefixes: Record<CryptoNetwork, string> = {
    bitcoin: '1',
    lightning: 'lnbc',
    ethereum: '0x',
    tron: 'T',
    ton: 'UQ',
    polygon: '0x',
    arbitrum: '0x',
    base: '0x',
    ripple: 'r',
  };

  const network = getNetworkForCrypto(cryptoCode);
  const prefix = prefixes[network];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let address = prefix;
  const length = network === 'lightning' ? 100 : network === 'bitcoin' ? 33 : 40;

  for (let i = 0; i < length - prefix.length; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return address;
}

/**
 * Get network for crypto code
 */
function getNetworkForCrypto(cryptoCode: CryptoCode): CryptoNetwork {
  const networks: Record<CryptoCode, CryptoNetwork> = {
    btc: 'bitcoin',
    btc_lightning: 'lightning',
    eth: 'ethereum',
    usdt_trc20: 'tron',
    usdt_erc20: 'ethereum',
    usdt_ton: 'ton',
    usdc: 'ethereum',
    matic: 'polygon',
    ton: 'ton',
    xrp: 'ripple',
    arb: 'arbitrum',
    base: 'base',
  };
  return networks[cryptoCode];
}

/**
 * Create a crypto invoice using Uniwire API
 * This is a simulation - in production, call the actual API
 */
export async function createCryptoInvoice(
  amountIDR: number,
  cryptoCode: CryptoCode,
  config: UniwireConfig = DEFAULT_CONFIG
): Promise<UniwireInvoice> {
  const cryptoAmount = convertIDRToCrypto(amountIDR, cryptoCode);
  const kind = CRYPTO_TO_UNIWIRE_KIND[cryptoCode];
  const network = getNetworkForCrypto(cryptoCode);

  // In production, make actual API call:
  // const payload = { amount: cryptoAmount, currency: kind, profileId: config.profileId };
  // const encodedPayload = btoa(JSON.stringify(payload));
  // const response = await fetch(`${API_BASE_URL}/invoices`, {
  //   method: 'POST',
  //   headers: {
  //     'X-CC-PAYLOAD': encodedPayload,
  //     'X-CC-API-KEY': config.apiKey,
  //   },
  // });

  // Simulated response
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  const address = generateSimulatedAddress(cryptoCode);

  const invoice: UniwireInvoice = {
    id: `INV${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    address,
    amount: amountIDR,
    amountCrypto: cryptoAmount,
    currency: getCryptoSymbol(cryptoCode),
    cryptoKind: kind,
    status: 'pending',
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`,
  };

  // Add Lightning invoice for Lightning Network
  if (network === 'lightning') {
    invoice.lightningInvoice = `lnbc${Math.floor(cryptoAmount * 100000000)}p1pj...${Math.random().toString(36).substr(2, 50)}`;
  }

  return invoice;
}

/**
 * Check invoice status (simulated)
 */
export async function checkInvoiceStatus(invoiceId: string): Promise<UniwireInvoice['status']> {
  // In production, call Uniwire API to check status
  // const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`);

  // Simulated: randomly return status for demo
  const statuses: UniwireInvoice['status'][] = ['pending', 'pending', 'pending', 'paid'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

/**
 * Validate callback signature from Uniwire
 */
export function validateCallback(
  payload: string,
  signature: string,
  config: UniwireConfig = DEFAULT_CONFIG
): boolean {
  // In production, verify HMAC signature
  // const expectedSignature = crypto
  //   .createHmac('sha256', config.callbackToken)
  //   .update(payload)
  //   .digest('hex');
  // return signature === expectedSignature;

  return true; // Simulated validation
}

/**
 * Get estimated confirmation time
 */
export function getEstimatedConfirmationTime(cryptoCode: CryptoCode): string {
  const times: Record<CryptoCode, string> = {
    btc: '10-60 menit',
    btc_lightning: 'Instan',
    eth: '2-5 menit',
    usdt_trc20: '1-3 menit',
    usdt_erc20: '2-5 menit',
    usdt_ton: '< 1 menit',
    usdc: '2-5 menit',
    matic: '2-5 menit',
    ton: '< 1 menit',
    xrp: '< 1 menit',
    arb: '< 1 menit',
    base: '< 1 menit',
  };
  return times[cryptoCode];
}

/**
 * Get network fee estimate
 */
export function getNetworkFeeEstimate(cryptoCode: CryptoCode): string {
  const fees: Record<CryptoCode, string> = {
    btc: '~$2-10',
    btc_lightning: '< $0.01',
    eth: '~$1-5',
    usdt_trc20: '~$1',
    usdt_erc20: '~$5-15',
    usdt_ton: '< $0.1',
    usdc: '~$5-15',
    matic: '< $0.01',
    ton: '< $0.1',
    xrp: '< $0.01',
    arb: '< $0.1',
    base: '< $0.1',
  };
  return fees[cryptoCode];
}
