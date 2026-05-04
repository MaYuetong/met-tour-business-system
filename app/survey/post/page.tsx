"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MetLogo from "@/components/MetLogo";

const TOTAL_STEPS = 5;

const SECTIONS = [
  { id: "architecture", label: "建筑与雕塑" },
  { id: "medieval",     label: "中世纪艺术" },
  { id: "renaissance",  label: "文艺复兴（拉斐尔特展）" },
  { id: "17-18th",      label: "十七至十八世纪" },
  { id: "impressionism",label: "印象派" },
  { id: "other",        label: "其他" },
];

const PRICE_OPTIONS = [
  { id: "<50",    label: "$50 以下"  },
  { id: "50-75",  label: "$50 – $75" },
  { id: "75-100", label: "$75 – $100" },
  { id: "100+",   label: "$100 以上" },
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
  const params    = useSearchParams();
  const bookingId = params.get("bookingId") ?? "";

  const [step, setStep]             = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
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
          body: JSON.stringify({ email: form.contactEmail, name: "访客" }),
        });
        const refData = await refRes.json();
        if (refData.ok) setReferralLink(refData.link);
      }
      setDone(true);
    } catch {
      alert("提交失败，请重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-[#A6192E]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <Link href="/" className="text-white">
              <MetLogo className="h-8 w-auto text-white" />
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[#C9A84C]" />
            <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#C9A84C]">参观后问卷</p>
          </div>
          <h2 className="font-noto text-3xl text-[#1A1A1A] font-[300] mb-4">衷心感谢</h2>
          <p className="font-noto text-[#6B5E52] text-base leading-relaxed mb-8">
            您的反馈对我们极为珍贵，将影响每一次未来的导览。
          </p>
          {referralLink && (
            <div className="border border-[#E0D5C8] mb-8">
              <div className="bg-[#F8F5F0] px-5 py-3 border-b border-[#E0D5C8]">
                <p className="font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase">专属推荐链接</p>
              </div>
              <div className="p-5">
                <p className="font-noto text-sm text-[#6B5E52] mb-4 leading-relaxed">
                  将您的专属链接分享给朋友。当他们预约后，双方都将获得特别优惠。
                </p>
                <div className="bg-[#F8F5F0] border border-[#E0D5C8] px-4 py-3 mb-3">
                  <p className="font-noto text-sm text-[#A6192E] break-all">{referralLink}</p>
                </div>
                <button onClick={() => navigator.clipboard?.writeText(referralLink)}
                  className="font-sans-ui text-[11px] tracking-widest uppercase text-[#8B7D72] border border-[#E0D5C8] px-4 py-2 hover:border-[#A6192E] hover:text-[#A6192E] transition-colors">
                  复制链接
                </button>
              </div>
            </div>
          )}
          <div className="w-10 h-px bg-[#C9A84C] mb-6" />
          <Link href="/" className="font-sans-ui text-[11px] text-[#A6192E] tracking-wider hover:underline">← 返回首页</Link>
        </main>
      </div>
    );
  }

  const ratingLabels: Record<RatingsKey, { label: string; desc: string }> = {
    overall: { label: "整体体验",   desc: "整体来说这次导览如何？" },
    clarity: { label: "讲解清晰度", desc: "讲解是否容易理解？" },
    pacing:  { label: "导览节奏",   desc: "时间安排和流程是否舒适？" },
  };

  const starLabels  = ["", "有待改进", "一般", "良好", "很好", "非常好"];
  const stepTitles  = ["您的印象", "最深刻的部分", "价值与定价", "您会推荐这次导览吗？", "最后的感想"];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Red Met header */}
      <header className="bg-[#A6192E] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <MetLogo className="h-8 w-auto text-white" />
            <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-white/60 pb-0.5 leading-tight hidden sm:block">欧洲艺术史导览</p>
          </Link>
          <span className="font-sans-ui text-[11px] text-white/70 tracking-wider">{step} / {TOTAL_STEPS}</span>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-[#F8F5F0] border-b border-[#E0D5C8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#C9A84C] mb-2">参观后问卷</p>
          <div className="w-full bg-[#E0D5C8] h-1">
            <div className="bg-[#A6192E] h-1 transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 pb-32 md:pb-12">
        <div className="mb-8">
          <h1 className="font-noto text-3xl sm:text-4xl text-[#1A1A1A] font-[300]">{stepTitles[step - 1]}</h1>
        </div>

        <div key={step} className="step-transition">
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-[#8B7D72] font-noto leading-relaxed text-sm">请对体验的各个方面进行评分。</p>
              {(["overall","clarity","pacing"] as RatingsKey[]).map((key) => (
                <div key={key} className="bg-white border border-[#E0D5C8] rounded-sm p-6">
                  <div className="mb-4">
                    <div className="font-noto text-[#1A1A1A]">{ratingLabels[key].label}</div>
                    <div className="text-sm text-[#8B7D72] font-noto mt-0.5">{ratingLabels[key].desc}</div>
                  </div>
                  <StarRating value={form.ratings[key]} onChange={(v) => setField("ratings", { ...form.ratings, [key]: v })} />
                  {form.ratings[key] > 0 && (
                    <p className="text-xs text-[#A6192E] font-noto mt-2">{starLabels[form.ratings[key]]}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <p className="font-noto text-[#8B7D72] mb-5 leading-relaxed text-sm">哪个部分给您留下了最深刻的印象？</p>
                <div className="grid grid-cols-2 gap-3">
                  {SECTIONS.map((s) => (
                    <button key={s.id} onClick={() => setField("mostImpressive", s.id)}
                      className={`py-4 px-5 border rounded-sm text-left font-noto transition-all duration-200 text-sm ${form.mostImpressive === s.id ? "border-[#A6192E] bg-white shadow-sm text-[#A6192E]" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]/50"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-noto text-xs text-[#8B7D72] mb-3">您有什么改进建议？（选填）</label>
                <textarea value={form.improvement} onChange={(e) => setField("improvement", e.target.value)}
                  placeholder="欢迎任何建议..." rows={4}
                  className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-[#8B7D72] font-noto mb-6 leading-relaxed text-sm">根据今天的体验，您认为合理的价格是多少？</p>
              <div className="grid grid-cols-2 gap-4">
                {PRICE_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setField("pricePerception", opt.id)}
                    className={`py-6 px-5 border rounded-sm font-noto text-lg transition-all duration-200 ${form.pricePerception === opt.id ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-[#8B7D72] font-noto mb-2 text-lg leading-relaxed">您有多大可能向他人推荐这次导览？</p>
              <p className="text-xs text-[#8B7D72] font-noto mb-8">0 = 完全不可能 · 10 = 极有可能</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 11 }, (_, i) => (
                  <button key={i} onClick={() => setField("nps", i)}
                    className={`w-12 h-12 border rounded-sm font-noto text-sm transition-all duration-150 ${form.nps === i ? (i >= 9 ? "border-green-600 bg-green-600 text-white" : i <= 6 ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#C9A84C] bg-[#C9A84C] text-white") : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]/60"}`}>
                    {i}
                  </button>
                ))}
              </div>
              {form.nps >= 0 && (
                <p className="text-sm font-noto text-[#8B7D72] mt-2">
                  {form.nps >= 9 ? "推荐者——谢谢您！" : form.nps >= 7 ? "被动者——感谢您的诚实。" : "批评者——我们会努力改进。"}
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div>
                <label className="block font-noto text-xs text-[#8B7D72] mb-3">评语（选填）</label>
                <textarea value={form.testimonial} onChange={(e) => setField("testimonial", e.target.value)}
                  placeholder="请用几句话分享您的体验..." rows={5}
                  className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none leading-relaxed" />
              </div>
              <div>
                <p className="font-noto text-[#8B7D72] mb-5 text-sm">有兴趣参加未来的导览或特别展览吗？</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[{ id: "yes", label: "非常有兴趣" }, { id: "no", label: "暂时不需要" }].map((opt) => (
                    <button key={opt.id} onClick={() => setField("interestedInFuture", opt.id)}
                      className={`py-5 px-6 border rounded-sm font-noto transition-all duration-200 ${form.interestedInFuture === opt.id ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {form.interestedInFuture === "yes" && (
                  <div className="animate-fade-in">
                    <label className="block font-noto text-xs text-[#8B7D72] mb-3">您的邮箱（选填）</label>
                    <input type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
                    <p className="text-xs text-[#8B7D72] font-noto mt-2">我们还会为您生成专属推荐链接，分享给朋友后双方都可获得优惠。</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center justify-between mt-12 pt-8 border-t border-[#E0D5C8]">
          {step > 1 ? (
            <button onClick={() => setStep((s) => s - 1)}
              className="font-sans-ui text-sm text-[#8B7D72] hover:text-[#1A1A1A] transition-colors tracking-wide flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              上一步
            </button>
          ) : <div />}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
              className={`px-10 py-4 font-sans-ui text-sm tracking-widest uppercase transition-all ${canProceed() ? "bg-[#A6192E] text-white hover:bg-[#8B1525]" : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"}`}>
              下一步 →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-10 py-4 bg-[#A6192E] text-white font-sans-ui text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-colors disabled:opacity-60">
              {submitting ? "保存中..." : "提交问卷"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E0D5C8] p-4">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)}
              className="flex-shrink-0 w-12 h-12 border border-[#E0D5C8] flex items-center justify-center text-[#8B7D72]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
              className={`flex-1 h-12 font-sans-ui text-sm tracking-widest uppercase transition-all ${canProceed() ? "bg-[#A6192E] text-white" : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"}`}>
              下一步 →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 h-12 bg-[#A6192E] text-white font-sans-ui text-sm tracking-widest uppercase disabled:opacity-60">
              {submitting ? "保存中..." : "提交问卷"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostSurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#A6192E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-sans-ui text-[11px] tracking-widest text-[#8B7D72] uppercase">加载中</p>
        </div>
      </div>
    }>
      <PostSurveyForm />
    </Suspense>
  );
}
