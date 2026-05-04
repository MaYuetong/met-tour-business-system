"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const name = params.get("name") ?? "Guest";
  const email = params.get("email") ?? "";
  const paymentType = params.get("paymentType") ?? "full";
  const amount = params.get("amount") ?? "7500";
  const sessionId = params.get("session_id");
  const isMock = params.get("mock") === "1";
  const bookingId = params.get("bookingId");

  const [bookingCreated, setBookingCreated] = useState(false);

  useEffect(() => {
    if (bookingCreated) return;
    if (isMock && bookingId) {
      setBookingCreated(true);
      return;
    }
    if (sessionId && !isMock) {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          paymentType,
          amount: parseInt(amount) / 100,
          status: "confirmed",
          stripeSessionId: sessionId,
        }),
      }).then(() => setBookingCreated(true));
    }
  }, [name, email, paymentType, amount, sessionId, isMock, bookingId, bookingCreated]);

  const paidAmount = parseInt(amount) / 100;

  return (
    <main className="min-h-screen bg-[#F8F5F0] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center animate-fade-in">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-[#A6192E]/10 flex items-center justify-center mx-auto mb-8">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A6192E" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div className="flex items-center gap-4 justify-center mb-6">
          <div className="w-8 h-px bg-[#C9A84C]" />
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9A84C] font-garamond">Booking Confirmed</p>
          <div className="w-8 h-px bg-[#C9A84C]" />
        </div>

        <h1 className="font-playfair text-4xl text-[#1A1A1A] mb-4">
          Welcome, {name}.
        </h1>

        <p className="font-garamond text-[#6B5E52] text-lg leading-relaxed mb-8">
          Your spot is reserved for the European Art History Tour at the Metropolitan Museum of Art.
          {paymentType === "deposit" && " The $55 balance will be collected on the day of the tour."}
        </p>

        <div className="bg-white border border-[#E0D5C8] rounded-sm p-6 mb-8 text-left">
          <p className="font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-4">Booking Summary</p>
          <div className="space-y-3">
            {[
              { label: "Name", value: name },
              { label: "Email", value: email },
              { label: "Payment", value: paymentType === "full" ? "Full — $75" : `Deposit — $${paidAmount} (+ $55 balance)` },
              { label: "Duration", value: "3.5 hours" },
              { label: "Location", value: "Metropolitan Museum of Art, NYC" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="font-garamond text-sm text-[#8B7D72]">{row.label}</span>
                <span className="font-garamond text-sm text-[#1A1A1A]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#A6192E]/5 border border-[#A6192E]/20 rounded-sm p-5 mb-8 text-left">
          <p className="font-playfair text-[#A6192E] mb-2">Next Step: Pre-Tour Survey</p>
          <p className="font-garamond text-sm text-[#6B5E52] leading-relaxed">
            Please complete a short survey so we can personalize the tour to your interests and knowledge level.
            It takes only 3 minutes.
          </p>
        </div>

        <Link
          href={`/survey/pre?bookingId=${bookingId ?? ""}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`}
          className="inline-flex items-center gap-3 bg-[#A6192E] text-white px-12 py-5 font-garamond text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-colors rounded-sm mb-6"
        >
          Begin Pre-Tour Survey <span>→</span>
        </Link>

        <div className="mt-4">
          <Link href="/" className="text-xs text-[#8B7D72] font-garamond tracking-widest uppercase hover:text-[#A6192E] transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-[#8B7D72] font-garamond">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
