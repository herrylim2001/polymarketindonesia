import { Market } from '@/types';

export const markets: Market[] = [
  // POLITIK
  {
    id: 'pilkada-jakarta-2027',
    title: 'Siapa yang akan memenangkan Pilkada Jakarta 2027?',
    description: 'Prediksi pemenang Pemilihan Gubernur DKI Jakarta tahun 2027. Pasar akan diselesaikan berdasarkan hasil resmi KPU.',
    category: 'politik',
    imageUrl: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800',
    endDate: '2027-11-15',
    totalVolume: 15000000000,
    totalBets: 12450,
    status: 'active',
    featured: true,
    trending: true,
    createdAt: '2026-01-01',
    source: 'KPU RI',
    outcomes: [
      { id: 'anies', label: 'Anies Baswedan', probability: 35, totalBets: 4500, volume: 5250000000 },
      { id: 'ridwan', label: 'Ridwan Kamil', probability: 28, totalBets: 3200, volume: 4200000000 },
      { id: 'ahok', label: 'Basuki Tjahaja Purnama', probability: 22, totalBets: 2800, volume: 3300000000 },
      { id: 'other', label: 'Kandidat Lain', probability: 15, totalBets: 1950, volume: 2250000000 },
    ]
  },
  {
    id: 'kabinet-reshuffle-2026',
    title: 'Akankah ada reshuffle kabinet sebelum Juni 2026?',
    description: 'Prediksi apakah Presiden Prabowo akan melakukan reshuffle kabinet sebelum bulan Juni 2026.',
    category: 'politik',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
    endDate: '2026-06-01',
    totalVolume: 8500000000,
    totalBets: 6780,
    status: 'active',
    featured: true,
    createdAt: '2026-01-10',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 65, totalBets: 4400, volume: 5525000000 },
      { id: 'tidak', label: 'Tidak', probability: 35, totalBets: 2380, volume: 2975000000 },
    ]
  },
  {
    id: 'ibu-kota-nusantara-2026',
    title: 'Apakah IKN akan diresmikan sebagai ibu kota pada 2026?',
    description: 'Prediksi apakah Ibu Kota Nusantara (IKN) akan secara resmi menjadi ibu kota negara pada tahun 2026.',
    category: 'politik',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    endDate: '2026-12-31',
    totalVolume: 12000000000,
    totalBets: 9800,
    status: 'active',
    trending: true,
    createdAt: '2026-01-05',
    outcomes: [
      { id: 'ya', label: 'Ya, diresmikan 2026', probability: 45, totalBets: 4400, volume: 5400000000 },
      { id: 'tidak', label: 'Tidak, ditunda', probability: 55, totalBets: 5400, volume: 6600000000 },
    ]
  },

  // EKONOMI
  {
    id: 'rupiah-usd-q2-2026',
    title: 'Nilai tukar Rupiah terhadap USD akhir Q2 2026?',
    description: 'Prediksi nilai tukar Rupiah terhadap Dolar AS pada akhir kuartal kedua 2026.',
    category: 'ekonomi',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    endDate: '2026-06-30',
    totalVolume: 20000000000,
    totalBets: 15600,
    status: 'active',
    featured: true,
    createdAt: '2026-01-01',
    source: 'Bank Indonesia',
    outcomes: [
      { id: 'under-15500', label: 'Di bawah 15.500', probability: 15, totalBets: 2340, volume: 3000000000 },
      { id: '15500-16000', label: '15.500 - 16.000', probability: 35, totalBets: 5460, volume: 7000000000 },
      { id: '16000-16500', label: '16.000 - 16.500', probability: 35, totalBets: 5460, volume: 7000000000 },
      { id: 'above-16500', label: 'Di atas 16.500', probability: 15, totalBets: 2340, volume: 3000000000 },
    ]
  },
  {
    id: 'ihsg-2026-target',
    title: 'IHSG akan mencapai 8.000 sebelum akhir 2026?',
    description: 'Prediksi apakah Indeks Harga Saham Gabungan (IHSG) akan menembus level 8.000 sebelum akhir tahun 2026.',
    category: 'ekonomi',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
    endDate: '2026-12-31',
    totalVolume: 18000000000,
    totalBets: 14200,
    status: 'active',
    trending: true,
    createdAt: '2026-01-01',
    source: 'BEI',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 40, totalBets: 5680, volume: 7200000000 },
      { id: 'tidak', label: 'Tidak', probability: 60, totalBets: 8520, volume: 10800000000 },
    ]
  },
  {
    id: 'bi-rate-feb-2026',
    title: 'BI Rate pada RDG Februari 2026?',
    description: 'Prediksi keputusan suku bunga Bank Indonesia pada Rapat Dewan Gubernur Februari 2026.',
    category: 'ekonomi',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    endDate: '2026-02-20',
    totalVolume: 5500000000,
    totalBets: 4200,
    status: 'active',
    createdAt: '2026-01-15',
    source: 'Bank Indonesia',
    outcomes: [
      { id: 'turun', label: 'Turun 25 bps', probability: 30, totalBets: 1260, volume: 1650000000 },
      { id: 'tetap', label: 'Tetap', probability: 55, totalBets: 2310, volume: 3025000000 },
      { id: 'naik', label: 'Naik 25 bps', probability: 15, totalBets: 630, volume: 825000000 },
    ]
  },

  // OLAHRAGA
  {
    id: 'timnas-piala-asia-2027',
    title: 'Timnas Indonesia lolos ke Piala Dunia 2026?',
    description: 'Prediksi apakah Tim Nasional Indonesia akan lolos ke Piala Dunia 2026.',
    category: 'olahraga',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    endDate: '2026-06-15',
    totalVolume: 25000000000,
    totalBets: 45000,
    status: 'active',
    featured: true,
    trending: true,
    createdAt: '2026-01-01',
    source: 'FIFA',
    outcomes: [
      { id: 'ya', label: 'Ya, Lolos', probability: 25, totalBets: 11250, volume: 6250000000 },
      { id: 'tidak', label: 'Tidak Lolos', probability: 75, totalBets: 33750, volume: 18750000000 },
    ]
  },
  {
    id: 'liga1-champion-2025-26',
    title: 'Juara Liga 1 musim 2025/2026?',
    description: 'Prediksi tim yang akan menjadi juara Liga 1 Indonesia musim 2025/2026.',
    category: 'olahraga',
    imageUrl: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
    endDate: '2026-05-30',
    totalVolume: 30000000000,
    totalBets: 52000,
    status: 'active',
    featured: true,
    createdAt: '2025-08-01',
    source: 'PSSI',
    outcomes: [
      { id: 'persib', label: 'Persib Bandung', probability: 28, totalBets: 14560, volume: 8400000000 },
      { id: 'persija', label: 'Persija Jakarta', probability: 25, totalBets: 13000, volume: 7500000000 },
      { id: 'bali-united', label: 'Bali United', probability: 20, totalBets: 10400, volume: 6000000000 },
      { id: 'arema', label: 'Arema FC', probability: 15, totalBets: 7800, volume: 4500000000 },
      { id: 'other', label: 'Tim Lainnya', probability: 12, totalBets: 6240, volume: 3600000000 },
    ]
  },
  {
    id: 'badminton-all-england-2026',
    title: 'Indonesia meraih emas All England 2026?',
    description: 'Prediksi apakah atlet Indonesia akan meraih medali emas di All England 2026 (semua kategori).',
    category: 'olahraga',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    endDate: '2026-03-15',
    totalVolume: 8000000000,
    totalBets: 12500,
    status: 'active',
    createdAt: '2026-01-01',
    outcomes: [
      { id: 'ya', label: 'Ya, minimal 1 emas', probability: 70, totalBets: 8750, volume: 5600000000 },
      { id: 'tidak', label: 'Tidak ada emas', probability: 30, totalBets: 3750, volume: 2400000000 },
    ]
  },

  // HIBURAN
  {
    id: 'film-indonesia-oscar-2027',
    title: 'Film Indonesia masuk nominasi Oscar 2027?',
    description: 'Prediksi apakah ada film Indonesia yang masuk nominasi Academy Awards 2027 (kategori apapun).',
    category: 'hiburan',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
    endDate: '2027-01-15',
    totalVolume: 3500000000,
    totalBets: 5600,
    status: 'active',
    createdAt: '2026-01-01',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 15, totalBets: 840, volume: 525000000 },
      { id: 'tidak', label: 'Tidak', probability: 85, totalBets: 4760, volume: 2975000000 },
    ]
  },
  {
    id: 'konser-coldplay-jakarta-2026',
    title: 'Coldplay akan konser di Jakarta 2026?',
    description: 'Prediksi apakah band Coldplay akan mengadakan konser di Jakarta pada tahun 2026.',
    category: 'hiburan',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    endDate: '2026-12-31',
    totalVolume: 2800000000,
    totalBets: 8900,
    status: 'active',
    trending: true,
    createdAt: '2026-01-10',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 40, totalBets: 3560, volume: 1120000000 },
      { id: 'tidak', label: 'Tidak', probability: 60, totalBets: 5340, volume: 1680000000 },
    ]
  },

  // TEKNOLOGI
  {
    id: 'gojek-tokopedia-ipo-2026',
    title: 'GoTo akan melakukan stock split di 2026?',
    description: 'Prediksi apakah PT GoTo Gojek Tokopedia Tbk akan melakukan stock split pada tahun 2026.',
    category: 'teknologi',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    endDate: '2026-12-31',
    totalVolume: 6500000000,
    totalBets: 4800,
    status: 'active',
    createdAt: '2026-01-05',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 35, totalBets: 1680, volume: 2275000000 },
      { id: 'tidak', label: 'Tidak', probability: 65, totalBets: 3120, volume: 4225000000 },
    ]
  },
  {
    id: 'bitcoin-indonesia-regulation-2026',
    title: 'Indonesia akan meregulasi Bitcoin sebagai alat pembayaran di 2026?',
    description: 'Prediksi apakah pemerintah Indonesia akan mengeluarkan regulasi yang mengizinkan Bitcoin sebagai alat pembayaran legal.',
    category: 'teknologi',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    endDate: '2026-12-31',
    totalVolume: 9200000000,
    totalBets: 7500,
    status: 'active',
    trending: true,
    createdAt: '2026-01-01',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 20, totalBets: 1500, volume: 1840000000 },
      { id: 'tidak', label: 'Tidak', probability: 80, totalBets: 6000, volume: 7360000000 },
    ]
  },

  // SOSIAL
  {
    id: 'umr-jakarta-2027',
    title: 'UMR Jakarta 2027 di atas Rp 5.5 juta?',
    description: 'Prediksi apakah Upah Minimum Regional Jakarta tahun 2027 akan ditetapkan di atas Rp 5.500.000.',
    category: 'sosial',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    endDate: '2026-11-30',
    totalVolume: 4200000000,
    totalBets: 6200,
    status: 'active',
    createdAt: '2026-01-01',
    outcomes: [
      { id: 'ya', label: 'Ya, di atas 5.5 juta', probability: 55, totalBets: 3410, volume: 2310000000 },
      { id: 'tidak', label: 'Tidak', probability: 45, totalBets: 2790, volume: 1890000000 },
    ]
  },

  // HUKUM
  {
    id: 'kasus-korupsi-besar-2026',
    title: 'Akan ada penangkapan koruptor dengan kerugian > 1 Triliun di 2026?',
    description: 'Prediksi apakah KPK akan menangkap tersangka kasus korupsi dengan kerugian negara di atas 1 triliun rupiah pada 2026.',
    category: 'hukum',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    endDate: '2026-12-31',
    totalVolume: 5800000000,
    totalBets: 4500,
    status: 'active',
    createdAt: '2026-01-01',
    source: 'KPK',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 70, totalBets: 3150, volume: 4060000000 },
      { id: 'tidak', label: 'Tidak', probability: 30, totalBets: 1350, volume: 1740000000 },
    ]
  },

  // INTERNASIONAL
  {
    id: 'asean-chair-2026',
    title: 'Indonesia akan menjadi Ketua ASEAN 2026?',
    description: 'Prediksi apakah Indonesia akan memegang posisi Ketua ASEAN pada tahun 2026.',
    category: 'internasional',
    imageUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800',
    endDate: '2026-01-31',
    totalVolume: 2100000000,
    totalBets: 1800,
    status: 'active',
    createdAt: '2026-01-01',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 10, totalBets: 180, volume: 210000000 },
      { id: 'tidak', label: 'Tidak (Malaysia)', probability: 90, totalBets: 1620, volume: 1890000000 },
    ]
  },
  {
    id: 'indonesia-brics-2026',
    title: 'Indonesia akan resmi bergabung BRICS di 2026?',
    description: 'Prediksi apakah Indonesia akan menjadi anggota resmi BRICS pada tahun 2026.',
    category: 'internasional',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
    endDate: '2026-12-31',
    totalVolume: 7500000000,
    totalBets: 5600,
    status: 'active',
    featured: true,
    createdAt: '2026-01-10',
    outcomes: [
      { id: 'ya', label: 'Ya', probability: 75, totalBets: 4200, volume: 5625000000 },
      { id: 'tidak', label: 'Tidak', probability: 25, totalBets: 1400, volume: 1875000000 },
    ]
  },
];

export function getMarketById(id: string): Market | undefined {
  return markets.find(market => market.id === id);
}

export function getMarketsByCategory(category: string): Market[] {
  return markets.filter(market => market.category === category);
}

export function getFeaturedMarkets(): Market[] {
  return markets.filter(market => market.featured);
}

export function getTrendingMarkets(): Market[] {
  return markets.filter(market => market.trending);
}

export function getActiveMarkets(): Market[] {
  return markets.filter(market => market.status === 'active');
}
