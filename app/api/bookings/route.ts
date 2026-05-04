import { NextRequest, NextResponse } from "next/server";
import { createBooking, getBookings, createReferral, useReferral } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, tourDate, paymentType, amount, referralCode } = body;

    if (!name || !email || !paymentType || !amount) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const booking = await createBooking({
      name, email, tourDate, paymentType, amount,
      status: "pending",
      stripeSessionId: body.stripeSessionId,
    });

    if (referralCode) {
      await useReferral(referralCode, booking.id);
    }

    await createReferral(email, name);

    return NextResponse.json({ ok: true, booking }, { status: 201 });
  } catch (e) {
    console.error("Booking error:", e);
    return NextResponse.json({ ok: false, error: "Failed to create booking" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ ok: true, data: bookings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Failed to read bookings" }, { status: 500 });
  }
}
