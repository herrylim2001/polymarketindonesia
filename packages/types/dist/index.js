// Constants
export const BANKS = [
    { code: 'bca', name: 'Bank Central Asia', shortName: 'BCA', logo: '/banks/bca.png', color: 'bg-blue-600', adminFee: 0 },
    { code: 'bni', name: 'Bank Negara Indonesia', shortName: 'BNI', logo: '/banks/bni.png', color: 'bg-orange-500', adminFee: 0 },
    { code: 'bri', name: 'Bank Rakyat Indonesia', shortName: 'BRI', logo: '/banks/bri.png', color: 'bg-blue-800', adminFee: 0 },
    { code: 'mandiri', name: 'Bank Mandiri', shortName: 'Mandiri', logo: '/banks/mandiri.png', color: 'bg-blue-900', adminFee: 0 },
    { code: 'cimb', name: 'CIMB Niaga', shortName: 'CIMB', logo: '/banks/cimb.png', color: 'bg-red-600', adminFee: 0 },
    { code: 'permata', name: 'Bank Permata', shortName: 'Permata', logo: '/banks/permata.png', color: 'bg-green-600', adminFee: 0 },
    { code: 'bsi', name: 'Bank Syariah Indonesia', shortName: 'BSI', logo: '/banks/bsi.png', color: 'bg-teal-600', adminFee: 0 },
    { code: 'danamon', name: 'Bank Danamon', shortName: 'Danamon', logo: '/banks/danamon.png', color: 'bg-yellow-500', adminFee: 0 },
];
export const EWALLETS = [
    { code: 'dana', name: 'DANA', logo: '/ewallets/dana.png', color: 'bg-blue-500', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
    { code: 'ovo', name: 'OVO', logo: '/ewallets/ovo.png', color: 'bg-purple-600', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
    { code: 'gopay', name: 'GoPay', logo: '/ewallets/gopay.png', color: 'bg-green-500', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
    { code: 'shopeepay', name: 'ShopeePay', logo: '/ewallets/shopeepay.png', color: 'bg-orange-500', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
    { code: 'linkaja', name: 'LinkAja', logo: '/ewallets/linkaja.png', color: 'bg-red-500', adminFee: 0, minAmount: 10000, maxAmount: 10000000 },
];
export const CRYPTOCURRENCIES = [
    // Bitcoin
    { code: 'btc', name: 'Bitcoin', symbol: 'BTC', network: 'bitcoin', networkName: 'Bitcoin', color: 'bg-orange-500', icon: '₿', minAmount: 10, confirmations: 1 },
    { code: 'btc_lightning', name: 'Bitcoin Lightning', symbol: 'BTC', network: 'lightning', networkName: 'Lightning Network', color: 'bg-yellow-500', icon: '⚡', minAmount: 1, confirmations: 0, isLightning: true },
    // Ethereum
    { code: 'eth', name: 'Ethereum', symbol: 'ETH', network: 'ethereum', networkName: 'Ethereum', color: 'bg-indigo-500', icon: 'Ξ', minAmount: 10, confirmations: 12 },
    // Stablecoins - USDT
    { code: 'usdt_trc20', name: 'USDT', symbol: 'USDT', network: 'tron', networkName: 'Tron (TRC20)', color: 'bg-green-500', icon: '₮', minAmount: 10, confirmations: 20 },
    { code: 'usdt_erc20', name: 'USDT', symbol: 'USDT', network: 'ethereum', networkName: 'Ethereum (ERC20)', color: 'bg-green-600', icon: '₮', minAmount: 10, confirmations: 12 },
    { code: 'usdt_ton', name: 'USDT', symbol: 'USDT', network: 'ton', networkName: 'TON', color: 'bg-blue-500', icon: '₮', minAmount: 5, confirmations: 1 },
    // USDC
    { code: 'usdc', name: 'USD Coin', symbol: 'USDC', network: 'ethereum', networkName: 'Ethereum', color: 'bg-blue-600', icon: '$', minAmount: 10, confirmations: 12 },
    // Layer 2 & Other Networks
    { code: 'matic', name: 'Polygon', symbol: 'MATIC', network: 'polygon', networkName: 'Polygon', color: 'bg-purple-500', icon: '⬡', minAmount: 5, confirmations: 128 },
    { code: 'ton', name: 'Toncoin', symbol: 'TON', network: 'ton', networkName: 'TON', color: 'bg-sky-500', icon: '💎', minAmount: 5, confirmations: 1 },
    { code: 'xrp', name: 'Ripple', symbol: 'XRP', network: 'ripple', networkName: 'XRP Ledger', color: 'bg-gray-600', icon: '✕', minAmount: 10, confirmations: 1 },
    { code: 'arb', name: 'Arbitrum', symbol: 'ARB', network: 'arbitrum', networkName: 'Arbitrum One', color: 'bg-blue-400', icon: '◆', minAmount: 5, confirmations: 1 },
    { code: 'base', name: 'Base', symbol: 'ETH', network: 'base', networkName: 'Base', color: 'bg-blue-700', icon: '🔵', minAmount: 5, confirmations: 1 },
];
export const CATEGORIES = [
    {
        id: 'politik',
        name: 'Politik',
        description: 'Pemilu, kebijakan pemerintah, dan politik Indonesia',
        icon: '🏛️',
        color: 'bg-blue-500'
    },
    {
        id: 'ekonomi',
        name: 'Ekonomi',
        description: 'Pasar saham, nilai tukar, dan ekonomi makro',
        icon: '📈',
        color: 'bg-green-500'
    },
    {
        id: 'olahraga',
        name: 'Olahraga',
        description: 'Liga 1, Timnas, badminton, dan olahraga lainnya',
        icon: '⚽',
        color: 'bg-orange-500'
    },
    {
        id: 'hiburan',
        name: 'Hiburan',
        description: 'Film, musik, selebriti, dan pop culture Indonesia',
        icon: '🎬',
        color: 'bg-purple-500'
    },
    {
        id: 'teknologi',
        name: 'Teknologi',
        description: 'Startup, crypto, dan teknologi di Indonesia',
        icon: '💻',
        color: 'bg-cyan-500'
    },
    {
        id: 'sosial',
        name: 'Sosial',
        description: 'Isu sosial, pendidikan, dan kesehatan',
        icon: '👥',
        color: 'bg-pink-500'
    },
    {
        id: 'hukum',
        name: 'Hukum',
        description: 'Kasus hukum dan keputusan pengadilan',
        icon: '⚖️',
        color: 'bg-amber-500'
    },
    {
        id: 'internasional',
        name: 'Internasional',
        description: 'Hubungan Indonesia dengan dunia internasional',
        icon: '🌏',
        color: 'bg-indigo-500'
    }
];
