// backend-server/src/services/alert.service.ts
import sgMail from '@sendgrid/mail';
import config from '../config';

// Xác thực SendGrid
if (config.sendgridApiKey) {
  sgMail.setApiKey(config.sendgridApiKey);
  console.log('[AlertService] SendGrid service initialized.');
} else {
  console.warn('[AlertService] SENDGRID_API_KEY is not set. Email alerts are disabled.');
}

/**
 * Gửi một email cảnh báo khủng hoảng ngay lập tức.
 * @param article Bài báo (hoặc insight) gây ra cảnh báo
 * @param labels Các nhãn AI (Sentiment, Topic)
 */
export async function sendCrisisAlert(article: { url: string; raw_content: string }, labels: { sentiment: string; topic: string }) {

  // Kiểm tra xem config đã sẵn sàng chưa
  if (!config.sendgridApiKey || !config.alertEmailTo || !config.alertEmailFrom) {
    console.error('[AlertService] Cannot send alert. Email config is incomplete.');
    return;
  }

  const msg = {
    to: config.alertEmailTo,
    from: config.alertEmailFrom,
    subject: `🚨 [CẢNH BÁO KHỦNG HOẢNG] Phát hiện Sentiment Tiêu cực về Chiến dịch!`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hệ thống DA Reliability Hub vừa phát hiện một cảnh báo:</h2>
        <p>
          Một bài viết/thảo luận đã được AI phân loại là <strong>${labels.sentiment}</strong>
          về chủ đề <strong>${labels.topic}</strong>.
        </p>
        <hr>
        <h3>Chi tiết:</h3>
        <p><strong>Nguồn:</strong> <a href="${article.url}">${article.url}</a></p>
        <p><strong>Nội dung (trích đoạn):</strong></p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 1em; margin-left: 1em; color: #555;">
          ${article.raw_content.substring(0, 500)}...
        </blockquote>
        <p>Đề nghị team Marketing kiểm tra và xử lý ngay.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`[AlertService] Crisis alert email sent successfully to ${config.alertEmailTo}`);
  } catch (error) {
    console.error('[AlertService] Error sending crisis alert email', error);
  }
}