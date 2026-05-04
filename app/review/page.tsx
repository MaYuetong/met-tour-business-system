"use client";

import { useState } from "react";
import Link from "next/link";

const SECTIONS = [
  { id: "architecture",  label: "建筑与雕塑" },
  { id: "medieval",      label: "中世纪艺术" },
  { id: "renaissance",   label: "文艺复兴 / 拉斐尔特展" },
  { id: "17-18th",       label: "十七至十八世纪" },
  { id: "impressionism", label: "印象派" },
  { id: "overall",       label: "整场导览" },
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const labels = ["", "较差", "一般", "良好", "很好", "非常好"];

  return (
    <div>
      <div className="flex gap-3 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95">
            <svg width="40" height="40" viewBox="0 0 24 24"
              fill={active >= star ? "#A6192E" : "none"}
              stroke={active >= star ? "#A6192E" : "#E0D5C8"}
              strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && <p className="text-sm font-noto text-[#A6192E] h-5">{labels[active]}</p>}
    </div>
  );
}

type FormData = {
  name: string; email: string; tourDate: string;
  rating: number; section: string; review: string;
  wouldRecommend: string; allowQuote: string;
};

export default function ReviewPage() {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", tourDate: "",
    rating: 0, section: "", review: "",
    wouldRecommend: "", allowQuote: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState("");

  const setField = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canSubmit =
    form.name.trim() && form.rating > 0 && form.section &&
    form.review.trim().length >= 10 && form.wouldRecommend && form.allowQuote;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true); setError("");
    try {
      const res  = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "出现错误，请重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-[#A6192E]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <Link href="/" className="flex flex-col leading-[0.8]">
              <span className="font-sans-ui font-black text-[17px] tracking-[-0.03em] text-white uppercase">THE</span>
              <span className="font-sans-ui font-black text-[17px] tracking-[-0.03em] text-white uppercase">MET</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 bg-[#A6192E] flex items-center justify-center mx-auto mb-8">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex items-center gap-3 justify-center mb-4">
              <div className="w-6 h-px bg-[#C9A84C]" />
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#C9A84C]">感谢您</p>
              <div className="w-6 h-px bg-[#C9A84C]" />
            </div>
            <h2 className="font-noto text-3xl text-[#1A1A1A] font-[300] mb-4">您的文字意义重大。</h2>
            <p className="font-noto text-[#6B5E52] leading-relaxed mb-10">
              每一条评语都会影响下一位访客的体验。感谢您花时间分享。
            </p>
            <Link href="/"
              className="inline-block bg-[#A6192E] text-white px-10 py-4 font-sans-ui text-xs tracking-widest uppercase hover:bg-[#8B1525] transition-colors">
              返回首页
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Red Met header */}
      <header className="bg-[#A6192E] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-end gap-2.5">
            <div className="flex flex-col leading-[0.8]">
              <span className="font-sans-ui font-black text-[17px] tracking-[-0.03em] text-white uppercase">THE</span>
              <span className="font-sans-ui font-black text-[17px] tracking-[-0.03em] text-white uppercase">MET</span>
            </div>
            <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-white/60 pb-0.5 leading-tight hidden sm:block">欧洲艺术史导览</p>
          </Link>
          <Link href="/"
            className="font-sans-ui text-[11px] text-white/70 tracking-wider hover:text-white transition-colors flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            返回
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 pb-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-[#C9A84C]" />
            <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#C9A84C]">访客评语</p>
          </div>
          <h1 className="font-noto text-3xl sm:text-4xl text-[#1A1A1A] font-[300] leading-tight mb-3">
            您的体验<span className="text-[#A6192E]">如何？</span>
          </h1>
          <p className="font-noto text-[#8B7D72] leading-relaxed">
            您诚实的反馈帮助我们改进，并给未来的访客提供参考。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          <div>
            <label className="block font-noto text-xs text-[#8B7D72] mb-4">总体评分 *</label>
            <StarPicker value={form.rating} onChange={(v) => setField("rating", v)} />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block font-noto text-xs text-[#8B7D72] mb-3">您的姓名 *</label>
              <input type="text" required value={form.name} onChange={(e) => setField("name", e.target.value)}
                placeholder="例如：李雷"
                className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
            </div>
            <div>
              <label className="block font-noto text-xs text-[#8B7D72] mb-3">邮箱（选填）</label>
              <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
            </div>
          </div>

          <div>
            <label className="block font-noto text-xs text-[#8B7D72] mb-3">导览日期（选填）</label>
            <input type="date" value={form.tourDate} onChange={(e) => setField("tourDate", e.target.value)}
              className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors" />
          </div>

          <div>
            <label className="block font-noto text-xs text-[#8B7D72] mb-4">印象最深的部分 *</label>
            <div className="grid grid-cols-2 gap-3">
              {SECTIONS.map((s) => (
                <button key={s.id} type="button" onClick={() => setField("section", s.id)}
                  className={`py-4 px-5 border rounded-sm text-left font-noto text-sm transition-all duration-200 ${
                    form.section === s.id ? "border-[#A6192E] bg-white shadow-sm text-[#A6192E]" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]/50"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-noto text-xs text-[#8B7D72] mb-3">您的评语 *</label>
            <textarea value={form.review} onChange={(e) => setField("review", e.target.value)}
              placeholder="分享您的体验——什么打动了您，什么让您惊喜，什么令您难忘……"
              rows={6}
              className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none leading-relaxed text-lg" />
            <p className="text-xs text-[#8B7D72] font-noto mt-2">
              {form.review.length < 10 ? `还需 ${10 - form.review.length} 个字符` : `${form.review.length} 字符`}
            </p>
          </div>

          <div>
            <p className="font-noto text-xs text-[#8B7D72] mb-4">您会推荐这次导览吗？ *</p>
            <div className="grid grid-cols-2 gap-4">
              {[{ id: "yes", label: "强烈推荐" }, { id: "no", label: "不确定" }].map((opt) => (
                <button key={opt.id} type="button" onClick={() => setField("wouldRecommend", opt.id)}
                  className={`py-5 px-6 border rounded-sm font-noto transition-all duration-200 ${
                    form.wouldRecommend === opt.id ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E0D5C8] rounded-sm p-6">
            <p className="font-noto text-[#1A1A1A] mb-2 font-medium">我们可以分享您的评语吗？</p>
            <p className="font-noto text-sm text-[#8B7D72] mb-5 leading-relaxed">
              经您许可，我们希望在网站上分享您的评语，以激励未来的访客。
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[{ id: "yes", label: "可以，欢迎分享" }, { id: "no", label: "请保密" }].map((opt) => (
                <button key={opt.id} type="button" onClick={() => setField("allowQuote", opt.id)}
                  className={`py-4 px-5 border rounded-sm font-noto text-sm transition-all duration-200 ${
                    form.allowQuote === opt.id
                      ? opt.id === "yes" ? "border-green-600 bg-green-600 text-white" : "border-[#8B7D72] bg-[#8B7D72] text-white"
                      : "border-[#E0D5C8] bg-[#F8F5F0] text-[#1A1A1A] hover:border-[#8B7D72]"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-4 font-noto text-sm text-red-700">{error}</div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={!canSubmit || submitting}
              className={`w-full py-4 font-sans-ui text-sm tracking-widest uppercase transition-all ${
                canSubmit && !submitting
                  ? "bg-[#A6192E] text-white hover:bg-[#8B1525]"
                  : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
              }`}>
              {submitting ? "提交中..." : "提交评语"}
            </button>
            <p className="font-sans-ui text-[10px] text-center text-[#8B7D72] tracking-wider mt-3">
              您的评语已安全保存。导览员将收到通知。
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
