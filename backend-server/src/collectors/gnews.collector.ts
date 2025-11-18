// backend-server/src/collectors/gnews.collector.ts
import axios from 'axios';
import config from '../config';

const GNEWS_API_URL = 'https://gnews.io/api/v4/search';

// Định nghĩa kiểu dữ liệu cho một bài báo trả về
export interface RawArticle {
  title: string;
  description: string;
  content: string; // Nội dung đầy đủ
  url: string;     // Link gốc
  source: {
    name: string;
  };
}

/**
 * Thu thập tin tức từ GNews API
 * @param keyword Từ khóa tìm kiếm (ví dụ: 'Vinfast')
 * @returns Một mảng các bài báo thô
 */
export async function fetchNewsFromGNews(keyword: string): Promise<RawArticle[]> {
  if (!config.gnewsApiKey) {
    console.warn('[GNews] GNEWS_API_KEY is not set. Skipping collection.');
    return []; // Trả về mảng rỗng nếu không có key
  }

  try {
    const response = await axios.get(GNEWS_API_URL, {
      params: {
        q: keyword,
        lang: 'vi', // Lấy tin tiếng Việt
        country: 'vn',
        max: 5,     // Lấy 5 tin mới nhất
        apikey: config.gnewsApiKey,
      },
    });

    const articles = response.data.articles as RawArticle[];

    console.log(`[GNews] Fetched ${articles.length} articles for keyword: "${keyword}"`);
    return articles;

  } catch (error: any) {
    // Xử lý lỗi từ GNews (ví dụ: hết hạn key,...)
    if (error.response) {
      console.error(`[GNews] Error fetching news: ${error.response.data.message}`);
    } else {
      console.error(`[GNews] Error: ${error.message}`);
    }
    return []; // Trả về mảng rỗng khi có lỗi
  }
}