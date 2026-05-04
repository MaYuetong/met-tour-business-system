import nodemailer from "nodemailer";

function createTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_APP_PASSWORD is not set in .env.local");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export type ReviewData = {
  name: string;
  email?: string;
  tourDate?: string;
  rating: number;
  section: string;
  review: string;
  wouldRecommend: string;
  allowQuote: string;
};

const STARS = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

const SECTION_LABELS: Record<string, string> = {
  architecture:  "Architecture & Sculpture",
  medieval:      "Medieval Art",
  renaissance:   "Renaissance / Raphael Exhibition",
  "17-18th":     "17th–18th Century",
  impressionism: "Impressionism",
  overall:       "The whole tour",
};

export async function sendReviewNotification(data: ReviewData) {
  const to = process.env.EMAIL_USER!;
  const transport = createTransport();

  const sectionLabel = SECTION_LABELS[data.section] ?? data.section;
  const subject = `⭐ New Review (${STARS(data.rating)}) from ${data.name} — MET Tour`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Georgia, serif; background: #F8F5F0; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 40px auto; background: #fff; border: 1px solid #E0D5C8; }
    .header { background: #A6192E; padding: 32px 40px; }
    .header h1 { color: #fff; font-size: 20px; margin: 0; font-family: Georgia, serif; }
    .header p  { color: rgba(255,255,255,0.7); font-size: 12px; margin: 6px 0 0; letter-spacing: 0.15em; text-transform: uppercase; }
    .body { padding: 36px 40px; }
    .stars { font-size: 28px; color: #A6192E; margin: 0 0 24px; }
    .review-text { font-size: 17px; color: #1A1A1A; line-height: 1.7; font-style: italic; border-left: 3px solid #A6192E; padding-left: 20px; margin: 0 0 28px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F0EBE4; font-size: 14px; }
    .label { color: #8B7D72; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; }
    .value { color: #1A1A1A; }
    .badge { display: inline-block; background: #A6192E; color: #fff; font-size: 11px; padding: 3px 10px; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.1em; }
    .badge.green { background: #16a34a; }
    .footer { background: #F8F5F0; padding: 20px 40px; text-align: center; font-size: 12px; color: #8B7D72; border-top: 1px solid #E0D5C8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Guest Review</h1>
      <p>Metropolitan Museum of Art · European Art History Tour</p>
    </div>
    <div class="body">
      <div class="stars">${STARS(data.rating)}</div>

      <div class="review-text">"${data.review}"</div>

      <div class="row">
        <span class="label">Guest</span>
        <span class="value">${data.name}</span>
      </div>
      ${data.email ? `
      <div class="row">
        <span class="label">Email</span>
        <span class="value">${data.email}</span>
      </div>` : ""}
      ${data.tourDate ? `
      <div class="row">
        <span class="label">Tour Date</span>
        <span class="value">${data.tourDate}</span>
      </div>` : ""}
      <div class="row">
        <span class="label">Favourite Section</span>
        <span class="value">${sectionLabel}</span>
      </div>
      <div class="row">
        <span class="label">Would Recommend</span>
        <span class="value">
          <span class="badge ${data.wouldRecommend === "yes" ? "green" : ""}">${data.wouldRecommend === "yes" ? "Yes" : "No"}</span>
        </span>
      </div>
      <div class="row">
        <span class="label">May Quote Publicly</span>
        <span class="value">
          <span class="badge ${data.allowQuote === "yes" ? "green" : ""}">${data.allowQuote === "yes" ? "Yes ✓" : "No"}</span>
        </span>
      </div>
    </div>
    <div class="footer">
      Submitted ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })} · MET Tour Business System
    </div>
  </div>
</body>
</html>`;

  const text = `
New review from ${data.name}
Rating: ${data.rating}/5
Section: ${sectionLabel}
Review: "${data.review}"
Email: ${data.email ?? "not provided"}
Tour date: ${data.tourDate ?? "not provided"}
Would recommend: ${data.wouldRecommend}
May quote publicly: ${data.allowQuote}
  `.trim();

  await transport.sendMail({ from: `"MET Tour" <${to}>`, to, subject, html, text });
}
