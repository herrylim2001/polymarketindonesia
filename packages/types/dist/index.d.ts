export interface Market {
    id: string;
    title: string;
    description: string;
    category: Category;
    imageUrl: string;
    endDate: string;
    totalVolume: number;
    totalBets: number;
    outcomes: Outcome[];
    status: 'active' | 'resolved' | 'pending' | 'cancelled';
    resolvedOutcome?: string;
    createdAt: string;
    featured?: boolean;
    trending?: boolean;
    source?: string;
}
export interface Outcome {
    id: string;
    label: string;
    probability: number;
    totalBets: number;
    volume: number;
}
export interface Bet {
    id: string;
    marketId: string;
    outcomeId: string;
    outcomeLabel: string;
    marketTitle: string;
    userId: string;
    amount: number;
    probability: number;
    timestamp: string;
    potentialPayout: number;
    status: 'active' | 'won' | 'lost' | 'cancelled';
}
export interface User {
    id: string;
    username: string;
    email: string;
    balance: number;
    avatar?: string;
    totalBets: number;
    totalWins: number;
    totalProfit: number;
    joinedAt: string;
    bookmarks: string[];
}
export interface Notification {
    id: string;
    type: 'bet_placed' | 'market_resolved' | 'payout' | 'deposit' | 'withdrawal' | 'system';
    title: string;
    message: string;
    read: boolean;
    timestamp: string;
    link?: string;
}
export type PaymentMethod = 'bank_transfer' | 'virtual_account' | 'ewallet' | 'qris' | 'crypto';
export type BankCode = 'bca' | 'bni' | 'bri' | 'mandiri' | 'cimb' | 'permata' | 'bsi' | 'danamon';
export type EwalletCode = 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'linkaja';
export type CryptoCode = 'btc' | 'btc_lightning' | 'eth' | 'usdt_trc20' | 'usdt_erc20' | 'usdt_ton' | 'usdc' | 'matic' | 'ton' | 'xrp' | 'arb' | 'base';
export type CryptoNetwork = 'bitcoin' | 'lightning' | 'ethereum' | 'tron' | 'ton' | 'polygon' | 'arbitrum' | 'base' | 'ripple';
export interface Transaction {
    id: string;
    userId: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    fee: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    bankCode?: BankCode;
    ewalletCode?: EwalletCode;
    cryptoCode?: CryptoCode;
    cryptoNetwork?: CryptoNetwork;
    cryptoAddress?: string;
    cryptoAmount?: number;
    cryptoTxHash?: string;
    virtualAccountNumber?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    paidAt?: string;
    reference?: string;
    uniwireInvoiceId?: string;
}
export interface BankInfo {
    code: BankCode;
    name: string;
    shortName: string;
    logo: string;
    color: string;
    adminFee: number;
}
export interface EwalletInfo {
    code: EwalletCode;
    name: string;
    logo: string;
    color: string;
    adminFee: number;
    minAmount: number;
    maxAmount: number;
}
export interface CryptoInfo {
    code: CryptoCode;
    name: string;
    symbol: string;
    network: CryptoNetwork;
    networkName: string;
    color: string;
    icon: string;
    minAmount: number;
    confirmations: number;
    isLightning?: boolean;
}
export interface UniwireConfig {
    apiKey: string;
    apiSecret: string;
    profileId: string;
    callbackToken: string;
    callbackUrl: string;
    isTestMode: boolean;
}
export interface UniwireInvoice {
    id: string;
    address: string;
    amount: number;
    amountCrypto: number;
    currency: string;
    cryptoKind: string;
    status: 'pending' | 'underpaid' | 'paid' | 'overpaid' | 'expired';
    expiresAt: string;
    createdAt: string;
    qrCodeUrl?: string;
    lightningInvoice?: string;
}
export type Category = 'politik' | 'ekonomi' | 'olahraga' | 'hiburan' | 'teknologi' | 'sosial' | 'hukum' | 'internasional';
export interface CategoryInfo {
    id: Category;
    name: string;
    description: string;
    icon: string;
    color: string;
}
export declare const BANKS: BankInfo[];
export declare const EWALLETS: EwalletInfo[];
export declare const CRYPTOCURRENCIES: CryptoInfo[];
export declare const CATEGORIES: CategoryInfo[];
//# sourceMappingURL=index.d.ts.map