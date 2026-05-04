"use client";

import { useState } from "react";
import Link from "next/link";

const SECTIONS = [
  { id: "architecture",  label: "Architecture & Sculpture" },
  { id: "medieval",      label: "Medieval Art" },
  { id: "renaissance",   label: "Renaissance / Raphael Exhibition" },
  { id: "17-18th",       label: "17th–18th Century" },
  { id: "impressionism", label: "Impressionism" },
  { id: "overall",       label: "The whole tour" },
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div>
      <div className="flex gap-3 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <svg width="40" height="40" viewBox="0 0 24 24"
              fill={active >= star ? "#A6192E" : "none"}
              stroke={active >= star ? "#A6192E" : "#E0D5C8"}
              strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-sm font-garamond text-[#A6192E] h-5">{labels[active]}</p>
      )}
    </div>
  );
}

type FormData = {
  name: string;
  email: string;
  tourDate: string;
  rating: number;
  section: string;
  review: string;
  wouldRecommend: string;
  allowQuote: string;
};

export default function ReviewPage() {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", tourDate: "",
    rating: 0, section: "", review: "",
    wouldRecommend: "", allowQuote: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError]   = useState("");

  const setField = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canSubmit =
    form.name.trim() &&
    form.rating > 0 &&
    form.section &&
    form.review.trim().length >= 10 &&
    form.wouldRecommend &&
    form.allowQuote;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-[#A6192E]/10 flex items-center justify-center mx-auto mb-8">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A6192E" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A84C] font-garamond">Thank You</p>
            <div className="w-8 h-px bg-[#C9A84C]" />
          </div>
          <h2 className="font-playfair text-4xl text-[#1A1A1A] mb-4">
            Your words mean the world.
          </h2>
          <p className="font-garamond text-[#6B5E52] text-lg leading-relaxed mb-10">
            Every review shapes the next guest's experience. Thank you for taking the time.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#A6192E] text-white px-10 py-4 font-garamond text-xs tracking-widest uppercase hover:bg-[#8B1525] transition-colors rounded-sm"
          >
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      {/* Header */}
      <div className="border-b border-[#E0D5C8] bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs text-[#8B7D72] tracking-widest uppercase font-garamond hover:text-[#A6192E] transition-colors">
            ← Back
          </Link>
          <p className="text-xs text-[#8B7D72] font-garamond">MET Art Tour</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-14">

        {/* Title */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A84C] font-garamond">Guest Review</p>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl text-[#1A1A1A] leading-tight mb-4">
            How Was<br />
            <span className="text-[#A6192E]">Your Experience?</span>
          </h1>
          <p className="font-garamond text-[#8B7D72] text-lg leading-relaxed">
            Your honest reflection helps us improve and inspires future guests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Rating */}
          <div>
            <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-4">
              Overall Rating *
            </label>
            <StarPicker value={form.rating} onChange={(v) => setField("rating", v)} />
          </div>

          {/* Name + Email */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-3">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Sarah Chen"
                className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors"
              />
            </div>
            <div>
              <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-3">
                Email (optional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors"
              />
            </div>
          </div>

          {/* Tour Date */}
          <div>
            <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-3">
              Tour Date (optional)
            </label>
            <input
              type="date"
              value={form.tourDate}
              onChange={(e) => setField("tourDate", e.target.value)}
              className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors"
            />
          </div>

          {/* Favourite Section */}
          <div>
            <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-4">
              Most Memorable Section *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setField("section", s.id)}
                  className={`py-4 px-5 border rounded-sm text-left font-garamond text-sm transition-all duration-200 ${
                    form.section === s.id
                      ? "border-[#A6192E] bg-white shadow-sm text-[#A6192E]"
                      : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-3">
              Your Review *
            </label>
            <textarea
              value={form.review}
              onChange={(e) => setField("review", e.target.value)}
              placeholder="Share your experience — what moved you, what surprised you, what you'll remember..."
              rows={6}
              className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none leading-relaxed text-lg"
            />
            <p className="text-xs text-[#8B7D72] font-garamond mt-2">
              {form.review.length < 10 ? `${10 - form.review.length} more characters needed` : `${form.review.length} characters`}
            </p>
          </div>

          {/* Would Recommend */}
          <div>
            <p className="font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-4">
              Would you recommend this tour? *
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[{ id: "yes", label: "Yes, absolutely" }, { id: "no", label: "Not sure" }].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setField("wouldRecommend", opt.id)}
                  className={`py-5 px-6 border rounded-sm font-playfair transition-all duration-200 ${
                    form.wouldRecommend === opt.id
                      ? "border-[#A6192E] bg-[#A6192E] text-white"
                      : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quote Permission */}
          <div className="bg-white border border-[#E0D5C8] rounded-sm p-6">
            <p className="font-playfair text-[#1A1A1A] mb-2">May we share your review?</p>
            <p className="font-garamond text-sm text-[#8B7D72] mb-5 leading-relaxed">
              With your permission, we'd love to feature your words on our website to inspire future guests.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[{ id: "yes", label: "Yes, feel free" }, { id: "no", label: "Keep it private" }].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setField("allowQuote", opt.id)}
                  className={`py-4 px-5 border rounded-sm font-garamond text-sm transition-all duration-200 ${
                    form.allowQuote === opt.id
                      ? opt.id === "yes"
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-[#8B7D72] bg-[#8B7D72] text-white"
                      : "border-[#E0D5C8] bg-[#F8F5F0] text-[#1A1A1A] hover:border-[#8B7D72]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-4 font-garamond text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`w-full py-5 font-garamond text-sm tracking-widest uppercase rounded-sm transition-all duration-200 ${
                canSubmit && !submitting
                  ? "bg-[#A6192E] text-white hover:bg-[#8B1525] shadow-lg shadow-[#A6192E]/20"
                  : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <p className="text-xs text-center text-[#8B7D72] font-garamond mt-3">
              Your review is saved securely. A notification will be sent to the tour guide.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
