// Format currency to IDR
export function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
// Format number dengan titik pemisah ribuan (tanpa simbol mata uang)
export function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}
// Format number with K, M, B suffixes
export function formatCompactNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'M';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'Jt';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'Rb';
    }
    return num.toString();
}
// Calculate potential payout based on probability
export function calculatePayout(amount, probability) {
    if (probability <= 0 || probability >= 100)
        return amount;
    return Math.round((amount / (probability / 100)));
}
// Calculate decimal odds from probability (simple version)
export function probabilityToDecimalOdds(probability) {
    if (probability <= 0)
        return 0;
    return Math.round((100 / probability) * 100) / 100;
}
// Format date to Indonesian locale
export function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}
// Format relative time (e.g., "2 hari lagi")
export function formatTimeRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0)
        return 'Berakhir';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 30) {
        const months = Math.floor(days / 30);
        return `${months} bulan lagi`;
    }
    if (days > 0) {
        return `${days} hari lagi`;
    }
    if (hours > 0) {
        return `${hours} jam lagi`;
    }
    return 'Segera berakhir';
}
// Generate random ID
export function generateId() {
    return Math.random().toString(36).substring(2, 15);
}
// Get probability color class
export function getProbabilityColor(probability) {
    if (probability >= 70)
        return 'text-green-500';
    if (probability >= 40)
        return 'text-yellow-500';
    return 'text-red-500';
}
// Get probability background color class
export function getProbabilityBgColor(probability) {
    if (probability >= 70)
        return 'bg-green-500';
    if (probability >= 40)
        return 'bg-yellow-500';
    return 'bg-red-500';
}
