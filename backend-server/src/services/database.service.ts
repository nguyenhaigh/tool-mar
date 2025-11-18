// backend-server/src/services/database.service.ts
import { Pool } from 'pg';
import config from '../config';

// Khởi tạo pool kết nối
export const pool = new Pool({
  connectionString: config.databaseUrl,
  // (Tùy chọn) Thêm SSL nếu kết nối đến DB trên cloud
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

// Một hàm helper để truy vấn, tự động log lỗi
export const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, params, error });
    throw error;
  }
};

// Kiểm tra kết nối khi khởi động
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    throw new Error('Failed to connect to database');
  }
  console.log('Connected to PostgreSQL database successfully.');
  client.release();
});