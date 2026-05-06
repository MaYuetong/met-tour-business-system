"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MetLogo from "@/components/MetLogo";

const TOTAL_STEPS = 5;

const SECTIONS = [
  { id: "architecture", label: "背景与历史" },
  { id: "medieval",     label: "中世纪艺术" },
  { id: "renaissance",  label: "文艺复兴（拉斐尔特展）" },
  { id: "17-18th",      label: "十七至十八世纪" },
  { id: "impressionism",label: "印象派" },
  { id: "other",        label: "其他" },
];

const PRICE_OPTIONS = [
  { id: "80-100",  label: "$80 – $100" },
  { id: "100-120", label: "$100 – $120" },
  { id: "120-150", label: "$120 – $150" },
  { id: "150+",    label: "$150 以上"   },
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
            fill={(hovered || value) >= star ? "#E51B23" : "none"}
            stroke={(hovered || value) >= star ? "#E51B23" : "#E5E5E5"}
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
  const [codeCopied, setCodeCopied] = useState(false);
  const [form, setForm] = useState({
    visitDate: "",
    gender: "",
    city: "",
    country: "",
    ratings: { overall: 0, clarity: 0, pacing: 0 },
    mostImpressive: [] as string[],
    improvement: "",
    pricePerception: "",
    nps: -1,
    testimonial: "",
    interestedInFuture: "",
    contactEmail: "",
  });

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSection = (id: string) =>
    setForm((f) => ({
      ...f,
      mostImpressive: f.mostImpressive.includes(id)
        ? f.mostImpressive.filter((x) => x !== id)
        : [...f.mostImpressive, id],
    }));

  const canProceed = () => {
    if (step === 1) return !!form.gender && form.ratings.overall > 0 && form.ratings.clarity > 0 && form.ratings.pacing > 0;
    if (step === 2) return form.mostImpressive.length > 0;
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
        <header className="bg-[#E51B23]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <Link href="/" className="text-white">
              <MetLogo className="h-8 w-auto text-white" />
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[#999999]" />
            <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#999999]">参观后问卷</p>
          </div>
          <h2 className="font-noto text-3xl text-[#1A1A1A] font-[300] mb-4">衷心感谢</h2>
          <p className="font-noto text-[#666666] text-base leading-relaxed mb-8">
            您的反馈对我们极为珍贵，将影响每一次未来的导览。
          </p>
          <div className="border border-[#E51B23]/30 mb-8">
            <div className="bg-[#E51B23] px-5 py-3">
              <p className="font-sans-ui text-[11px] tracking-wider text-white uppercase">推荐好友 · 获得返现</p>
            </div>
            <div className="p-5 bg-[#FDF8F8]">
              <p className="font-noto text-[#1A1A1A] mb-1.5">推荐他人预约，获得 <strong className="text-[#E51B23]">$3 返现</strong></p>
              <p className="font-noto text-sm text-[#666666] mb-5 leading-relaxed">
                将以下专属码分享给朋友，对方成功预约导览后，您将获得 $3 返现。
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white border border-[#E5E5E5] px-5 py-3 text-center">
                  <p className="font-sans-ui text-xl tracking-[0.3em] text-[#E51B23] font-[500]">REFERME</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard?.writeText("REFERME"); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }}
                  className="font-sans-ui text-[11px] tracking-widest uppercase border border-[#E5E5E5] bg-white px-4 py-3 hover:border-[#E51B23] hover:text-[#E51B23] transition-colors whitespace-nowrap">
                  {codeCopied ? "已复制 ✓" : "复制码"}
                </button>
              </div>
            </div>
          </div>
          <div className="w-10 h-px bg-[#999999] mb-6" />
          <Link href="/" className="font-sans-ui text-[11px] text-[#E51B23] tracking-wider hover:underline">← 返回首页</Link>
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
      <header className="bg-[#E51B23] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <MetLogo className="h-8 w-auto text-white" />
            <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-white/60 pb-0.5 leading-tight hidden sm:block">欧洲艺术史导览</p>
          </Link>
          <span className="font-sans-ui text-[11px] text-white/70 tracking-wider">{step} / {TOTAL_STEPS}</span>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#999999] mb-2">参观后问卷</p>
          <div className="w-full bg-[#E5E5E5] h-1">
            <div className="bg-[#E51B23] h-1 transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 pb-32 md:pb-12">
        <div className="mb-8">
          <h1 className="font-noto text-3xl sm:text-4xl text-[#1A1A1A] font-[300]">{stepTitles[step - 1]}</h1>
        </div>

        <div key={step} className="step-transition">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block font-noto text-xs text-[#767676] mb-3">参观日期（选填）</label>
                <div className="w-full overflow-hidden border border-[#E5E5E5] focus-within:border-[#E51B23] transition-colors bg-white">
                  <input type="date" value={form.visitDate} onChange={(e) => setField("visitDate", e.target.value)}
                    className="w-full bg-transparent px-4 py-3 font-noto text-sm text-[#1A1A1A] focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
                </div>
              </div>
              <div>
                <p className="font-noto text-xs text-[#767676] mb-3">性别 <span className="text-[#E51B23]">*</span></p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[{ id: "male", label: "男" }, { id: "female", label: "女" }].map((opt) => (
                    <button key={opt.id} onClick={() => setField("gender", opt.id)}
                      className={`py-3 border rounded-sm font-noto text-sm transition-all duration-200 ${form.gender === opt.id ? "border-[#E51B23] bg-[#E51B23] text-white" : "border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#E51B23]"}`}>
                      {opt.label}
                    </button>
                  ))}
                  <button onClick={() => setField("gender", "undisclosed")}
                    className={`col-span-2 sm:col-span-1 py-3 border rounded-sm font-noto text-sm transition-all duration-200 ${form.gender === "undisclosed" ? "border-[#E51B23] bg-[#E51B23] text-white" : "border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#E51B23]"}`}>
                    不便透露
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-noto text-xs text-[#767676] mb-3">来自城市（选填）</label>
                  <input type="text" value={form.city} onChange={(e) => setField("city", e.target.value)}
                    placeholder="例如：北京"
                    className="w-full bg-white border border-[#E5E5E5] rounded-sm px-4 py-3 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#E51B23] transition-colors" />
                </div>
                <div>
                  <label className="block font-noto text-xs text-[#767676] mb-3">来自国家（选填）</label>
                  <input type="text" value={form.country} onChange={(e) => setField("country", e.target.value)}
                    placeholder="例如：中国"
                    className="w-full bg-white border border-[#E5E5E5] rounded-sm px-4 py-3 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#E51B23] transition-colors" />
                </div>
              </div>
              <div className="border-t border-[#E5E5E5] pt-5 space-y-4">
                <p className="text-[#767676] font-noto leading-relaxed text-sm">请对体验的各个方面进行评分。</p>
                {(["overall","clarity","pacing"] as RatingsKey[]).map((key) => (
                  <div key={key} className="bg-white border border-[#E5E5E5] rounded-sm p-6">
                    <div className="mb-4">
                      <div className="font-noto text-[#1A1A1A]">{ratingLabels[key].label}</div>
                      <div className="text-sm text-[#767676] font-noto mt-0.5">{ratingLabels[key].desc}</div>
                    </div>
                    <StarRating value={form.ratings[key]} onChange={(v) => setField("ratings", { ...form.ratings, [key]: v })} />
                    {form.ratings[key] > 0 && (
                      <p className="text-xs text-[#E51B23] font-noto mt-2">{starLabels[form.ratings[key]]}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="font-sans-ui text-[10px] text-[#B0A49A] leading-relaxed tracking-wide border-t border-[#E5E5E5] pt-4">
                本次问卷调查所收集的信息仅用于提升导览体验质量及学术研究用途，所有数据严格保密，不作任何商业用途。
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <p className="font-noto text-[#767676] mb-5 leading-relaxed text-sm">哪个部分给您留下了最深刻的印象？（可多选）</p>
                <div className="grid grid-cols-2 gap-3">
                  {SECTIONS.map((s) => (
                    <button key={s.id} onClick={() => toggleSection(s.id)}
                      className={`py-4 px-5 border rounded-sm text-left font-noto transition-all duration-200 text-sm ${form.mostImpressive.includes(s.id) ? "border-[#E51B23] bg-white text-[#E51B23]" : "border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#E51B23]/50"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-noto text-xs text-[#767676] mb-3">您有什么改进建议？（选填）</label>
                <textarea value={form.improvement} onChange={(e) => setField("improvement", e.target.value)}
                  placeholder="欢迎任何建议..." rows={4}
                  className="w-full bg-white border border-[#E5E5E5] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#E51B23] transition-colors resize-none" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-[#767676] font-noto mb-6 leading-relaxed text-sm">根据今天的体验，您认为合理的价格是多少？</p>
              <div className="grid grid-cols-2 gap-4">
                {PRICE_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setField("pricePerception", opt.id)}
                    className={`py-6 px-5 border rounded-sm font-noto text-lg transition-all duration-200 ${form.pricePerception === opt.id ? "border-[#E51B23] bg-[#E51B23] text-white" : "border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#E51B23]"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-[#767676] font-noto mb-2 text-lg leading-relaxed">您有多大可能向他人推荐这次导览？</p>
              <p className="text-xs text-[#767676] font-noto mb-8">0 = 完全不可能 · 10 = 极有可能</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 11 }, (_, i) => (
                  <button key={i} onClick={() => setField("nps", i)}
                    className={`w-12 h-12 border rounded-sm font-noto text-sm transition-all duration-150 ${form.nps === i ? (i >= 9 ? "border-green-600 bg-green-600 text-white" : i <= 6 ? "border-[#E51B23] bg-[#E51B23] text-white" : "border-[#999999] bg-[#999999] text-white") : "border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#E51B23]/60"}`}>
                    {i}
                  </button>
                ))}
              </div>
              {form.nps >= 0 && (
                <p className="text-sm font-noto text-[#767676] mt-2">
                  {form.nps >= 9 ? "推荐者——谢谢您！" : form.nps >= 7 ? "被动者——感谢您的诚实。" : "批评者——我们会努力改进。"}
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div>
                <label className="block font-noto text-xs text-[#767676] mb-3">评语（选填）</label>
                <textarea value={form.testimonial} onChange={(e) => setField("testimonial", e.target.value)}
                  placeholder="请用几句话分享您的体验..." rows={5}
                  className="w-full bg-white border border-[#E5E5E5] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#E51B23] transition-colors resize-none leading-relaxed" />
              </div>
              <div>
                <p className="font-noto text-[#767676] mb-5 text-sm">有兴趣参加未来的导览或特别展览吗？</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[{ id: "yes", label: "非常有兴趣" }, { id: "no", label: "暂时不需要" }].map((opt) => (
                    <button key={opt.id} onClick={() => setField("interestedInFuture", opt.id)}
                      className={`py-5 px-6 border rounded-sm font-noto transition-all duration-200 ${form.interestedInFuture === opt.id ? "border-[#E51B23] bg-[#E51B23] text-white" : "border-[#E5E5E5] bg-white text-[#1A1A1A] hover:border-[#E51B23]"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block font-noto text-xs text-[#767676] mb-3">您的邮箱（选填）</label>
                  <input type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white border border-[#E5E5E5] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#E51B23] transition-colors" />
                  <p className="text-xs text-[#767676] font-noto mt-2">留下邮箱，即可收到本次问卷内容回顾，以及专属推荐码——分享给朋友预约成功后双方各享优惠。</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center justify-between mt-12 pt-8 border-t border-[#E5E5E5]">
          {step > 1 ? (
            <button onClick={() => setStep((s) => s - 1)}
              className="font-sans-ui text-sm text-[#767676] hover:text-[#1A1A1A] transition-colors tracking-wide flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              上一步
            </button>
          ) : <div />}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
              className={`px-10 py-4 font-sans-ui text-sm tracking-widest uppercase transition-all ${canProceed() ? "bg-[#E51B23] text-white hover:bg-[#C01018]" : "bg-[#E5E5E5] text-[#767676] cursor-not-allowed"}`}>
              下一步 →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-10 py-4 bg-[#E51B23] text-white font-sans-ui text-sm tracking-widest uppercase hover:bg-[#C01018] transition-colors disabled:opacity-60">
              {submitting ? "保存中..." : "提交问卷"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E5E5] p-4">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)}
              className="flex-shrink-0 w-12 h-12 border border-[#E5E5E5] flex items-center justify-center text-[#767676]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
              className={`flex-1 h-12 font-sans-ui text-sm tracking-widest uppercase transition-all ${canProceed() ? "bg-[#E51B23] text-white" : "bg-[#E5E5E5] text-[#767676] cursor-not-allowed"}`}>
              下一步 →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 h-12 bg-[#E51B23] text-white font-sans-ui text-sm tracking-widest uppercase disabled:opacity-60">
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
          <div className="w-8 h-8 border-2 border-[#E51B23] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-sans-ui text-[11px] tracking-widest text-[#767676] uppercase">加载中</p>
        </div>
      </div>
    }>
      <PostSurveyForm />
    </Suspense>
  );
}
