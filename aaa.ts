// backend-server/src/collectors/youtube.collector.ts
// (PHIÊN BẢN MỚI v2 - Chỉ lấy URL, đã loại bỏ gỡ băng)

import { google } from 'googleapis';
import config from '../config';
import { UniversalRawContent } from './reddit.collector'; // Dùng lại kiểu chung

const youtube = google.youtube({
  version: 'v3',
  auth: config.youtubeApiKey,
});

/**
 * CHỈ TÌM KIẾM video trên YouTube và trả về URL
 * @param keyword Từ khóa tìm kiếm
 */
export async function fetchVideoUrlsFromYouTube(
  keyword: string
): Promise<UniversalRawContent[]> {
  if (!config.youtubeApiKey) {
    console.warn('[YouTube] YOUTUBE_API_KEY is not set. Skipping.');
    return [];
  }

  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: keyword,
      type: ['video'],
      order: 'date',
      maxResults: 10, // Lấy 10 video mới nhất
    });

    const items = response.data.items;
    if (!items || items.length === 0) {
      console.log(`[YouTube] No new videos found for keyword: "${keyword}"`);
      return [];
    }

    console.log(`[YouTube] Fetched ${items.length} video URLs for keyword: "${keyword}"`);

    // Chuẩn hóa dữ liệu về dạng chung
    return items.map((item) => ({
      id: item.id!.videoId!,
      title: item.snippet!.title!,
      // (MỚI) Chúng ta vẫn cung cấp nội dung cho AI, nhưng không phải là bản gỡ băng
      content: `Title: ${item.snippet!.title!}. Description: ${
        item.snippet!.description!
      }`,
      url: `https://www.youtube.com/watch?v=${item.id!.videoId!}`,
      sourceName: item.snippet!.channelTitle!,
      sourceType: 'YouTube',
    }));
  } catch (error: any) {
    console.error(
      `[YouTube] Error fetching videos for keyword "${keyword}": ${error.message}`
    );
    return [];
  }
}