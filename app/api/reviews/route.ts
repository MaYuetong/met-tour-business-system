import { NextRequest, NextResponse } from "next/server";
import { addReview, getReviews } from "@/lib/db";

const FORMSPREE_URL = "https://formspree.io/f/xbdwojzk";

const SECTION_LABELS: Record<string, string> = {
  architecture:  "Architecture & Sculpture",
  medieval:      "Medieval Art",
  renaissance:   "Renaissance / Raphael Exhibition",
  "17-18th":     "17th–18th Century",
  impressionism: "Impressionism",
  overall:       "The whole tour",
};

const STARS = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

async function notifyViaFormspree(data: {
  name: string;
  email?: string;
  tourDate?: string;
  rating: number;
  section: string;
  review: string;
  wouldRecommend: string;
  allowQuote: string;
}) {
  await fetch(FORMSPREE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: `${STARS(data.rating)} New Review from ${data.name} — MET Tour`,
      Name: data.name,
      Email: data.email || "not provided",
      "Tour Date": data.tourDate || "not provided",
      Rating: `${data.rating} / 5  ${STARS(data.rating)}`,
      "Favourite Section": SECTION_LABELS[data.section] ?? data.section,
      Review: data.review,
      "Would Recommend": data.wouldRecommend === "yes" ? "Yes ✓" : "No",
      "May Quote Publicly": data.allowQuote === "yes" ? "Yes ✓" : "No",
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rating, section, review, wouldRecommend, allowQuote, email, tourDate } = body;

    if (!name || !rating || !section || !review) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    // Save to local JSON
    const record = await addReview({ name, email, tourDate, rating, section, review, wouldRecommend, allowQuote });

    // Forward to Formspree (non-blocking — won't fail the request if Formspree is down)
    notifyViaFormspree({ name, email, tourDate, rating, section, review, wouldRecommend, allowQuote })
      .catch((err) => console.error("Formspree notification failed:", err));

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
