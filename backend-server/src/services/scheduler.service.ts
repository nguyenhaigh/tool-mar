// backend-server/src/services/scheduler.service.ts
// (PHIÊN BẢN v2 - TÁI KIẾN TRÚC ĐỘNG - GIAI ĐOẠN 2.2)

import cron from 'node-cron';
import { randomUUID } from 'crypto';

// --- Import TẤT CẢ các Cảm biến ---
import { fetchNewsFromGNews, RawArticle } from '../collectors/gnews.collector';
import { fetchNewsFromReddit } from '../collectors/reddit.collector';
import { fetchNewsFromApify } from '../collectors/apify.collector';
// (MỚI) Import cảm biến YouTube an toàn, đã được tái cấu trúc
import { fetchVideoUrlsFromYouTube } from '../collectors/youtube.collector';

import { suggestLabels } from './gemini.service';
import { query } from './database.service';
import { sendCrisisAlert } from './alert.service';

// Helper điều tốc (giữ nguyên)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Định nghĩa kiểu dữ liệu chung (giữ nguyên)
interface UniversalRawContent {
  id: string;
  title: string;
  content: string;
  url: string;
  sourceName: string;
  sourceType: 'GNews' | 'Reddit' | 'Scraping' | 'YouTube';
}

// (MỚI) Định nghĩa kiểu dữ liệu cho "Danh sách Mục tiêu" từ CSDL
interface Target {
  id: string;
  target_name: string;
  target_type: 'GNEWS_KEYWORD' | 'YOUTUBE_KEYWORD' | 'REDDIT_SUB' | 'APIFY_URL';
  target_value: string;
}

/**
 * Khởi động Lịch chạy (giữ nguyên)
 */
export function startScheduler() {
  console.log('[Scheduler] Starting scheduler service...');

  cron.schedule('0 */4 * * *', () => {
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    console.log(`[CRON - ${now}] Running Target-Driven Collection Job...`);
    runAutomatedCollection();
  });

  console.log('[Scheduler] All jobs have been scheduled.');
}

/**
 * (TÁI KIẾN TRÚC) Logic chính của Luồng Tự động (WF2)
 * 1. ĐỌC "Danh sách Mục tiêu" (targets) từ CSDL.
 * 2. Gọi các "Cảm biến" tương ứng một cách linh hoạt.
 * 3. Xử lý (AI, Cảnh báo, Lưu trữ) như cũ.
 */
export async function runAutomatedCollection() {
  let targets: Target[] = [];
  try {
    // 1. Đọc "Danh sách Mục tiêu" (Nhiệm vụ 2.1) từ CSDL Neon
    console.log('[Scheduler] Fetching active targets from Database...');
    const targetsResult = await query(
      "SELECT * FROM targets WHERE is_active = true"
    );
    targets = targetsResult.rows;

    if (targets.length === 0) {
      console.log('[Scheduler] No active targets found. Job finished.');
      return;
    }

    console.log(`[Scheduler] Found ${targets.length} active targets. Dispatching collectors...`);

    // 2. Tạo một mảng các "lời hứa" (promises) để chạy song song
    const collectorPromises: Promise<UniversalRawContent[]>[] = [];

    for (const target of targets) {
      // 3. Phân loại và gọi đúng Cảm biến
      switch (target.target_type) {
        
        case 'GNEWS_KEYWORD':
          collectorPromises.push(fetchNewsFromGNews(target.target_value));
          break;
          
        case 'YOUTUBE_KEYWORD':
          // (MỚI) Gọi cảm biến YouTube an toàn
          collectorPromises.push(fetchVideoUrlsFromYouTube(target.target_value));
          break;
          
        case 'REDDIT_SUB':
          collectorPromises.push(fetchNewsFromReddit(target.target_value));
          break;
          
        case 'APIFY_URL':
          collectorPromises.push(fetchNewsFromApify(target.target_value));
          break;
          
        default:
          console.warn(`[Scheduler] Unknown target_type: ${target.target_type}`);
      }
    }

    // 4. Chạy tất cả các cảm biến song song (an toàn)
    const results = await Promise.allSettled(collectorPromises);

    // 5. Gộp tất cả kết quả thành một mảng duy nhất
    const allContent: UniversalRawContent[] = [];
    
    results.forEach((result, index) => {
      const target = targets[index]; // Lấy mục tiêu tương ứng
      
      if (result.status === 'fulfilled') {
        const items = result.value;
        
        // Logic chuẩn hóa GNews (giữ nguyên)
        if (target.target_type === 'GNEWS_KEYWORD') {
          allContent.push(
            ...(items as RawArticle[]).map(a => ({
              id: a.url,
              title: a.title,
              content: `Title: ${a.title}. Description: ${a.description}. Content: ${a.content}`,
              url: a.url,
              sourceName: a.source.name,
              sourceType: 'GNews'
            }))
          );
        } else {
          // Tất cả cảm biến khác (Reddit, YouTube, Apify) đã trả về đúng định dạng
          allContent.push(...(items as UniversalRawContent[]));
        }
        
      } else {
        // Log lỗi nếu một cảm biến thất bại, nhưng không dừng hệ thống
        console.error(
          `[Scheduler] Collector FAILED for target "${target.target_name}":`,
          result.reason
        );
      }
    });

    // --- 6. Logic Xử lý (Giữ nguyên) ---

    if (allContent.length === 0) {
      console.log('[Scheduler] No new content found from any collector. Job finished.');
      return;
    }

    console.log(`[Scheduler] Processing ${allContent.length} total new items...`);
    let processedCount = 0;

    for (const item of allContent) {
      try {
        // 6a. Dùng AI gán nhãn
        const labels = await suggestLabels(item.content);

        // 6b. Kiểm tra Cảnh báo (WF3)
        if (labels.sentiment === 'Negative' && labels.topic === 'Campaign') {
          console.warn(`[Scheduler] CRISIS DETECTED! Sending alert for item: ${item.title}`);
          sendCrisisAlert({ url: item.url, raw_content: item.content }, labels);
        }

        // 6c. Lưu vào CSDL (đã sửa lỗi)
        await query(
          `INSERT INTO insights_processed 
            (id, timestamp, source_url, raw_content, sentiment, topic, source_type) 
           VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
          [
            randomUUID(),
            item.url,
            item.content,
            labels.sentiment,
            labels.topic,
            item.sourceType 
          ]
        );
        processedCount++;

      } catch (itemError) {
        console.error(`[Scheduler] Error processing item "${item.title}"`, itemError);
      }

      // 6d. Điều tốc (giữ nguyên)
      await sleep(6000); 

    } // <-- Kết thúc vòng lặp for

    console.log(`[Scheduler] Job finished. Successfully processed ${processedCount}/${allContent.length} items from ${targets.length} targets.`);

  } catch (jobError) {
    console.error('[Scheduler] Critical error in automated collection job', jobError);
  }
}