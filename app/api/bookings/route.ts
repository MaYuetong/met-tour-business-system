import { NextRequest, NextResponse } from "next/server";
import { createBooking, getBookings, createReferral, useReferral, findGuideForDate } from "@/lib/db";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, tourDate, paymentType, amount, referralCode } = body;

    if (!name || !email || !paymentType || amount == null) {
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

    const guide = await findGuideForDate(tourDate);

    await sendBookingConfirmation({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      tourDate: booking.tourDate,
      amount: booking.amount,
      paymentType: booking.paymentType,
      bookingCode: booking.bookingCode,
      guideWechat: guide?.wechatId,
    });

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
