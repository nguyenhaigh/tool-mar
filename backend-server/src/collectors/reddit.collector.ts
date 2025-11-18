// backend-server/src/collectors/reddit.collector.ts
import snoowrap from 'snoowrap';
import config from '../config';

// Định nghĩa một cấu trúc chung cho dữ liệu thô (tương tự GNews)
// Chúng ta sẽ dùng lại cấu trúc này trong scheduler
export interface UniversalRawContent {
  id: string; // ID gốc từ API
  title: string;
  content: string;
  url: string;
  sourceName: string;
  sourceType: 'GNews' | 'Reddit'; // Để phân biệt
}

// Biến toàn cục để giữ client đã xác thực
let r: snoowrap | null = null;

function getRedditClient() {
  if (r) return r; // Trả về nếu đã khởi tạo

  if (
    !config.redditClientId ||
    !config.redditClientSecret ||
    !config.redditUsername ||
    !config.redditPassword
  ) {
    console.warn('[Reddit] Reddit credentials are not fully set. Skipping collection.');
    return null;
  }

  try {
    r = new snoowrap({
      userAgent: 'DA Hub Collector v1.0',
      clientId: config.redditClientId,
      clientSecret: config.redditClientSecret,
      username: config.redditUsername,
      password: config.redditPassword,
    });
    console.log('[Reddit] Snoowrap client initialized.');
    return r;
  } catch (error) {
    console.error('[Reddit] Failed to initialize Snoowrap client', error);
    return null;
  }
}

/**
 * Thu thập các bài đăng mới từ một Subreddit
 * @param subredditName Tên subreddit (ví dụ: 'vietnam')
 * @returns Một mảng các bài đăng/bình luận đã được chuẩn hóa
 */
export async function fetchNewsFromReddit(subredditName: string): Promise<UniversalRawContent[]> {
  const client = getRedditClient();
  if (!client) {
    return []; // Trả về mảng rỗng nếu không có credentials
  }

  try {
    // Lấy 10 bài đăng mới nhất (new submissions)
    const newSubmissions = await client.getSubreddit(subredditName).getNew({ limit: 10 });

    const results: UniversalRawContent[] = [];

    for (const post of newSubmissions) {
      // Chuẩn hóa dữ liệu về dạng chung
      results.push({
        id: post.id,
        title: post.title,
        // Kết hợp tiêu đề và nội dung (nếu có) để AI phân tích
        content: `${post.title}. ${post.selftext}`, 
        url: `https://www.reddit.com${post.permalink}`, // Link gốc của bài đăng
        sourceName: `r/${subredditName}`,
        sourceType: 'Reddit',
      });
    }

    console.log(`[Reddit] Fetched ${results.length} posts from r/${subredditName}`);
    return results;

  } catch (error: any) {
    console.error(`[Reddit] Error fetching posts: ${error.message}`);
    return []; // Trả về mảng rỗng khi có lỗi
  }
}