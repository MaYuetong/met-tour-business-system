import { NextRequest, NextResponse } from "next/server";
import { lookupCheckin, checkInBooking } from "@/lib/db";

function authCheck(req: NextRequest) {
  const secret  = process.env.ADMIN_SECRET ?? "change-this-secret";
  const session = req.cookies.get("admin_session")?.value;
  return session === secret;
}

// GET /api/admin/checkin?code=XXXX — lookup booking profile
export async function GET(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const result = await lookupCheckin(code);
  if (!result.booking) return NextResponse.json({ error: "未找到预约记录" }, { status: 404 });
  return NextResponse.json({ ok: true, ...result });
}

// POST /api/admin/checkin — mark as checked in
export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { bookingCode, guideNotes } = await req.json();
  if (!bookingCode) return NextResponse.json({ error: "Missing bookingCode" }, { status: 400 });
  const booking = await checkInBooking(bookingCode, guideNotes);
  if (!booking) return NextResponse.json({ error: "未找到预约记录" }, { status: 404 });
  return NextResponse.json({ ok: true, booking });
}
