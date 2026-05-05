const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://met-tour-business-system.vercel.app";

type BookingEmailData = {
  id: string;
  name: string;
  email: string;
  tourDate?: string;
  amount: number;
  paymentType: "full" | "deposit" | "paid";
  bookingCode?: string;
  guideWechat?: string;
};

function buildHtml(booking: BookingEmailData): string {
  const preSurveyUrl = `${SITE_URL}/survey/pre?bookingId=${booking.id}&name=${encodeURIComponent(booking.name)}&email=${encodeURIComponent(booking.email)}`;
  const code = booking.bookingCode ?? "—";

  const tourDateRow = booking.tourDate
    ? `<tr><td class="label">导览日期</td><td class="value">${new Date(booking.tourDate + "T12:00:00").toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</td></tr>`
    : "";

  const paymentText =
    booking.paymentType === "full"    ? `全额支付 $86` :
    booking.paymentType === "deposit" ? `定金 $20（导览当天补 $66 尾款）` :
                                        `已于其他方式支付（微信 / 支付宝 / Zelle）`;

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
  .code-block{background:#1A1A1A;padding:24px;text-align:center;margin:0 0 32px}
  .code-block p.code-label{margin:0 0 8px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A84C}
  .code-block p.code-value{margin:0;font-size:36px;font-weight:300;letter-spacing:0.3em;color:white}
  .code-block p.code-hint{margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.05em}
  .wechat-block{background:#F0FAF0;border:1px solid #C6E6C6;padding:20px 24px;margin:0 0 32px;display:flex;align-items:center;gap:16px}
  .wechat-block .wechat-icon{font-size:28px;flex-shrink:0}
  .wechat-block p{margin:0;font-size:14px;color:#2D6A2D;line-height:1.7}
  .wechat-block strong{font-size:17px;letter-spacing:0.05em;color:#1A4A1A}
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

    <p class="section-label">您的当日专属码</p>
    <div class="code-block">
      <p class="code-label">入场验证码</p>
      <p class="code-value">${code}</p>
      <p class="code-hint">请妥善保存，导览当天出示给讲解员</p>
    </div>

    <p class="section-label">添加讲解员微信</p>
    <div class="wechat-block">
      <div class="wechat-icon">💬</div>
      <div>
        <p>请扫码或搜索微信号添加讲解员，方便导览前沟通行程细节。</p>
        <p><strong>${booking.guideWechat ?? "Yuti_9999"}</strong></p>
      </div>
    </div>

    <p class="section-label">预约详情</p>
    <table class="detail-table">
      <tr><td class="label">姓名</td><td class="value">${booking.name}</td></tr>
      <tr><td class="label">邮箱</td><td class="value">${booking.email}</td></tr>
      <tr><td class="label">支付方式</td><td class="value">${paymentText}</td></tr>
      ${tourDateRow}
      <tr><td class="label">地点</td><td class="value">大都会艺术博物馆，纽约</td></tr>
    </table>
  </div>
  <div class="cta-block">
    <h2>下一步：完成参观前问卷</h2>
    <p>请点击下方按钮完成一份约 3 分钟的问卷。<br>您的回答将帮助我们为本次导览个性化定制内容。</p>
    <a href="${preSurveyUrl}" class="cta-btn">开始参观前问卷 →</a>
    <p class="note">如果按钮无法点击，请复制以下链接至浏览器：<br><a href="${preSurveyUrl}" style="color:#A6192E">${preSurveyUrl}</a></p>
  </div>
  <div class="footer">
    <p>大都会艺术博物馆 · 欧洲艺术史私人导览<br>如有任何问题，请直接回复此邮件或微信联系 Yuti_9999。<br>© 2026 · 版权所有</p>
  </div>
</div>
</body>
</html>`;
}

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xbdwojzk";

export async function notifyAdminFormspreeRaw(subject: string, data: Record<string, string | number>): Promise<void> {
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, ...data }),
    });
  } catch (e) {
    console.error("Formspree notify error:", e);
  }
}

// Notify admin via Formspree (always runs, no API key needed)
async function notifyAdminFormspree(booking: BookingEmailData): Promise<void> {
  const paymentText =
    booking.paymentType === "full"    ? "全额 $86" :
    booking.paymentType === "deposit" ? "定金 $20（补 $66）" :
                                        "已于其他方式支付";
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `【新预约】${booking.name} · ${paymentText}`,
        姓名: booking.name,
        邮箱: booking.email,
        导览日期: booking.tourDate ?? "待定",
        支付方式: paymentText,
        当日入场码: booking.bookingCode ?? "—",
        金额: `$${booking.amount}`,
      }),
    });
  } catch (e) {
    console.error("Formspree notify error:", e);
  }
}

// Send confirmation email to customer via Gmail SMTP (requires GMAIL_USER + GMAIL_APP_PASSWORD)
async function sendCustomerEmail(booking: BookingEmailData): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping customer email");
    return;
  }
  console.log(`[email] Sending confirmation to ${booking.email} via ${user}`);
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"大都会艺术史导览" <${user}>`,
      to: booking.email,
      subject: "【预约确认】大都会艺术博物馆 欧洲艺术史私人导览",
      html: buildHtml(booking),
    });
    console.log(`[email] Confirmation sent to ${booking.email} ✓`);
  } catch (e) {
    console.error("[email] Gmail send error:", e);
  }
}

export async function sendBookingConfirmation(booking: BookingEmailData): Promise<void> {
  await Promise.allSettled([
    notifyAdminFormspree(booking),
    sendCustomerEmail(booking),
  ]);
}

export type SurveyEmailData = {
  name: string;
  email: string;
  referralCode: string;
  type: "pre" | "post";
  rows: Array<{ label: string; value: string }>;
};

function buildSurveyEmailHtml(data: SurveyEmailData): string {
  const typeLabel = data.type === "pre" ? "参观前问卷" : "参观后问卷";
  const rowsHtml = data.rows
    .map((r) => `<tr><td class="label">${r.label}</td><td class="value">${r.value}</td></tr>`)
    .join("\n");

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
  .code-block{background:#1A1A1A;padding:24px;text-align:center;margin:0 0 32px}
  .code-block p.code-label{margin:0 0 8px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A84C}
  .code-block p.code-value{margin:0;font-size:36px;font-weight:300;letter-spacing:0.3em;color:white}
  .code-block p.code-hint{margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.05em}
  .detail-table{width:100%;border-collapse:collapse;margin:0 0 32px}
  .detail-table .label{padding:10px 0;font-size:13px;color:#8B7D72;border-bottom:1px solid #F0EBE3;width:40%}
  .detail-table .value{padding:10px 0;font-size:13px;color:#1A1A1A;border-bottom:1px solid #F0EBE3;text-align:right}
  .footer{padding:28px 40px;text-align:center}
  .footer p{font-size:11px;color:#8B7D72;line-height:1.8;margin:0}
  .footer a{color:#A6192E;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="top-bar"><p>大都会艺术博物馆 · 欧洲艺术史私人导览</p></div>
  <div class="header">
    <h1>问卷已提交</h1>
    <p>${typeLabel.toUpperCase()}</p>
    <div class="gold-rule"></div>
  </div>
  <div class="body">
    <h2 class="greeting">${data.name}，感谢您的反馈。</h2>
    <p class="intro">您的${typeLabel}已成功提交。以下是您的专属推荐码——分享给朋友，对方预约成功后您将获得 <strong>$3 返现</strong>，对方也可享受优惠。</p>

    <p class="section-label">您的专属推荐码</p>
    <div class="code-block">
      <p class="code-label">分享给朋友</p>
      <p class="code-value">${data.referralCode}</p>
      <p class="code-hint">对方预约时填入此码，双方各享优惠</p>
    </div>

    <p class="section-label">您填写的内容</p>
    <table class="detail-table">
      ${rowsHtml}
    </table>
  </div>
  <div class="footer">
    <p>大都会艺术博物馆 · 欧洲艺术史私人导览<br>如有任何问题，请直接回复此邮件或微信联系 Yuti_9999。<br>© 2026 · 版权所有</p>
  </div>
</div>
</body>
</html>`;
}

export async function sendSurveyConfirmation(data: SurveyEmailData): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[email] GMAIL credentials not set — skipping survey email");
    return;
  }
  const typeLabel = data.type === "pre" ? "参观前问卷" : "参观后问卷";
  console.log(`[email] Sending survey confirmation to ${data.email}`);
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"大都会艺术史导览" <${user}>`,
      to: data.email,
      subject: `【${typeLabel}已提交】大都会艺术博物馆 欧洲艺术史私人导览`,
      html: buildSurveyEmailHtml(data),
    });
    console.log(`[email] Survey confirmation sent to ${data.email} ✓`);
  } catch (e) {
    console.error("[email] Survey email error:", e);
  }
}
