import { NextRequest, NextResponse } from "next/server";
import { getBookings, getPreSurveys, getPostSurveys, getReviews } from "@/lib/db";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [
    headers.map(escape).join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\r\n");
}

export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET ?? "change-this-secret";
  const session = req.cookies.get("admin_session")?.value;
  if (!session || session !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "bookings";

  let csv = "";
  let filename = "";

  if (type === "bookings") {
    const data = await getBookings();
    csv = toCSV(data as unknown as Record<string, unknown>[]);
    filename = "bookings.csv";
  } else if (type === "pre-surveys") {
    const data = await getPreSurveys();
    const rows = data.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      bookingId: r.bookingId ?? "",
      name: r.name ?? "",
      firstVisit: r.firstVisit,
      knowledgeLevel: r.knowledgeLevel,
      experiencePreference: r.experiencePreference,
      interests: r.interests,
      openQuestion: r.openQuestion,
      profileTag: r.profileTag,
    }));
    csv = toCSV(rows);
    filename = "pre-surveys.csv";
  } else if (type === "post-surveys") {
    const data = await getPostSurveys();
    const rows = data.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      bookingId: r.bookingId ?? "",
      contactEmail: r.contactEmail ?? "",
      rating_overall: r.ratings.overall,
      rating_clarity: r.ratings.clarity,
      rating_pacing: r.ratings.pacing,
      mostImpressive: Array.isArray(r.mostImpressive) ? r.mostImpressive : [r.mostImpressive],
      pricePerception: r.pricePerception,
      nps: r.nps,
      interestedInFuture: r.interestedInFuture,
      testimonial: r.testimonial,
      improvement: r.improvement,
    }));
    csv = toCSV(rows);
    filename = "post-surveys.csv";
  } else if (type === "reviews") {
    const data = await getReviews();
    csv = toCSV(data as unknown as Record<string, unknown>[]);
    filename = "reviews.csv";
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
