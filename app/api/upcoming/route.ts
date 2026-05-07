import { NextRequest, NextResponse } from "next/server";
import { getBookings, getPreSurveys } from "@/lib/db";

// Simple read-only endpoint for life-os integration.
// Protected by UPCOMING_API_KEY env var (falls back to "lifeos" in dev).
export async function GET(req: NextRequest) {
  const key = process.env.UPCOMING_API_KEY ?? "lifeos";
  const provided = req.nextUrl.searchParams.get("key");
  if (provided !== key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [bookings, pre] = await Promise.all([getBookings(), getPreSurveys()]);

  const now = new Date();
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && b.tourDate && new Date(b.tourDate) >= now)
    .sort((a, b) => new Date(a.tourDate!).getTime() - new Date(b.tourDate!).getTime())
    .map((b) => {
      const survey = pre.find((s) => s.bookingId === b.id);
      return {
        id: b.id,
        bookingCode: b.bookingCode,
        name: b.name,
        email: b.email,
        phone: b.phone,
        tourDate: b.tourDate,
        timeSlot: b.timeSlot,
        groupSize: b.groupSize ?? 1,
        notes: b.notes,
        amount: b.amount,
        paymentType: b.paymentType,
        profileTag: b.profileTag ?? survey?.profileTag,
        interests: survey?.interests ?? [],
        knowledgeLevel: survey?.knowledgeLevel,
        firstVisit: survey?.firstVisit,
        country: survey?.country,
        openQuestion: survey?.openQuestion,
      };
    });

  return NextResponse.json({ upcoming, count: upcoming.length });
}
