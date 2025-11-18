// backend-server/src/api/test.routes.ts
// PHIÊN BẢN CUỐI CÙNG (Đã thêm /trends và /run-all-collectors)

import { Router, Request, Response } from 'express';
import { fetchNewsFromApify } from '../collectors/apify.collector';
import { fetchNewsFromReddit } from '../collectors/reddit.collector';
import { fetchVideosFromYouTube } from '../collectors/youtube.collector';
import { fetchGoogleTrends } from '../collectors/trends.collector';
// --- (MỚI) Import hàm kích hoạt Lịch chạy (Scheduler) ---
import { runAutomatedCollection } from '../services/scheduler.service';

const router = Router();

// --- (MỚI) API Test Toàn bộ Hệ thống ---

/**
 * [TEST] GET /api/test/run-all-collectors
 * Kích hoạt Toàn bộ Lịch chạy (Scheduler) ngay lập tức.
 * (Giống hệt như cron job 4 giờ)
 */
router.get('/run-all-collectors', (req: Request, res: Response) => {
  try {
    console.log('[API-Test] Yêu cầu KÍCH HOẠT THỦ CÔNG: runAutomatedCollection');
    
    // KHÔNG "await". 
    // Chúng ta muốn API trả về ngay lập tức, và để job chạy trong nền.
    runAutomatedCollection(); 
  
    res.status(202).json({ 
      message: 'Đã kích hoạt. Job đang chạy trong nền. Kiểm tra server logs để xem chi tiết.' 
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error triggering scheduler', error: error.message });
  }
});


// --- Các API Test Cảm biến Đơn lẻ ---

/**
 * GET /api/test/reddit
 * Kích hoạt kiểm tra cảm biến Reddit
 */
router.get('/reddit', async (req: Request, res: Response) => {
  try {
    console.log('[API-Test] Received request for Reddit test...');
    const results = await fetchNewsFromReddit('vietnam');
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Error testing Reddit', error: error.message });
  }
});

/**
 * GET /api/test/apify
 * Kích hoạt kiểm tra cảm biến Apify
 */
router.get('/apify', async (req: Request, res: Response) => {
  try {
    console.log('[API-Test] Received request for Apify test...');
    // (Bạn có thể đổi URL này để test)
    const results = await fetchNewsFromApify('https://vnexpress.net'); 
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Error testing Apify', error: error.message });
  }
});

/**
 * GET /api/test/youtube
 * Kích hoạt kiểm tra cảm biến YouTube
 */
router.get('/youtube', async (req: Request, res: Response) => {
  try {
    console.log('[API-Test] Received request for YouTube test...');
    const results = await fetchVideosFromYouTube('Vinfast review');
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Error testing YouTube', error: error.message });
  }
});

/**
 * GET /api/test/trends
 * Kích hoạt kiểm tra cảm biến Google Trends
 */
router.get('/trends', async (req: Request, res: Response) => {
  try {
    console.log('[API-Test] Received request for Google Trends test...');
    const results = await fetchGoogleTrends('Vinfast');
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Error testing Google Trends', error: error.message });
  }
});

export default router;