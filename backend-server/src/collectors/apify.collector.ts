// backend-server/src/collectors/apify.collector.ts
// ĐÃ TỐI ƯU HÓA

import axios from 'axios';
import config from '../config';
import { UniversalRawContent } from './reddit.collector'; // Dùng lại kiểu dữ liệu chung

const ACTOR_ID = "aYG0l9s7dbB7j3gbS"; // Website Content Crawler

export async function fetchNewsFromApify(startUrl: string): Promise<UniversalRawContent[]> {
  if (!config.apifyApiToken) {
    console.warn('[Apify] APIFY_API_TOKEN is not set. Skipping collection.');
    return [];
  }

  const API_URL = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${config.apifyApiToken}`;

  try {
    console.log(`[Apify] Starting crawler for: ${startUrl}`);

    const response = await axios.post(API_URL, {
      // Input của Actor
      startUrls: [{ url: startUrl }],
      maxPages: 1, 
      maxCrawlDepth: 0, 
      // --- TỐI ƯU HÓA (THÊM VÀO) ---
      // Yêu cầu Actor chạy với 4GB RAM thay vì 8GB mặc định
      memoryMbytes: 4096 
    });

    const items = response.data;
    if (!items || items.length === 0) {
      console.log('[Apify] No items crawled.');
      return [];
    }

    const results: UniversalRawContent[] = [];

    for (const item of items) {
      if (item.text && item.text.length > 100) { 
        results.push({
          id: item.url, 
          title: item.metadata?.title || 'No Title',
          content: `Title: ${item.metadata?.title}. Content: ${item.text}`,
          url: item.url,
          sourceName: new URL(item.url).hostname, 
          sourceType: 'Scraping', // <-- ĐÃ SỬA LỖI (trước đây là 'Reddit')
        });
      }
    }

    console.log(`[Apify] Fetched ${results.length} valid pages from ${startUrl}`);
    return results;

  } catch (error: any) {
    if (error.response) {
      console.error(`[Apify] Error running actor: ${error.response.data.error.message}`);
    } else {
      console.error(`[Apify] Error: ${error.message}`);
    }
    return [];
  }
}