-- database/init.sql

-- Xóa bảng nếu tồn tại để chạy lại script (chỉ dùng cho phát triển)
DROP TABLE IF EXISTS insights_staging;
DROP TABLE IF EXISTS insights_processed;

-- Bảng 1: Dữ liệu thô chờ được dán nhãn
-- Chúng ta dùng UUID, sẽ được tạo bởi backend-server
CREATE TABLE insights_staging (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    source_url TEXT NOT NULL,
    raw_content TEXT NOT NULL
);

-- Bảng 2: Dữ liệu đã được xử lý và dán nhãn
CREATE TABLE insights_processed (
    id UUID PRIMARY KEY, -- ID này sẽ được chuyển từ bảng staging
    timestamp TIMESTAMPTZ NOT NULL, -- Thời gian gốc khi thêm vào
    source_url TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    sentiment TEXT NOT NULL, -- Giữ kiểu TEXT, backend sẽ validate giá trị
    topic TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW() -- Thời gian xử lý
);

-- (Tùy chọn) Tạo index để tăng tốc độ truy vấn trên các cột thường dùng
CREATE INDEX idx_processed_sentiment ON insights_processed(sentiment);
CREATE INDEX idx_processed_topic ON insights_processed(topic);
CREATE INDEX idx_processed_timestamp ON insights_processed(processed_at);

-- (Tùy chọn) Thêm một vài dữ liệu mẫu
INSERT INTO insights_staging (id, source_url, raw_content)
VALUES
    (gen_random_uuid(), 'https://facebook.com/comment/1', 'Giao hàng quá chậm, tôi rất không hài lòng.'),
    (gen_random_uuid(), 'https://kenh14.vn/article/123', 'Sản phẩm này tốt ngoài mong đợi, giá cũng rẻ nữa.');

ALTER TABLE insights_processed
ADD COLUMN source_type VARCHAR(50);

CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_name TEXT NOT NULL, -- Tên gợi nhớ (ví dụ: 'Tin tức Vinfast Hàng ngày')
    
    -- Loại cảm biến nào sẽ thực thi
    target_type VARCHAR(50) NOT NULL CHECK (
        target_type IN ('GNEWS_KEYWORD', 'YOUTUBE_KEYWORD', 'REDDIT_SUB', 'APIFY_URL')
    ),
    
    -- Giá trị cảm biến sẽ tìm (từ khóa hoặc URL)
    target_value TEXT NOT NULL, 
    
    is_active BOOLEAN DEFAULT true, -- Để Bật/Tắt mục tiêu này
    created_at TIMESTAMPTZ DEFAULT NOW()
);