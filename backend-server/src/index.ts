// backend-server/src/index.ts
import express from 'express';
import cors from 'cors';
import config from './config';
import insightRoutes from './api/insights.routes';
import exportRoutes from './api/export.routes.ts';
import targetsRoutes from './api/targets.routes';
import { pool } from './services/database.service';
import { startScheduler } from './services/scheduler.service';
import testRoutes from './api/test.routes.ts';

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: config.frontendUrl, // Chỉ cho phép frontend của bạn truy cập
}));

// Cấu hình middleware để đọc JSON
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('DA Reliability Hub Backend is running!');
});

app.use('/api/insights', insightRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/targets', targetsRoutes);



// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Khởi chạy server
app.listen(config.port, () => {
  console.log(`Backend server listening on http://localhost:${config.port}`);
});

// Khởi động bộ lập lịch
startScheduler();

// Đóng pool DB khi server tắt
process.on('SIGINT', async () => {
  await pool.end();
  console.log('PostgreSQL pool has been closed.');
  process.exit(0);
});