"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function BookingForm() {
  const params = useSearchParams();
  const defaultPlan = params.get("plan") as "full" | "deposit" | null;
  const referralCode = params.get("ref") ?? "";
  const cancelled = params.get("cancelled");

  const [form, setForm] = useState({
    name: "",
    email: "",
    tourDate: "",
    paymentType: defaultPlan ?? "full",
    referralCode,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          tourDate: form.tourDate,
          paymentType: form.paymentType,
          referralCode: form.referralCode,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        if (data.error?.includes("Stripe is not configured")) {
          const amount = form.paymentType === "full" ? 75 : 20;
          const bookRes = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              tourDate: form.tourDate,
              paymentType: form.paymentType,
              amount,
              status: "confirmed",
              referralCode: form.referralCode,
            }),
          });
          const bookData = await bookRes.json();
          if (bookData.ok) {
            window.location.href = `/book/success?name=${encodeURIComponent(form.name)}&email=${encodeURIComponent(form.email)}&paymentType=${form.paymentType}&amount=${amount * 100}&mock=1&bookingId=${bookData.booking.id}`;
            return;
          }
        }
        setError(data.error ?? "Booking failed. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      {/* Header */}
      <div className="border-b border-[#E0D5C8] bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs text-[#8B7D72] tracking-widest uppercase font-garamond hover:text-[#A6192E] transition-colors">
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#A6192E]" />
            <span className="text-xs text-[#8B7D72] font-garamond">Secure Booking</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {cancelled && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-sm p-4 text-sm font-garamond text-amber-800">
            Your payment was not completed. Please try again when you're ready.
          </div>
        )}

        <div className="mb-10">
          <p className="text-xs tracking-[0.25em] uppercase text-[#C9A84C] font-garamond mb-2">Reserve Your Spot</p>
          <h1 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A]">
            Join the Tour
          </h1>
          <p className="font-garamond text-[#8B7D72] mt-3 leading-relaxed">
            European Art History · 3.5 hours · Metropolitan Museum of Art
          </p>
        </div>

        {/* Plan Selection */}
        <div className="mb-8">
          <p className="font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-4">Payment Option</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setField("paymentType", "full")}
              className={`p-6 border rounded-sm text-left transition-all duration-200 ${
                form.paymentType === "full"
                  ? "border-[#A6192E] bg-white shadow-sm"
                  : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"
              }`}
            >
              <p className="font-playfair text-2xl text-[#A6192E] mb-1">$75</p>
              <p className="font-garamond text-sm text-[#1A1A1A] font-medium">Full Payment</p>
              <p className="text-xs text-[#8B7D72] font-garamond mt-0.5">Pay in full today</p>
            </button>

            <button
              type="button"
              onClick={() => setField("paymentType", "deposit")}
              className={`p-6 border rounded-sm text-left transition-all duration-200 ${
                form.paymentType === "deposit"
                  ? "border-[#A6192E] bg-white shadow-sm"
                  : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"
              }`}
            >
              <p className="font-playfair text-2xl text-[#A6192E] mb-1">$20</p>
              <p className="font-garamond text-sm text-[#1A1A1A] font-medium">Deposit</p>
              <p className="text-xs text-[#8B7D72] font-garamond mt-0.5">$55 balance on the day</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Your full name"
              className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors text-lg"
            />
          </div>

          <div>
            <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors text-lg"
            />
          </div>

          <div>
            <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-2">
              Preferred Date (optional)
            </label>
            <input
              type="date"
              value={form.tourDate}
              onChange={(e) => setField("tourDate", e.target.value)}
              className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors"
            />
          </div>

          {referralCode && (
            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-sm p-4">
              <p className="text-sm font-garamond text-[#6B5E52]">
                Referral code applied: <strong>{referralCode}</strong>
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-sm font-garamond text-red-700">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-[#E0D5C8]">
            <div className="flex justify-between items-center mb-4">
              <span className="font-garamond text-[#8B7D72]">
                {form.paymentType === "full" ? "Full tour" : "Deposit"} × 1
              </span>
              <span className="font-playfair text-[#1A1A1A] text-lg">
                ${form.paymentType === "full" ? "75" : "20"}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading || !form.name || !form.email}
              className={`w-full py-5 font-garamond text-sm tracking-widest uppercase transition-all duration-200 rounded-sm ${
                loading || !form.name || !form.email
                  ? "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
                  : "bg-[#A6192E] text-white hover:bg-[#8B1525] shadow-lg shadow-[#A6192E]/20"
              }`}
            >
              {loading ? "Redirecting to Payment..." : `Proceed to Payment — $${form.paymentType === "full" ? "75" : "20"}`}
            </button>
            <p className="text-xs text-center text-[#8B7D72] font-garamond mt-3">
              Secured by Stripe · No card details stored here
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-[#8B7D72] font-garamond">Loading...</div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
