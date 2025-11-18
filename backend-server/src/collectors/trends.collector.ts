// backend-server/src/collectors/trends.collector.ts
import googleTrends from 'google-trends-api';

/**
 * Thu thập dữ liệu xu hướng (Interest Over Time) từ Google Trends
 * @param keyword Từ khóa tìm kiếm (ví dụ: 'Vinfast')
 * @returns Một đối tượng JSON chứa dữ liệu xu hướng
 */
export async function fetchGoogleTrends(keyword: string) {
  try {
    console.log(`[GoogleTrends] Fetching trends for keyword: "${keyword}"`);

    // Lấy dữ liệu xu hướng trong 7 ngày qua tại Việt Nam
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 7); // 7 ngày trước

    const results = await googleTrends.interestOverTime({
      keyword: keyword,
      startTime: startTime,
      geo: 'VN', // Địa điểm là Việt Nam
    });

    console.log(`[GoogleTrends] Successfully fetched trends data.`);
    return JSON.parse(results); // API này trả về string, parse nó thành JSON

  } catch (error: any) {
    console.error(`[GoogleTrends] Error fetching trends: ${error.message}`);
    // Trả về lỗi dưới dạng JSON để API test có thể hiển thị
    return { error: `Google Trends API failed: ${error.message}` }; 
  }
}