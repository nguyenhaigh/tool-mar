// backend-server/src/api/export.routes.ts
import { Router, Request, Response } from 'express';
import { exportToGoogleSheet } from '../services/export.service';

const router = Router();

/**
 * GET /api/export/googlesheet
 * Kích hoạt việc xuất dữ liệu từ DB sang Google Sheet
 */
router.get('/googlesheet', async (req: Request, res: Response) => {
  try {
    console.log('[API] Received request for Google Sheet export...');
    const result = await exportToGoogleSheet();
    res.status(200).json(result);
  } catch (error: any) {
    console.error('[API] Error exporting to Google Sheet:', error.message);
    res.status(500).json({ message: 'Error exporting to Google Sheet', error: error.message });
  }
});

export default router;