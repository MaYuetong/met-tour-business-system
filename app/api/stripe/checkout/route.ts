import { NextRequest, NextResponse } from "next/server";
import { PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, paymentType, tourDate, referralCode } = body;

    if (!name || !email || !paymentType) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({
        ok: false,
        error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local",
      }, { status: 503 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const amount = paymentType === "full" ? PRICES.full : PRICES.deposit;
    const host = req.headers.get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: paymentType === "full"
                ? "MET Art Tour — Full Payment ($86)"
                : "MET Art Tour — Deposit ($20)",
              description: "European Art History guided tour at the Metropolitan Museum of Art, including Raphael Exhibition",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        guestName: name,
        tourDate: tourDate ?? "",
        paymentType,
        referralCode: referralCode ?? "",
      },
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&paymentType=${paymentType}&amount=${amount}`,
      cancel_url: `${baseUrl}/book?cancelled=1`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json({ ok: false, error: "Payment session failed" }, { status: 500 });
  }
}
