import {
  NewsArticle,
  NewsAPIResponse,
  RSSItem,
  INDONESIAN_NEWS_SOURCES,
  CATEGORY_MAPPINGS,
  NewsSource,
} from './types';

// Parse RSS XML to JSON
async function parseRSS(xml: string): Promise<RSSItem[]> {
  const items: RSSItem[] = [];

  // Simple regex-based RSS parser
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const matches = Array.from(xml.matchAll(itemRegex));

  for (const match of matches) {
    const itemXml = match[1];

    const getTagContent = (tag: string): string | undefined => {
      const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const tagMatch = itemXml.match(regex);
      if (tagMatch) {
        return (tagMatch[1] || tagMatch[2] || '').trim();
      }
      return undefined;
    };

    const getEnclosureUrl = (): string | undefined => {
      const enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
      return enclosureMatch?.[1];
    };

    const getMediaUrl = (): string | undefined => {
      const mediaMatch = itemXml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
      return mediaMatch?.[1];
    };

    items.push({
      title: getTagContent('title') || '',
      link: getTagContent('link') || '',
      description: getTagContent('description'),
      pubDate: getTagContent('pubDate'),
      author: getTagContent('author') || getTagContent('dc:creator'),
      content: getTagContent('content:encoded') || getTagContent('content'),
      enclosure: getEnclosureUrl() ? { url: getEnclosureUrl()! } : undefined,
      'media:content': getMediaUrl() ? { url: getMediaUrl()! } : undefined,
    });
  }

  return items;
}

// Fetch news from RSS feed
async function fetchRSSNews(source: NewsSource): Promise<NewsArticle[]> {
  if (!source.rssUrl) return [];

  try {
    const response = await fetch(source.rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PolyIDBot/1.0)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Failed to fetch RSS from ${source.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const items = await parseRSS(xml);

    return items
      .filter(item => item.title && item.link)
      .map(item => ({
        title: item.title,
        description: item.description || null,
        content: item.content || item['content:encoded'] || null,
        imageUrl: item.enclosure?.url || item['media:content']?.url || null,
        sourceUrl: item.link,
        sourceName: source.name,
        author: item.author || null,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        keywords: extractKeywords(item.title + ' ' + (item.description || '')),
      }));
  } catch (error) {
    console.error(`Error fetching RSS from ${source.name}:`, error);
    return [];
  }
}

// Fetch news from NewsAPI.org
async function fetchNewsAPI(query?: string, category?: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn('NEWS_API_KEY not set, skipping NewsAPI fetch');
    return [];
  }

  try {
    const params = new URLSearchParams({
      apiKey,
      language: 'id',
      country: 'id',
      pageSize: '20',
    });

    if (query) {
      params.set('q', query);
    }

    if (category) {
      params.set('category', category);
    }

    const url = query
      ? `https://newsapi.org/v2/everything?${params}`
      : `https://newsapi.org/v2/top-headlines?${params}`;

    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`NewsAPI error: ${response.status}`);
      return [];
    }

    const data: NewsAPIResponse = await response.json();

    return data.articles.map(article => ({
      title: article.title,
      description: article.description,
      content: article.content,
      imageUrl: article.urlToImage,
      sourceUrl: article.url,
      sourceName: article.source.name.toLowerCase().replace(/\s/g, ''),
      author: article.author,
      publishedAt: new Date(article.publishedAt),
      keywords: extractKeywords(article.title + ' ' + (article.description || '')),
    }));
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return [];
  }
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  // Common Indonesian stopwords to filter out
  const stopwords = new Set([
    'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'dengan', 'untuk',
    'pada', 'adalah', 'akan', 'juga', 'atau', 'dalam', 'tidak', 'ada',
    'bisa', 'sudah', 'setelah', 'oleh', 'karena', 'saat', 'bahwa',
    'lebih', 'tersebut', 'telah', 'mereka', 'ia', 'kami', 'kita',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  ]);

  // Extract words and filter
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopwords.has(word));

  // Return unique keywords
  return Array.from(new Set(words)).slice(0, 20);
}

// Determine category from keywords
export function detectCategory(keywords: string[]): string | undefined {
  for (const keyword of keywords) {
    const mappedCategory = CATEGORY_MAPPINGS[keyword.toLowerCase()];
    if (mappedCategory) {
      return mappedCategory;
    }
  }
  return undefined;
}

// Main function to fetch all news
export async function fetchAllNews(options?: {
  sources?: string[];
  query?: string;
  category?: string;
}): Promise<NewsArticle[]> {
  const sources = options?.sources
    ? INDONESIAN_NEWS_SOURCES.filter(s => options.sources!.includes(s.name))
    : INDONESIAN_NEWS_SOURCES;

  // Fetch from all RSS sources in parallel
  const rssPromises = sources.map(source => fetchRSSNews(source));

  // Also fetch from NewsAPI if query is provided
  const newsAPIPromise = options?.query
    ? fetchNewsAPI(options.query, options.category)
    : Promise.resolve([]);

  const results = await Promise.allSettled([...rssPromises, newsAPIPromise]);

  const allNews: NewsArticle[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  }

  // Sort by published date
  allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  // Add detected categories
  return allNews.map(article => ({
    ...article,
    category: article.category || detectCategory(article.keywords || []),
  }));
}

// Fetch news related to a specific topic/market
export async function fetchNewsForMarket(
  marketTitle: string,
  marketKeywords?: string[]
): Promise<NewsArticle[]> {
  // Extract search terms from market title
  const searchTerms = extractKeywords(marketTitle);
  const allKeywords = [...searchTerms, ...(marketKeywords || [])];

  // Build search query
  const query = allKeywords.slice(0, 5).join(' OR ');

  // Fetch news with the query
  const news = await fetchAllNews({ query });

  // Score and filter relevant articles
  return news
    .map(article => ({
      ...article,
      relevanceScore: calculateRelevance(article, allKeywords),
    }))
    .filter(article => article.relevanceScore > 20)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);
}

// Calculate relevance score between article and keywords
function calculateRelevance(article: NewsArticle, keywords: string[]): number {
  const articleText = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  const articleKeywords = new Set(article.keywords || []);

  let score = 0;

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();

    // Title match (highest weight)
    if (article.title.toLowerCase().includes(keywordLower)) {
      score += 30;
    }

    // Description match
    if (article.description?.toLowerCase().includes(keywordLower)) {
      score += 20;
    }

    // Content match
    if (articleText.includes(keywordLower)) {
      score += 10;
    }

    // Keyword match
    if (articleKeywords.has(keywordLower)) {
      score += 15;
    }
  }

  // Normalize score (max 100)
  return Math.min(100, score);
}

// Fetch news by category
export async function fetchNewsByCategory(category: string): Promise<NewsArticle[]> {
  const news = await fetchAllNews();

  return news
    .filter(article => article.category === category)
    .slice(0, 20);
}

// Fetch trending/top news
export async function fetchTrendingNews(): Promise<NewsArticle[]> {
  const news = await fetchAllNews();
  return news.slice(0, 20);
}
