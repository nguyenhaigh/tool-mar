// backend-server/src/config.ts
import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 8080,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY,
  databaseUrl: process.env.DATABASE_URL,
  gnewsApiKey: process.env.GNEWS_API_KEY, 
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  alertEmailTo: process.env.ALERT_EMAIL_TO,
  alertEmailFrom: process.env.ALERT_EMAIL_FROM,
  googleSheetId: process.env.GOOGLE_SHEET_ID,
  redditClientId: process.env.REDDIT_CLIENT_ID,
  redditClientSecret: process.env.REDDIT_CLIENT_SECRET,
  redditUsername: process.env.REDDIT_USERNAME,
  redditPassword: process.env.REDDIT_PASSWORD,
  apifyApiToken: process.env.APIFY_API_TOKEN,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  assemblyaiApiKey: process.env.ASSEMBLYAI_API_KEY,
  googleServiceAccountBase64: process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
};

// Kiểm tra các biến môi trường quan trọng
if (!config.geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY in .env file");
}
if (!config.databaseUrl) {
  throw new Error("Missing DATABASE_URL in .env file");
}

export default config;