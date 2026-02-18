import { PrismaClient, Category, MarketStatus, KycStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@polyid.id' },
    update: {},
    create: {
      email: 'admin@polyid.id',
      username: 'admin',
      passwordHash: adminPassword,
      isAdmin: true,
      kycStatus: KycStatus.VERIFIED,
      kycLevel: 3,
      referralCode: 'ADMIN2024',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test users
  const testUserPassword = await hash('password123', 12);
  const testUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'budi@example.com' },
      update: {},
      create: {
        email: 'budi@example.com',
        username: 'budi_jakarta',
        passwordHash: testUserPassword,
        balance: 1000000,
        kycStatus: KycStatus.VERIFIED,
        kycLevel: 2,
        referralCode: 'BUDI123',
      },
    }),
    prisma.user.upsert({
      where: { email: 'siti@example.com' },
      update: {},
      create: {
        email: 'siti@example.com',
        username: 'siti_bandung',
        passwordHash: testUserPassword,
        balance: 500000,
        kycStatus: KycStatus.VERIFIED,
        kycLevel: 1,
        referralCode: 'SITI456',
      },
    }),
    prisma.user.upsert({
      where: { email: 'andi@example.com' },
      update: {},
      create: {
        email: 'andi@example.com',
        username: 'andi_surabaya',
        passwordHash: testUserPassword,
        balance: 250000,
        kycStatus: KycStatus.PENDING,
        referralCode: 'ANDI789',
      },
    }),
  ]);
  console.log('✅ Test users created:', testUsers.length);

  // Create markets
  const markets = [
    {
      title: 'Apakah Prabowo akan melakukan perombakan kabinet sebelum Juni 2025?',
      description: 'Prediksi apakah Presiden Prabowo Subianto akan mengumumkan perombakan kabinet Indonesia Maju sebelum bulan Juni 2025. Market ini akan resolved berdasarkan pengumuman resmi dari Istana Negara.',
      category: Category.politik,
      endDate: new Date('2025-06-01'),
      outcomes: [
        { label: 'Ya', probability: 35 },
        { label: 'Tidak', probability: 65 },
      ],
      totalVolume: 125000000,
      totalBets: 342,
      featured: true,
      trending: true,
    },
    {
      title: 'Harga Bitcoin akan mencapai $100,000 sebelum akhir 2025?',
      description: 'Prediksi apakah harga Bitcoin (BTC) akan menyentuh atau melewati angka $100,000 USD sebelum 31 Desember 2025. Harga yang digunakan adalah harga spot dari CoinMarketCap.',
      category: Category.ekonomi,
      endDate: new Date('2025-12-31'),
      outcomes: [
        { label: 'Ya', probability: 45 },
        { label: 'Tidak', probability: 55 },
      ],
      totalVolume: 89000000,
      totalBets: 567,
      trending: true,
    },
    {
      title: 'Timnas Indonesia lolos ke Piala Dunia 2026?',
      description: 'Prediksi apakah Timnas Indonesia akan berhasil lolos ke putaran final Piala Dunia FIFA 2026 yang akan diselenggarakan di Amerika Serikat, Kanada, dan Meksiko.',
      category: Category.olahraga,
      endDate: new Date('2025-06-15'),
      outcomes: [
        { label: 'Ya', probability: 25 },
        { label: 'Tidak', probability: 75 },
      ],
      totalVolume: 256000000,
      totalBets: 1234,
      featured: true,
      trending: true,
    },
    {
      title: 'iPhone 17 akan dirilis dengan fitur AI on-device?',
      description: 'Prediksi apakah Apple akan merilis iPhone 17 dengan kemampuan AI yang berjalan sepenuhnya di perangkat (on-device AI) tanpa memerlukan koneksi cloud.',
      category: Category.teknologi,
      endDate: new Date('2025-09-30'),
      outcomes: [
        { label: 'Ya', probability: 72 },
        { label: 'Tidak', probability: 28 },
      ],
      totalVolume: 45000000,
      totalBets: 189,
    },
    {
      title: 'IKN Nusantara akan diresmikan sebagai Ibu Kota sebelum Agustus 2025?',
      description: 'Prediksi apakah Ibu Kota Nusantara (IKN) akan secara resmi menjadi ibu kota negara Indonesia sebelum HUT RI ke-80 pada 17 Agustus 2025.',
      category: Category.politik,
      endDate: new Date('2025-08-17'),
      outcomes: [
        { label: 'Ya', probability: 55 },
        { label: 'Tidak', probability: 45 },
      ],
      totalVolume: 178000000,
      totalBets: 892,
      featured: true,
    },
    {
      title: 'Film Indonesia akan memenangkan Oscar 2026?',
      description: 'Prediksi apakah film produksi Indonesia akan berhasil memenangkan piala Oscar di kategori apapun pada Academy Awards 2026.',
      category: Category.hiburan,
      endDate: new Date('2026-03-01'),
      outcomes: [
        { label: 'Ya', probability: 8 },
        { label: 'Tidak', probability: 92 },
      ],
      totalVolume: 23000000,
      totalBets: 156,
    },
    {
      title: 'KPK akan menetapkan tersangka korupsi lebih dari 50 orang di 2025?',
      description: 'Prediksi apakah Komisi Pemberantasan Korupsi (KPK) akan menetapkan lebih dari 50 tersangka baru dalam kasus korupsi selama tahun 2025.',
      category: Category.hukum,
      endDate: new Date('2025-12-31'),
      outcomes: [
        { label: 'Ya', probability: 40 },
        { label: 'Tidak', probability: 60 },
      ],
      totalVolume: 34000000,
      totalBets: 234,
    },
    {
      title: 'Rupiah akan menguat di bawah Rp 15.000/USD di Q2 2025?',
      description: 'Prediksi apakah nilai tukar Rupiah Indonesia akan menguat hingga di bawah Rp 15.000 per 1 USD pada kuartal kedua (April-Juni) 2025.',
      category: Category.ekonomi,
      endDate: new Date('2025-06-30'),
      outcomes: [
        { label: 'Ya', probability: 18 },
        { label: 'Tidak', probability: 82 },
      ],
      totalVolume: 67000000,
      totalBets: 445,
    },
  ];

  for (const marketData of markets) {
    const { outcomes, ...marketInfo } = marketData;

    const market = await prisma.market.create({
      data: {
        ...marketInfo,
        createdById: admin.id,
        liquidity: 1000000,
        outcomes: {
          create: outcomes.map((outcome) => ({
            label: outcome.label,
            probability: outcome.probability,
            shares: 500000,
          })),
        },
      },
      include: {
        outcomes: true,
      },
    });

    console.log('✅ Market created:', market.title.substring(0, 50) + '...');
  }

  // Create some sample bets
  const allMarkets = await prisma.market.findMany({
    include: { outcomes: true },
  });

  for (const user of testUsers) {
    const randomMarket = allMarkets[Math.floor(Math.random() * allMarkets.length)];
    const randomOutcome = randomMarket.outcomes[Math.floor(Math.random() * randomMarket.outcomes.length)];
    const betAmount = Math.floor(Math.random() * 100000) + 10000;

    await prisma.bet.create({
      data: {
        userId: user.id,
        marketId: randomMarket.id,
        outcomeId: randomOutcome.id,
        amount: betAmount,
        shares: betAmount / (Number(randomOutcome.probability) / 100),
        probability: randomOutcome.probability,
        avgPrice: Number(randomOutcome.probability) / 100,
        potentialPayout: betAmount / (Number(randomOutcome.probability) / 100),
      },
    });
  }
  console.log('✅ Sample bets created');

  // Create settings
  await prisma.setting.upsert({
    where: { key: 'platform_fee' },
    update: {},
    create: {
      key: 'platform_fee',
      value: { percentage: 2.5 },
    },
  });

  await prisma.setting.upsert({
    where: { key: 'referral_bonus' },
    update: {},
    create: {
      key: 'referral_bonus',
      value: { amount: 50000, percentage: 5 },
    },
  });

  await prisma.setting.upsert({
    where: { key: 'min_deposit' },
    update: {},
    create: {
      key: 'min_deposit',
      value: { amount: 50000 },
    },
  });

  await prisma.setting.upsert({
    where: { key: 'max_withdrawal' },
    update: {},
    create: {
      key: 'max_withdrawal',
      value: { daily: 10000000, monthly: 100000000 },
    },
  });

  console.log('✅ Settings created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
