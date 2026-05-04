"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const TOTAL_STEPS = 5;

const SECTIONS = [
  { id: "architecture", label: "Architecture & Sculpture" },
  { id: "medieval",     label: "Medieval Art" },
  { id: "renaissance",  label: "Renaissance (Raphael Exhibition)" },
  { id: "17-18th",      label: "17th–18th Century" },
  { id: "impressionism",label: "Impressionism" },
  { id: "other",        label: "Other" },
];

const PRICE_OPTIONS = [
  { id: "<50",    label: "Under $50"  },
  { id: "50-75",  label: "$50 – $75"  },
  { id: "75-100", label: "$75 – $100" },
  { id: "100+",   label: "$100+"      },
];

type RatingsKey = "overall" | "clarity" | "pacing";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map((star) => (
        <button key={star} onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110">
          <svg width="32" height="32" viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "#A6192E" : "none"}
            stroke={(hovered || value) >= star ? "#A6192E" : "#E0D5C8"}
            strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function PostSurveyForm() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId") ?? "";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [form, setForm] = useState({
    ratings: { overall: 0, clarity: 0, pacing: 0 },
    mostImpressive: "",
    improvement: "",
    pricePerception: "",
    nps: -1,
    testimonial: "",
    interestedInFuture: "",
    contactEmail: "",
  });

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canProceed = () => {
    if (step === 1) return form.ratings.overall > 0 && form.ratings.clarity > 0 && form.ratings.pacing > 0;
    if (step === 2) return !!form.mostImpressive;
    if (step === 3) return !!form.pricePerception;
    if (step === 4) return form.nps >= 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/surveys/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, bookingId }),
      });

      if (form.interestedInFuture === "yes" && form.contactEmail) {
        const refRes = await fetch("/api/referrals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.contactEmail, name: "Guest" }),
        });
        const refData = await refRes.json();
        if (refData.ok) setReferralLink(refData.link);
      }

      setDone(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="text-[#C9A84C] mb-6">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2 className="font-playfair text-3xl text-[#1A1A1A] mb-4">A Thousand Thanks</h2>
          <p className="text-[#8B7D72] font-garamond text-lg leading-relaxed mb-6">
            Your reflections are deeply valued. They shape every tour that follows.
          </p>

          {referralLink && (
            <div className="bg-white border border-[#E0D5C8] rounded-sm p-6 mb-6 text-left">
              <p className="font-playfair text-[#1A1A1A] mb-2">Share & Earn a Discount</p>
              <p className="text-sm font-garamond text-[#8B7D72] mb-3 leading-relaxed">
                Share your personal link with friends. When they book, you both receive a special benefit.
              </p>
              <div className="bg-[#F8F5F0] border border-[#E0D5C8] rounded-sm px-4 py-3">
                <p className="text-sm font-garamond text-[#A6192E] break-all">{referralLink}</p>
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(referralLink)}
                className="mt-3 text-xs tracking-widest uppercase font-garamond text-[#8B7D72] hover:text-[#A6192E] transition-colors"
              >
                Copy Link
              </button>
            </div>
          )}

          <div className="w-12 h-px bg-[#C9A84C] mx-auto mb-6" />
          <Link href="/" className="text-xs tracking-widest uppercase text-[#A6192E] font-garamond hover:underline">
            ← Return Home
          </Link>
        </div>
      </main>
    );
  }

  const ratingLabels: Record<RatingsKey, { label: string; desc: string }> = {
    overall: { label: "Overall Experience",       desc: "How was the tour as a whole?" },
    clarity: { label: "Clarity & Communication",  desc: "Were explanations easy to follow?" },
    pacing:  { label: "Tour Pacing",              desc: "Was the timing and flow comfortable?" },
  };

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      <div className="border-b border-[#E0D5C8] bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="text-xs text-[#8B7D72] tracking-widest uppercase font-garamond hover:text-[#A6192E] transition-colors">← Back</Link>
            <span className="text-xs text-[#8B7D72] font-garamond">Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="w-full bg-[#E0D5C8] rounded-full h-1">
            <div className="bg-[#A6192E] h-1 rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs tracking-[0.25em] uppercase text-[#C9A84C] font-garamond mb-2">Post-Tour Survey</p>
          <h1 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A]">
            {["Your Impressions","The Highlights","Value & Pricing","Would You Recommend Us?","Final Thoughts"][step-1]}
          </h1>
        </div>

        <div key={step} className="step-transition">
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-[#8B7D72] font-garamond leading-relaxed">Please rate each aspect of your experience.</p>
              {(["overall","clarity","pacing"] as RatingsKey[]).map((key) => (
                <div key={key} className="bg-white border border-[#E0D5C8] rounded-sm p-6">
                  <div className="mb-4">
                    <div className="font-playfair text-[#1A1A1A]">{ratingLabels[key].label}</div>
                    <div className="text-sm text-[#8B7D72] font-garamond mt-0.5">{ratingLabels[key].desc}</div>
                  </div>
                  <StarRating value={form.ratings[key]} onChange={(v) => setField("ratings", { ...form.ratings, [key]: v })} />
                  {form.ratings[key] > 0 && (
                    <p className="text-xs text-[#A6192E] font-garamond mt-2">
                      {["","Needs Improvement","Fair","Good","Very Good","Excellent"][form.ratings[key]]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <p className="font-garamond text-[#8B7D72] mb-5 leading-relaxed">Which section left the deepest impression?</p>
                <div className="grid grid-cols-2 gap-3">
                  {SECTIONS.map((s) => (
                    <button key={s.id} onClick={() => setField("mostImpressive", s.id)}
                      className={`py-4 px-5 border rounded-sm text-left font-garamond transition-all duration-200 text-sm ${form.mostImpressive === s.id ? "border-[#A6192E] bg-white shadow-sm text-[#A6192E]" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]/50"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-3">How could we improve? (optional)</label>
                <textarea value={form.improvement} onChange={(e) => setField("improvement", e.target.value)}
                  placeholder="Any suggestions welcome..." rows={4}
                  className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-[#8B7D72] font-garamond mb-6 leading-relaxed">Based on today, what would you consider fair pricing?</p>
              <div className="grid grid-cols-2 gap-4">
                {PRICE_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setField("pricePerception", opt.id)}
                    className={`py-6 px-5 border rounded-sm font-playfair text-lg transition-all duration-200 ${form.pricePerception === opt.id ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-[#8B7D72] font-garamond mb-2 text-lg leading-relaxed">How likely are you to recommend this tour?</p>
              <p className="text-xs text-[#8B7D72] font-garamond mb-8">0 = Not likely · 10 = Extremely likely</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 11 }, (_, i) => (
                  <button key={i} onClick={() => setField("nps", i)}
                    className={`w-12 h-12 border rounded-sm font-playfair text-sm transition-all duration-150 ${form.nps === i ? (i >= 9 ? "border-green-600 bg-green-600 text-white" : i <= 6 ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#C9A84C] bg-[#C9A84C] text-white") : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]/60"}`}>
                    {i}
                  </button>
                ))}
              </div>
              {form.nps >= 0 && (
                <p className="text-sm font-garamond text-[#8B7D72] mt-2">
                  {form.nps >= 9 ? "Promoter — thank you!" : form.nps >= 7 ? "Passive — we appreciate your honesty." : "Detractor — we'll work hard to improve."}
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div>
                <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-3">Testimonial (optional)</label>
                <textarea value={form.testimonial} onChange={(e) => setField("testimonial", e.target.value)}
                  placeholder="Share your experience in a few words..." rows={5}
                  className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none leading-relaxed" />
              </div>
              <div>
                <p className="font-garamond text-[#8B7D72] mb-5">Interested in future tours or special exhibitions?</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[{ id: "yes", label: "Yes, absolutely" }, { id: "no", label: "Not right now" }].map((opt) => (
                    <button key={opt.id} onClick={() => setField("interestedInFuture", opt.id)}
                      className={`py-5 px-6 border rounded-sm font-playfair transition-all duration-200 ${form.interestedInFuture === opt.id ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {form.interestedInFuture === "yes" && (
                  <div className="animate-fade-in">
                    <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-3">Your email (optional)</label>
                    <input type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
                    <p className="text-xs text-[#8B7D72] font-garamond mt-2">We'll also generate a referral link for you to share with friends.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#E0D5C8]">
          {step > 1 ? (
            <button onClick={() => setStep((s) => s - 1)} className="text-sm font-garamond text-[#8B7D72] tracking-widest uppercase hover:text-[#1A1A1A] transition-colors">
              ← Previous
            </button>
          ) : <div />}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
              className={`px-10 py-4 font-garamond text-sm tracking-widest uppercase transition-all duration-200 rounded-sm ${canProceed() ? "bg-[#A6192E] text-white hover:bg-[#8B1525]" : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"}`}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-10 py-4 bg-[#A6192E] text-white font-garamond text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-colors rounded-sm disabled:opacity-60">
              {submitting ? "Saving..." : "Submit Survey"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PostSurveyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center"><div className="text-[#8B7D72] font-garamond">Loading...</div></div>}>
      <PostSurveyForm />
    </Suspense>
  );
}
