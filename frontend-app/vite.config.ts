// frontend-app/vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // const env = loadEnv(mode, '.', ''); // Dòng này không cần thiết nữa
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // KHỐI LỆNH NGUY HIỂM ĐÃ BỊ XÓA
      // define: {
      //   'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      // },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});