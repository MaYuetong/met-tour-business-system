"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const TIME_SLOTS = [
  { id: "10:00", label: "10:00 AM", note: "Morning — galleries are quietest" },
  { id: "14:00", label: "2:00 PM",  note: "Afternoon — popular slot" },
];

const GROUP_SIZES = [1, 2, 3, 4, 5, 6];

function BookingForm() {
  const params = useSearchParams();
  const defaultPlan    = (params.get("plan") as "full" | "deposit") ?? "full";
  const referralCode   = params.get("ref") ?? "";
  const wasCancelled   = params.get("cancelled") === "1";

  const [step, setStep] = useState(1);
  const TOTAL = 3;

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    tourDate: "", timeSlot: "", groupSize: 1,
    notes: "", paymentType: defaultPlan, referralCode,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canNext = () => {
    if (step === 1) return !!(form.name.trim() && form.email.trim());
    if (step === 2) return !!(form.tourDate && form.timeSlot && form.groupSize);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.error?.includes("not configured")) {
          // Mock mode — save directly and redirect
          const amount = form.paymentType === "full" ? 75 : 20;
          const bookRes = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, amount, status: "confirmed" }),
          });
          const bookData = await bookRes.json();
          if (bookData.ok) {
            window.location.href =
              `/book/success?name=${encodeURIComponent(form.name)}&email=${encodeURIComponent(form.email)}&paymentType=${form.paymentType}&amount=${amount * 100}&mock=1&bookingId=${bookData.booking.id}`;
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      {/* Header */}
      <div className="border-b border-[#E0D5C8] bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="text-xs text-[#8B7D72] tracking-widest uppercase font-garamond hover:text-[#A6192E] transition-colors">
              ← Back
            </Link>
            <span className="text-xs text-[#8B7D72] font-garamond">Step {step} of {TOTAL}</span>
          </div>
          <div className="w-full bg-[#E0D5C8] rounded-full h-1">
            <div className="bg-[#A6192E] h-1 rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12">

        {wasCancelled && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-sm p-4 text-sm font-garamond text-amber-800">
            Your payment was not completed. No charge was made — please try again.
          </div>
        )}

        {/* Title */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-px bg-[#C9A84C]" />
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A84C] font-garamond">
              {step === 1 ? "Your Details" : step === 2 ? "Choose Your Date" : "Payment"}
            </p>
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A]">
            {step === 1 && "Reserve Your Spot"}
            {step === 2 && "When Would You Like to Come?"}
            {step === 3 && "Complete Your Booking"}
          </h1>
          {step === 1 && (
            <p className="font-garamond text-[#8B7D72] mt-3 leading-relaxed">
              European Art History · 3.5 hours · Metropolitan Museum of Art · Max 6 guests
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div key={step} className="step-transition space-y-6">

            {/* ── Step 1: Personal Info ── */}
            {step === 1 && (
              <>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-2">Full Name *</label>
                    <input
                      type="text" required value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-white border border-[#E0D5C8] rounded-sm px-4 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-2">Email Address *</label>
                    <input
                      type="email" required value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-[#E0D5C8] rounded-sm px-4 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-2">Phone (optional)</label>
                  <input
                    type="tel" value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+1 (212) 555-0000"
                    className="w-full bg-white border border-[#E0D5C8] rounded-sm px-4 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors"
                  />
                </div>

                {referralCode && (
                  <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-sm p-4">
                    <p className="text-sm font-garamond text-[#6B5E52]">
                      ✓ Referral code <strong>{referralCode}</strong> applied
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── Step 2: Date & Group ── */}
            {step === 2 && (
              <>
                <div>
                  <label className="block font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-2">Preferred Date *</label>
                  <input
                    type="date" required value={form.tourDate} min={today}
                    onChange={(e) => set("tourDate", e.target.value)}
                    className="w-full bg-white border border-[#E0D5C8] rounded-sm px-4 py-4 font-garamond text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors"
                  />
                  <p className="text-xs text-[#8B7D72] font-garamond mt-2">Tours run Saturdays & Sundays. We'll confirm availability by email.</p>
                </div>

                <div>
                  <label className="block font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-3">Time Slot *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot.id} type="button"
                        onClick={() => set("timeSlot", slot.id)}
                        className={`p-5 border rounded-sm text-left transition-all duration-200 ${
                          form.timeSlot === slot.id
                            ? "border-[#A6192E] bg-white shadow-sm"
                            : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"
                        }`}
                      >
                        <p className="font-playfair text-[#1A1A1A] text-lg">{slot.label}</p>
                        <p className="text-xs text-[#8B7D72] font-garamond mt-1">{slot.note}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-3">Number of Guests *</label>
                  <div className="flex gap-3 flex-wrap">
                    {GROUP_SIZES.map((n) => (
                      <button
                        key={n} type="button"
                        onClick={() => set("groupSize", n)}
                        className={`w-14 h-14 border rounded-sm font-playfair text-lg transition-all duration-150 ${
                          form.groupSize === n
                            ? "border-[#A6192E] bg-[#A6192E] text-white"
                            : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#8B7D72] font-garamond mt-2">Maximum 6 guests per tour</p>
                </div>

                <div>
                  <label className="block font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-2">
                    Special Requests (optional)
                  </label>
                  <textarea
                    value={form.notes} onChange={(e) => set("notes", e.target.value)}
                    placeholder="Accessibility needs, languages, topics you'd love to focus on..."
                    rows={3}
                    className="w-full bg-white border border-[#E0D5C8] rounded-sm px-4 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none"
                  />
                </div>
              </>
            )}

            {/* ── Step 3: Payment ── */}
            {step === 3 && (
              <>
                {/* Booking summary */}
                <div className="bg-white border border-[#E0D5C8] rounded-sm p-6 mb-2">
                  <p className="font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-4">Booking Summary</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Guest",    value: form.name },
                      { label: "Email",    value: form.email },
                      { label: "Date",     value: form.tourDate   ? new Date(form.tourDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "—" },
                      { label: "Time",     value: form.timeSlot   ? (form.timeSlot === "10:00" ? "10:00 AM" : "2:00 PM") : "—" },
                      { label: "Guests",   value: `${form.groupSize} ${form.groupSize === 1 ? "person" : "people"}` },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span className="font-garamond text-sm text-[#8B7D72]">{row.label}</span>
                        <span className="font-garamond text-sm text-[#1A1A1A]">{row.value}</span>
                      </div>
                    ))}
                    {form.notes && (
                      <div className="pt-2 border-t border-[#E0D5C8]">
                        <span className="font-garamond text-xs text-[#8B7D72]">Note: {form.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment type */}
                <div>
                  <p className="font-garamond text-xs text-[#8B7D72] uppercase tracking-widest mb-3">Payment Option</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "full",    price: "$75", sub: "Full payment today" },
                      { id: "deposit", price: "$20", sub: "$55 balance on the day" },
                    ].map((opt) => (
                      <button
                        key={opt.id} type="button"
                        onClick={() => set("paymentType", opt.id)}
                        className={`p-5 border rounded-sm text-left transition-all duration-200 ${
                          form.paymentType === opt.id
                            ? "border-[#A6192E] bg-white shadow-sm"
                            : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"
                        }`}
                      >
                        <p className="font-playfair text-2xl text-[#A6192E]">{opt.price}</p>
                        <p className="font-garamond text-xs text-[#8B7D72] mt-1">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-sm font-garamond text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className={`w-full py-5 font-garamond text-sm tracking-widest uppercase rounded-sm transition-all duration-200 ${
                    !loading
                      ? "bg-[#A6192E] text-white hover:bg-[#8B1525] shadow-lg shadow-[#A6192E]/20"
                      : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
                  }`}
                >
                  {loading
                    ? "Redirecting..."
                    : `Pay ${form.paymentType === "full" ? "$75" : "$20"} →`}
                </button>
                <p className="text-xs text-center text-[#8B7D72] font-garamond mt-2">
                  Secured by Stripe · No card details stored on our servers
                </p>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#E0D5C8]">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)}
                className="text-sm font-garamond text-[#8B7D72] tracking-widest uppercase hover:text-[#1A1A1A] transition-colors">
                ← Previous
              </button>
            ) : <div />}

            {step < TOTAL && (
              <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
                className={`px-10 py-4 font-garamond text-sm tracking-widest uppercase rounded-sm transition-all duration-200 ${
                  canNext()
                    ? "bg-[#A6192E] text-white hover:bg-[#8B1525]"
                    : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
                }`}>
                Continue →
              </button>
            )}
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
