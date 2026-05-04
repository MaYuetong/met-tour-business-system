import { NextRequest, NextResponse } from "next/server";
import { addReview, getReviews } from "@/lib/db";
import { sendReviewNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rating, section, review, wouldRecommend, allowQuote, email, tourDate } = body;

    if (!name || !rating || !section || !review) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const record = await addReview({ name, email, tourDate, rating, section, review, wouldRecommend, allowQuote });

    // Send email notification (non-blocking — don't fail the request if email fails)
    sendReviewNotification({ name, email, tourDate, rating, section, review, wouldRecommend, allowQuote })
      .catch((err) => console.error("Email notification failed:", err));

    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (e) {
    console.error("Review save error:", e);
    return NextResponse.json({ ok: false, error: "Failed to save review" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const records = await getReviews();
    return NextResponse.json({ ok: true, data: records });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed to read reviews" }, { status: 500 });
  }
}
