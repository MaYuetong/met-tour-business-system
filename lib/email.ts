const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type BookingEmailData = {
  id: string;
  name: string;
  email: string;
  tourDate?: string;
  amount: number;
  paymentType: "full" | "deposit";
};

function buildHtml(booking: BookingEmailData): string {
  const preSurveyUrl = `${SITE_URL}/survey/pre?bookingId=${booking.id}&name=${encodeURIComponent(booking.name)}&email=${encodeURIComponent(booking.email)}`;

  const tourDateRow = booking.tourDate
    ? `<tr><td class="label">导览日期</td><td class="value">${new Date(booking.tourDate).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</td></tr>`
    : "";

  const paymentText = booking.paymentType === "full"
    ? `全额支付 $75`
    : `定金 $${booking.amount}（导览当天补 $55 尾款）`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#F8F5F0;font-family:"Noto Serif SC",Georgia,"Times New Roman",serif;-webkit-font-smoothing:antialiased}
  .wrap{max-width:560px;margin:0 auto;background:#F8F5F0}
  .top-bar{background:#A6192E;padding:6px 40px;text-align:center}
  .top-bar p{margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7)}
  .header{background:#A6192E;padding:36px 40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.15)}
  .header h1{margin:0;color:white;font-size:28px;font-weight:300;letter-spacing:0.05em}
  .header p{margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:0.15em}
  .gold-rule{width:40px;height:1px;background:#C9A84C;margin:16px auto 0}
  .body{background:white;padding:40px;border-left:1px solid #E0D5C8;border-right:1px solid #E0D5C8}
  .greeting{font-size:26px;color:#1A1A1A;font-weight:300;margin:0 0 12px}
  .intro{font-size:15px;color:#6B5E52;line-height:1.9;margin:0 0 32px}
  .section-label{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8B7D72;margin:0 0 12px}
  .detail-table{width:100%;border-collapse:collapse;margin:0 0 32px}
  .detail-table .label{padding:10px 0;font-size:13px;color:#8B7D72;border-bottom:1px solid #F0EBE3;width:40%}
  .detail-table .value{padding:10px 0;font-size:13px;color:#1A1A1A;border-bottom:1px solid #F0EBE3;text-align:right}
  .cta-block{background:#F8F5F0;padding:36px 40px;text-align:center;border:1px solid #E0D5C8;border-top:none}
  .cta-block h2{font-size:18px;color:#1A1A1A;font-weight:400;margin:0 0 10px}
  .cta-block p{font-size:14px;color:#6B5E52;line-height:1.8;margin:0 0 24px}
  .cta-btn{display:inline-block;background:#A6192E;color:white;text-decoration:none;padding:16px 44px;font-size:13px;letter-spacing:0.1em;font-family:inherit}
  .note{font-size:11px;color:#8B7D72;margin:16px 0 0;line-height:1.7}
  .footer{padding:28px 40px;text-align:center}
  .footer p{font-size:11px;color:#8B7D72;line-height:1.8;margin:0}
  .footer a{color:#A6192E;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="top-bar"><p>大都会艺术博物馆 · 欧洲艺术史私人导览</p></div>
  <div class="header">
    <h1>预约确认函</h1>
    <p>BOOKING CONFIRMATION</p>
    <div class="gold-rule"></div>
  </div>
  <div class="body">
    <h2 class="greeting">${booking.name}，欢迎。</h2>
    <p class="intro">您在大都会艺术博物馆欧洲艺术史私人导览的名额已成功预留。感谢您的信任，期待与您相聚于这场穿越五个世纪的艺术之旅。</p>
    <p class="section-label">预约详情</p>
    <table class="detail-table">
      <tr><td class="label">姓名</td><td class="value">${booking.name}</td></tr>
      <tr><td class="label">邮箱</td><td class="value">${booking.email}</td></tr>
      <tr><td class="label">支付方式</td><td class="value">${paymentText}</td></tr>
      ${tourDateRow}
      <tr><td class="label">导览时长</td><td class="value">3.5 小时</td></tr>
      <tr><td class="label">地点</td><td class="value">大都会艺术博物馆，纽约</td></tr>
    </table>
  </div>
  <div class="cta-block">
    <h2>下一步：完成参观前问卷</h2>
    <p>请点击下方按钮完成一份约 3 分钟的简短问卷。<br>您的回答将帮助我们为本次导览个性化定制内容。</p>
    <a href="${preSurveyUrl}" class="cta-btn">开始参观前问卷 →</a>
    <p class="note">如果按钮无法点击，请复制以下链接至浏览器：<br><a href="${preSurveyUrl}" style="color:#A6192E">${preSurveyUrl}</a></p>
  </div>
  <div class="footer">
    <p>大都会艺术博物馆 · 欧洲艺术史私人导览<br>如有任何问题，请直接回复此邮件。<br>© 2026 · 版权所有</p>
  </div>
</div>
</body>
</html>`;
}

export async function sendBookingConfirmation(booking: BookingEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const adminEmail = process.env.ADMIN_EMAIL ?? "yuetongma0107@gmail.com";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "大都会艺术史导览 <onboarding@resend.dev>",
        to: [booking.email],
        bcc: [adminEmail],
        subject: "【预约确认】大都会艺术博物馆 欧洲艺术史私人导览",
        html: buildHtml(booking),
      }),
    });
    if (!res.ok) {
      console.error("Resend email failed:", await res.text());
    }
  } catch (e) {
    console.error("Email send error:", e);
  }
}
