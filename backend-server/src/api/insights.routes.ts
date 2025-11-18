// backend-server/src/api/insights.routes.ts
import { Router, Request, Response } from 'express';
import { query } from '../services/database.service';
import { suggestLabels } from '../services/gemini.service';
import { randomUUID } from 'crypto'; // Dùng hàm của Node.js để tạo UUID

const router = Router();

// 1. Lấy tất cả staged insights
router.get('/staged', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM insights_staging ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staged insights', error: err });
  }
});

// 2. Lấy tất cả processed insights
router.get('/processed', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM insights_processed ORDER BY processed_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching processed insights', error: err });
  }
});

// 3. Thêm một insight mới vào staging
router.post('/stage', async (req: Request, res: Response) => {
  const { source_url, raw_content } = req.body;
  if (!source_url || !raw_content) {
    return res.status(400).json({ message: 'source_url and raw_content are required' });
  }

  const id = randomUUID(); // Tạo UUID ở backend
  try {
    const result = await query(
      'INSERT INTO insights_staging (id, source_url, raw_content) VALUES ($1, $2, $3) RETURNING *',
      [id, source_url, raw_content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error adding new insight', error: err });
  }
});

// 4. Xóa một staged insight
router.delete('/stage/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM insights_staging WHERE id = $1', [id]);
    res.status(204).send(); // 204 No Content (Thành công)
  } catch (err) {
    res.status(500).json({ message: 'Error deleting insight', error: err });
  }
});

// 5. Xử lý (dán nhãn) một insight
router.post('/process', async (req: Request, res: Response) => {
  const { id, sentiment, topic } = req.body;
  if (!id || !sentiment || !topic) {
    return res.status(400).json({ message: 'id, sentiment, and topic are required' });
  }

  // Dùng transaction để đảm bảo an toàn: 1. Lấy, 2. Thêm, 3. Xóa
  const client = await query('BEGIN'); // Bắt đầu transaction
  try {
    // 1. Lấy data từ staging
    const stagedResult = await query('SELECT * FROM insights_staging WHERE id = $1', [id]);
    if (stagedResult.rows.length === 0) {
      return res.status(404).json({ message: 'Insight not found in staging' });
    }
    const insight = stagedResult.rows[0];

    // 2. Thêm vào processed
    await query(
      'INSERT INTO insights_processed (id, timestamp, source_url, raw_content, sentiment, topic) VALUES ($1, $2, $3, $4, $5, $6)',
      [insight.id, insight.timestamp, insight.source_url, insight.raw_content, sentiment, topic]
    );

    // 3. Xóa khỏi staging
    await query('DELETE FROM insights_staging WHERE id = $1', [id]);

    await query('COMMIT'); // Hoàn tất transaction
    res.status(201).json({ message: 'Insight processed successfully' });

  } catch (err) {
    await query('ROLLBACK'); // Hoàn tác nếu có lỗi
    res.status(500).json({ message: 'Error processing insight', error: err });
  }
});

// 6. Lấy gợi ý từ AI
router.post('/suggest', async (req: Request, res: Response) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'content is required' });
  }

  try {
    const suggestion = await suggestLabels(content);
    res.json(suggestion);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error getting AI suggestion' });
  }
});

export default router;