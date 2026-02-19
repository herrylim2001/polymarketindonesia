'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw, AlertCircle } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
  author: string | null;
  publishedAt: string;
  category?: string;
  relevanceScore?: number;
}

interface NewsFeedProps {
  marketId?: string;
  category?: string;
  limit?: number;
  showRefresh?: boolean;
  compact?: boolean;
}

export default function NewsFeed({
  marketId,
  category,
  limit = 5,
  showRefresh = true,
  compact = false,
}: NewsFeedProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      let url = '/api/news';
      const params = new URLSearchParams();

      if (marketId) {
        url = `/api/news/market/${marketId}`;
        if (refresh) params.set('refresh', 'true');
      } else if (category) {
        params.set('type', 'category');
        params.set('category', category);
      } else {
        params.set('type', 'trending');
      }

      params.set('limit', limit.toString());

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

      if (data.success) {
        setNews(marketId ? data.data.news : data.data);
        setError(null);
      } else {
        setError(data.error || 'Gagal memuat berita');
      }
    } catch (err) {
      setError('Gagal memuat berita');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [marketId, category, limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} menit lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const getSourceColor = (sourceName: string): string => {
    const colors: Record<string, string> = {
      // Major News Portals
      kompas: 'bg-blue-100 text-blue-800',
      detik: 'bg-red-100 text-red-800',
      cnnindonesia: 'bg-orange-100 text-orange-800',
      tribun: 'bg-green-100 text-green-800',
      tempo: 'bg-purple-100 text-purple-800',
      liputan6: 'bg-yellow-100 text-yellow-800',
      // National News Agency
      antara: 'bg-teal-100 text-teal-800',
      // Business & Finance
      cnbcindonesia: 'bg-sky-100 text-sky-800',
      bisnis: 'bg-emerald-100 text-emerald-800',
      kontan: 'bg-amber-100 text-amber-800',
      // Other Portals
      republika: 'bg-lime-100 text-lime-800',
      okezone: 'bg-rose-100 text-rose-800',
      sindonews: 'bg-cyan-100 text-cyan-800',
      medcom: 'bg-indigo-100 text-indigo-800',
      // Sports
      bolasport: 'bg-green-100 text-green-800',
      // Tech
      tekno: 'bg-violet-100 text-violet-800',
    };
    return colors[sourceName.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Newspaper className="w-5 h-5" />
          <span className="font-medium">Berita Terkait</span>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-100 h-3 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => fetchNews()}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Belum ada berita terkait</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <Newspaper className="w-5 h-5" />
          <span className="font-semibold">Berita Terkait</span>
        </div>
        {showRefresh && (
          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* News List */}
      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        {news.map((article, index) => (
          <a
            key={index}
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block group ${
              compact
                ? 'py-2 border-b border-gray-100 last:border-0'
                : 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
            }`}
          >
            <div className={compact ? '' : 'flex gap-4'}>
              {/* Image (only for non-compact) */}
              {!compact && article.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Source badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSourceColor(
                      article.sourceName
                    )}`}
                  >
                    {article.sourceName.charAt(0).toUpperCase() +
                      article.sourceName.slice(1)}
                  </span>
                  {article.relevanceScore && article.relevanceScore > 70 && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Relevan
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 ${
                    compact ? 'text-sm' : 'text-base'
                  }`}
                >
                  {article.title}
                </h3>

                {/* Description (only for non-compact) */}
                {!compact && article.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {article.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(article.publishedAt)}
                  </span>
                  {article.author && !compact && (
                    <span className="truncate">{article.author}</span>
                  )}
                  <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* View more link */}
      {news.length >= limit && (
        <a
          href={`/news${category ? `?category=${category}` : ''}`}
          className="block text-center text-sm text-blue-600 hover:underline py-2"
        >
          Lihat lebih banyak berita
        </a>
      )}
    </div>
  );
}
