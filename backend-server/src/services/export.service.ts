// backend-server/src/services/export.service.ts
import { google } from 'googleapis';
// import path from 'path';
import config from '../config';
import { query } from './database.service';

// Đường dẫn tuyệt đối đến file key JSON
// const KEY_FILE_PATH = path.join(process.cwd(), 'google-service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Biến toàn cục để giữ client đã xác thực
let sheets: any;

/**
 * Xác thực với Google Service Account
 */
async function authenticateGoogleSheets() {
  if (sheets) return sheets; // Trả về nếu đã xác thực

  try {
    // 1. Kiểm tra xem config Base64 đã được tải chưa
    if (!config.googleServiceAccountBase64) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_BASE64 is not set in .env.');
    }

    // 2. Giải mã chuỗi Base64 trở lại thành chuỗi JSON
    const jsonString = Buffer.from(
      config.googleServiceAccountBase64, 
      'base64'
    ).toString('utf-8');

    // 3. Parse chuỗi JSON đã được giải mã
    const credentials = JSON.parse(jsonString);

    // Xác thực bằng đối tượng credentials, KHÔNG DÙNG FILE
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient });
    console.log('[GoogleSheets] Authentication successful (from Base64 env).');
    return sheets;

  } catch (error: any) {
    console.error('[GoogleSheets] Authentication failed:', error.message);
    throw new Error('Google Sheets authentication failed.');
  }
}

/**
 * Logic chính: Lấy dữ liệu từ DB và đẩy lên Google Sheet
 */
export async function exportToGoogleSheet() {
  if (!config.googleSheetId) {
    throw new Error('GOOGLE_SHEET_ID is not set in .env');
  }

  const googleSheetsApi = await authenticateGoogleSheets();
  const sheetId = config.googleSheetId;
  const sheetName = 'Sheet1'; // Tên trang tính mặc định (hoặc tên bạn muốn)

  // --- 1. Lấy dữ liệu từ PostgreSQL ---
  console.log('[GoogleSheets] Fetching data from PostgreSQL...');
  const dbResult = await query(
    // Lấy dữ liệu trong 1 ngày qua (như kế hoạch của DA)
    `SELECT * FROM insights_processed WHERE processed_at >= NOW() - INTERVAL '1 day' ORDER BY processed_at DESC`
  );

  if (dbResult.rows.length === 0) {
    console.log('[GoogleSheets] No new data to export.');
    return { message: 'No new data to export.', rowsExported: 0 };
  }

  // --- 2. Định dạng dữ liệu cho Google Sheets ---
  // (Biến đổi mảng JSON thành mảng 2 chiều [[], [], ...])

  // Tạo hàng tiêu đề (Header)
  const headerRow = [
    'id', 'timestamp', 'processed_at', 'source_url', 'raw_content', 
    'sentiment', 'topic', 'source_type'
  ];

  // Tạo các hàng dữ liệu (Data rows)
  const dataRows = dbResult.rows.map(row => [
    row.id,
    row.timestamp,
    row.processed_at,
    row.source_url,
    row.raw_content,
    row.sentiment,
    row.topic,
    row.source_type
  ]);

  const values = [headerRow, ...dataRows];
  console.log(`[GoogleSheets] Preparing to export ${dataRows.length} rows.`);

  // --- 3. Xóa dữ liệu cũ trên Sheet (Xóa trang "Sheet1") ---
  try {
    await googleSheetsApi.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z`, // Xóa toàn bộ dữ liệu cũ
    });
    console.log('[GoogleSheets] Old data cleared.');
  } catch (clearError) {
    console.error('[GoogleSheets] Error clearing old data:', clearError);
    // Không dừng lại, vẫn cố gắng ghi đè
  }

  // --- 4. Ghi dữ liệu mới vào Sheet ---
  await googleSheetsApi.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1`, // Bắt đầu từ ô A1
    valueInputOption: 'USER_ENTERED', // Giả lập như người dùng gõ vào
    resource: {
      values: values,
    },
  });

  console.log('[GoogleSheets] Data exported successfully.');
  return { message: 'Data exported successfully.', rowsExported: dataRows.length };
}