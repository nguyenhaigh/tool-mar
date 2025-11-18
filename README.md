# Hướng Dẫn Cài Đặt Metabase Dashboard

Metabase là một công cụ BI (Business Intelligence) mã nguồn mở, cho phép bạn tạo các dashboard đẹp mắt từ dữ liệu của mình.

## Bước 1: Chạy Metabase

Cách dễ nhất để chạy Metabase là sử dụng Docker:

```bash
docker run -d -p 3000:3000 \
  -v $(pwd)/metabase-data:/metabase-data \
  -e "MB_DB_FILE=/metabase-data/metabase.db" \
  --name metabase metabase/metabase