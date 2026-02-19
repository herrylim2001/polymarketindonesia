import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews, fetchTrendingNews, fetchNewsByCategory } from '@/lib/news';

// GET /api/news - Get news articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'trending';
    const category = searchParams.get('category');
    const sources = searchParams.get('sources')?.split(',');
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    let news;

    switch (type) {
      case 'trending':
        news = await fetchTrendingNews();
        break;

      case 'category':
        if (!category) {
          return NextResponse.json(
            { success: false, error: 'Category parameter required' },
            { status: 400 }
          );
        }
        news = await fetchNewsByCategory(category);
        break;

      case 'search':
        news = await fetchAllNews({ query: query || undefined, sources });
        break;

      default:
        news = await fetchAllNews({ sources });
    }

    // Apply limit
    news = news.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: news,
      meta: {
        total: news.length,
        type,
        category,
        query,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil berita' },
      { status: 500 }
    );
  }
}
