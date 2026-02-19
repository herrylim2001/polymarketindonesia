import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchNewsForMarket } from '@/lib/news';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/news/market/[id] - Get news related to a specific market
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const refresh = searchParams.get('refresh') === 'true';

    // Get market details
    const market = await prisma.market.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
      },
    });

    if (!market) {
      return NextResponse.json(
        { success: false, error: 'Market tidak ditemukan' },
        { status: 404 }
      );
    }

    // Extract keywords from market title and description
    const marketKeywords = extractMarketKeywords(market.title, market.description);

    // Fetch related news
    const news = await fetchNewsForMarket(market.title, marketKeywords);

    // Apply limit
    const limitedNews = news.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        market: {
          id: market.id,
          title: market.title,
          category: market.category,
        },
        news: limitedNews,
        keywords: marketKeywords,
      },
      meta: {
        total: limitedNews.length,
        refreshed: refresh,
      },
    });
  } catch (error) {
    console.error('Error fetching market news:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil berita terkait' },
      { status: 500 }
    );
  }
}

// Extract relevant keywords from market title and description
function extractMarketKeywords(title: string, description: string): string[] {
  const text = `${title} ${description}`;

  // Common stopwords to filter out
  const stopwords = new Set([
    'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'dengan', 'untuk',
    'pada', 'adalah', 'akan', 'juga', 'atau', 'dalam', 'tidak', 'ada',
    'bisa', 'sudah', 'setelah', 'oleh', 'karena', 'saat', 'bahwa',
    'lebih', 'tersebut', 'telah', 'apakah', 'sebelum', 'sesudah',
    'tahun', 'bulan', 'hari', 'minggu',
  ]);

  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));

  // Get unique keywords, prioritizing longer words
  const uniqueWords = Array.from(new Set(words))
    .sort((a, b) => b.length - a.length)
    .slice(0, 10);

  return uniqueWords;
}
