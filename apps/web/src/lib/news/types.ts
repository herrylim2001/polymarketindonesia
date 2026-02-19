// News types

export interface NewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
  author: string | null;
  publishedAt: Date;
  category?: string;
  keywords?: string[];
}

export interface NewsSource {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  rssUrl?: string;
  type: 'rss' | 'api';
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  author?: string;
  content?: string;
  'content:encoded'?: string;
  enclosure?: {
    url: string;
  };
  'media:content'?: {
    url: string;
  };
}

// Indonesian news sources configuration
export const INDONESIAN_NEWS_SOURCES: NewsSource[] = [
  // Major News Portals
  {
    id: 'kompas',
    name: 'kompas',
    displayName: 'Kompas.com',
    baseUrl: 'https://www.kompas.com',
    rssUrl: 'https://rss.kompas.com/all',
    type: 'rss',
  },
  {
    id: 'detik',
    name: 'detik',
    displayName: 'Detik.com',
    baseUrl: 'https://www.detik.com',
    rssUrl: 'https://rss.detik.com/index.php/detikcom',
    type: 'rss',
  },
  {
    id: 'cnnindonesia',
    name: 'cnnindonesia',
    displayName: 'CNN Indonesia',
    baseUrl: 'https://www.cnnindonesia.com',
    rssUrl: 'https://www.cnnindonesia.com/rss',
    type: 'rss',
  },
  {
    id: 'tribun',
    name: 'tribun',
    displayName: 'Tribunnews',
    baseUrl: 'https://www.tribunnews.com',
    rssUrl: 'https://www.tribunnews.com/rss',
    type: 'rss',
  },
  {
    id: 'tempo',
    name: 'tempo',
    displayName: 'Tempo.co',
    baseUrl: 'https://www.tempo.co',
    rssUrl: 'https://rss.tempo.co/nasional',
    type: 'rss',
  },
  {
    id: 'liputan6',
    name: 'liputan6',
    displayName: 'Liputan6',
    baseUrl: 'https://www.liputan6.com',
    rssUrl: 'https://www.liputan6.com/rss',
    type: 'rss',
  },
  // National News Agency
  {
    id: 'antara',
    name: 'antara',
    displayName: 'Antara News',
    baseUrl: 'https://www.antaranews.com',
    rssUrl: 'https://www.antaranews.com/rss/terkini',
    type: 'rss',
  },
  // Business & Finance
  {
    id: 'cnbcindonesia',
    name: 'cnbcindonesia',
    displayName: 'CNBC Indonesia',
    baseUrl: 'https://www.cnbcindonesia.com',
    rssUrl: 'https://www.cnbcindonesia.com/rss',
    type: 'rss',
  },
  {
    id: 'bisnis',
    name: 'bisnis',
    displayName: 'Bisnis.com',
    baseUrl: 'https://www.bisnis.com',
    rssUrl: 'https://www.bisnis.com/rss',
    type: 'rss',
  },
  {
    id: 'kontan',
    name: 'kontan',
    displayName: 'Kontan',
    baseUrl: 'https://www.kontan.co.id',
    rssUrl: 'https://www.kontan.co.id/rss',
    type: 'rss',
  },
  // Other Major Portals
  {
    id: 'republika',
    name: 'republika',
    displayName: 'Republika',
    baseUrl: 'https://www.republika.co.id',
    rssUrl: 'https://www.republika.co.id/rss',
    type: 'rss',
  },
  {
    id: 'okezone',
    name: 'okezone',
    displayName: 'Okezone',
    baseUrl: 'https://www.okezone.com',
    rssUrl: 'https://sindikasi.okezone.com/index.php/rss/1/RSS2.0',
    type: 'rss',
  },
  {
    id: 'sindonews',
    name: 'sindonews',
    displayName: 'SINDOnews',
    baseUrl: 'https://www.sindonews.com',
    rssUrl: 'https://index.sindonews.com/rss',
    type: 'rss',
  },
  {
    id: 'medcom',
    name: 'medcom',
    displayName: 'Medcom.id',
    baseUrl: 'https://www.medcom.id',
    rssUrl: 'https://www.medcom.id/rss/all',
    type: 'rss',
  },
  // Sports
  {
    id: 'bolasport',
    name: 'bolasport',
    displayName: 'Bola Sport',
    baseUrl: 'https://www.bolasport.com',
    rssUrl: 'https://www.bolasport.com/rss',
    type: 'rss',
  },
  // Tech
  {
    id: 'tekno',
    name: 'tekno',
    displayName: 'Tekno Kompas',
    baseUrl: 'https://tekno.kompas.com',
    rssUrl: 'https://rss.kompas.com/tekno',
    type: 'rss',
  },
];

// Category mappings from news source categories to our categories
export const CATEGORY_MAPPINGS: Record<string, string> = {
  // Politik
  politik: 'politik',
  nasional: 'politik',
  pemerintahan: 'politik',
  pilpres: 'politik',
  pemilu: 'politik',
  dpr: 'politik',

  // Ekonomi
  ekonomi: 'ekonomi',
  bisnis: 'ekonomi',
  finance: 'ekonomi',
  market: 'ekonomi',
  saham: 'ekonomi',
  crypto: 'ekonomi',

  // Olahraga
  olahraga: 'olahraga',
  sport: 'olahraga',
  bola: 'olahraga',
  sepakbola: 'olahraga',
  timnas: 'olahraga',

  // Hiburan
  hiburan: 'hiburan',
  entertainment: 'hiburan',
  seleb: 'hiburan',
  musik: 'hiburan',
  film: 'hiburan',

  // Teknologi
  teknologi: 'teknologi',
  tech: 'teknologi',
  digital: 'teknologi',
  gadget: 'teknologi',
  ai: 'teknologi',

  // Hukum
  hukum: 'hukum',
  kriminal: 'hukum',
  peradilan: 'hukum',

  // Internasional
  internasional: 'internasional',
  dunia: 'internasional',
  global: 'internasional',
};
