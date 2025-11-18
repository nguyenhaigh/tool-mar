// frontend-app/types.ts
// (PHIÊN BẢN ĐÃ CẬP NHẬT)

export enum Sentiment {
  Positive = 'Positive',
  Negative = 'Negative',
  Neutral = 'Neutral',
}

export enum Topic {
  Campaign = 'Campaign',
  Shipping = 'Shipping',
  Price = 'Price',
  ProductQuality = 'Product Quality',
  CustomerService = 'Customer Service',
  General = 'General',
  Product = 'Product',
}

export interface Insight {
  id: string;
  timestamp: string;
  source_url: string;
  raw_content: string;
  sentiment?: Sentiment;
  topic?: Topic;
  source_type?: string;
}

// Định nghĩa các loại Target Type (khớp với CSDL)
export enum TargetType {
  GNews = 'GNEWS_KEYWORD',
  YouTube = 'YOUTUBE_KEYWORD',
  Reddit = 'REDDIT_SUB',
  Apify = 'APIFY_URL',
}

// Định nghĩa cấu trúc của một Target
export interface Target {
  id: string;
  target_name: string;
  target_type: TargetType;
  target_value: string;
  is_active: boolean;
  created_at: string;
}