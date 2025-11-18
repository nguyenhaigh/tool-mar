// backend-server/src/api/targets.routes.ts
// (MỚI) File API cho Giai Đoạn 4

import { Router, Request, Response } from 'express';
import { query } from '../services/database.service';

const router = Router();

/**
 * [READ] Lấy TẤT CẢ các mục tiêu
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM targets ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching targets', error: err });
  }
});

/**
 * [CREATE] Thêm một mục tiêu mới
 */
router.post('/', async (req: Request, res: Response) => {
  const { target_name, target_type, target_value } = req.body;
  if (!target_name || !target_type || !target_value) {
    return res
      .status(400)
      .json({ message: 'target_name, target_type, and target_value are required' });
  }

  try {
    const result = await query(
      'INSERT INTO targets (target_name, target_type, target_value) VALUES ($1, $2, $3) RETURNING *',
      [target_name, target_type, target_value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error creating target', error: err });
  }
});

/**
 * [UPDATE] Cập nhật trạng thái (Bật/Tắt)
 */
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_active } = req.body; // Chỉ nhận trạng thái mới

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ message: 'is_active (boolean) is required' });
  }

  try {
    const result = await query(
      'UPDATE targets SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Target not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error updating target status', error: err });
  }
});

/**
 * [DELETE] Xóa một mục tiêu
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM targets WHERE id = $1', [id]);
    res.status(204).send(); // 204 No Content
  } catch (err) {
    res.status(500).json({ message: 'Error deleting target', error: err });
  }
});

export default router;