"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const TIME_SLOTS = [
  { id: "10:00", label: "上午 10:00", note: "上午场 · 人流最少" },
  { id: "14:00", label: "下午 2:00",  note: "下午场 · 最受欢迎" },
];

const GROUP_SIZES = [1, 2, 3, 4, 5, 6];

const STEPS = [
  { num: 1, label: "个人信息" },
  { num: 2, label: "日期与人数" },
  { num: 3, label: "确认支付" },
];

function BookingForm() {
  const params = useSearchParams();
  const defaultPlan  = (params.get("plan") as "full" | "deposit") ?? "full";
  const referralCode = params.get("ref") ?? "";
  const wasCancelled = params.get("cancelled") === "1";

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    tourDate: "", timeSlot: "", groupSize: 1,
    hasElderly: false, elderlyCount: 1,
    hasChildren: false, childrenCount: 1, childrenAges: [""],
    notes: "", paymentType: defaultPlan, referralCode,
  });

  const set = (key: string, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setChildrenCount = (n: number) =>
    setForm(f => ({
      ...f, childrenCount: n,
      childrenAges: Array.from({ length: n }, (_, i) => f.childrenAges[i] ?? ""),
    }));

  const setChildAge = (i: number, age: string) =>
    setForm(f => ({
      ...f, childrenAges: f.childrenAges.map((a, idx) => idx === i ? age : a),
    }));

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
      const res  = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.error?.includes("not configured")) {
          const amount = form.paymentType === "full" ? 75 : 20;
          const bookRes  = await fetch("/api/bookings", {
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
        setError(data.error ?? "预约失败，请重试。");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("发生错误，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Met-style Red Header ─────────────────────────────────────── */}
      <header className="bg-[#A6192E] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-end gap-2.5 group">
            <div className="flex flex-col leading-[0.8]">
              <span className="font-sans-ui font-black text-[17px] tracking-[-0.03em] text-white uppercase">THE</span>
              <span className="font-sans-ui font-black text-[17px] tracking-[-0.03em] text-white uppercase">MET</span>
            </div>
            <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-white/60 pb-0.5 leading-tight hidden sm:block">
              欧洲艺术史导览
            </p>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/"
              className="font-sans-ui text-[11px] text-white/70 tracking-wider hover:text-white transition-colors flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              返回
            </Link>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb + Step indicator ──────────────────────────────── */}
      <div className="bg-[#F8F5F0] border-b border-[#E0D5C8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          {/* Breadcrumb */}
          <p className="font-sans-ui text-[11px] text-[#8B7D72] tracking-wide mb-3">
            <Link href="/" className="hover:text-[#A6192E] transition-colors underline underline-offset-2">首页</Link>
            <span className="mx-2 text-[#C8BDB5]">/</span>
            <span>预约导览</span>
          </p>

          {/* Step dots */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 ${step === s.num ? "opacity-100" : step > s.num ? "opacity-70" : "opacity-40"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-sans-ui font-bold transition-colors ${
                    step > s.num
                      ? "bg-[#A6192E] text-white"
                      : step === s.num
                      ? "bg-[#A6192E] text-white"
                      : "bg-[#E0D5C8] text-[#8B7D72]"
                  }`}>
                    {step > s.num ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : s.num}
                  </div>
                  <span className="font-sans-ui text-[11px] tracking-wide hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 sm:w-16 mx-2 sm:mx-3 transition-colors ${step > s.num ? "bg-[#A6192E]" : "bg-[#E0D5C8]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 pb-32 md:pb-12">

        {wasCancelled && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 text-sm font-noto text-amber-800">
            支付未完成，未产生任何费用。请重新填写预约信息。
          </div>
        )}

        {/* Desktop: two-column. Mobile: single column */}
        <div className="grid md:grid-cols-[1fr_320px] gap-10 items-start">

          {/* ── Left: form ── */}
          <div>
            {/* Step hero — mirrors Met event page heading style */}
            <div className="mb-8">
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#C9A84C] mb-2">
                步骤 {step} / {STEPS.length}
              </p>
              <h1 className="font-noto text-3xl sm:text-4xl text-[#1A1A1A] font-[300] leading-tight">
                {["填写您的信息", "选择参观日期", "确认并支付"][step - 1]}
              </h1>
              {step === 1 && (
                <p className="font-noto text-[#8B7D72] mt-3 text-sm leading-relaxed">
                  大都会艺术博物馆 · 欧洲艺术史私人导览 · 最多 6 人
                </p>
              )}
              {step === 2 && (
                <p className="font-noto text-[#8B7D72] mt-3 text-sm leading-relaxed">
                  导览于每周末举行，我们将在 24 小时内以邮件确认您的预约。
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div key={step} className="step-transition">

                {/* ──── Step 1: Personal info ──── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-2">
                          姓名 <span className="text-[#A6192E]">*</span>
                        </label>
                        <input type="text" required value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="请输入您的姓名"
                          className="w-full bg-white border border-[#E0D5C8] px-4 py-4 font-noto text-base text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
                      </div>
                      <div>
                        <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-2">
                          电子邮箱 <span className="text-[#A6192E]">*</span>
                        </label>
                        <input type="email" required value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="your@email.com"
                          className="w-full bg-white border border-[#E0D5C8] px-4 py-4 font-noto text-base text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-2">
                        联系电话 <span className="text-[#C8BDB5]">选填</span>
                      </label>
                      <input type="tel" value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+1 (212) 555-0000"
                        className="w-full bg-white border border-[#E0D5C8] px-4 py-4 font-noto text-base text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
                    </div>

                    {referralCode && (
                      <div className="flex items-center gap-3 bg-[#C9A84C]/10 border border-[#C9A84C]/30 p-4">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <p className="font-noto text-sm text-[#6B5E52]">
                          推荐码 <strong>{referralCode}</strong> 已应用
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ──── Step 2: Date & group ──── */}
                {step === 2 && (
                  <div className="space-y-6">

                    {/* Date picker */}
                    <div>
                      <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-2">
                        参观日期 <span className="text-[#A6192E]">*</span>
                      </label>
                      <input type="date" required value={form.tourDate} min={today}
                        onChange={(e) => set("tourDate", e.target.value)}
                        className="w-full bg-white border border-[#E0D5C8] px-4 py-4 font-noto text-base text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors" />
                      <p className="font-sans-ui text-[11px] text-[#8B7D72] mt-2 tracking-wide">
                        导览于周六、周日举行，我们将以邮件确认可用场次。
                      </p>
                    </div>

                    {/* Time slot */}
                    <div>
                      <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-3">
                        场次选择 <span className="text-[#A6192E]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {TIME_SLOTS.map((slot) => (
                          <button key={slot.id} type="button" onClick={() => set("timeSlot", slot.id)}
                            className={`p-4 sm:p-5 border text-left transition-all ${
                              form.timeSlot === slot.id
                                ? "border-[#A6192E] bg-white shadow-sm ring-1 ring-[#A6192E]/20"
                                : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"
                            }`}>
                            <p className="font-noto text-[#1A1A1A] text-lg font-[400]">{slot.label}</p>
                            <p className="font-sans-ui text-[11px] text-[#8B7D72] mt-1 tracking-wide">{slot.note}</p>
                            {form.timeSlot === slot.id && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <div className="w-3.5 h-3.5 rounded-full bg-[#A6192E] flex items-center justify-center">
                                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                </div>
                                <span className="font-sans-ui text-[10px] text-[#A6192E] tracking-wider">已选择</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Group size */}
                    <div>
                      <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-3">
                        参观人数 <span className="text-[#A6192E]">*</span>
                      </label>
                      <div className="flex gap-2.5 flex-wrap">
                        {GROUP_SIZES.map((n) => (
                          <button key={n} type="button" onClick={() => set("groupSize", n)}
                            className={`w-14 h-14 border font-noto text-lg transition-all ${
                              form.groupSize === n
                                ? "border-[#A6192E] bg-[#A6192E] text-white shadow-sm"
                                : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"
                            }`}>
                            {n}
                          </button>
                        ))}
                      </div>
                      <p className="font-sans-ui text-[11px] text-[#8B7D72] mt-2 tracking-wide">每场最多 6 人</p>
                    </div>

                    {/* Elderly */}
                    <div className="bg-[#F8F5F0] border border-[#E0D5C8] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-noto text-sm text-[#1A1A1A]">团队中有老年人吗？</p>
                        <div className="flex gap-2 flex-shrink-0">
                          {([{ val: true, label: "有" }, { val: false, label: "没有" }] as const).map(opt => (
                            <button key={String(opt.val)} type="button"
                              onClick={() => set("hasElderly", opt.val)}
                              className={`px-4 py-2 text-xs font-sans-ui tracking-wider border transition-all ${
                                form.hasElderly === opt.val
                                  ? "border-[#A6192E] bg-[#A6192E] text-white"
                                  : "border-[#E0D5C8] bg-white text-[#8B7D72] hover:border-[#A6192E]/50"
                              }`}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                      {form.hasElderly && (
                        <div className="mt-4 pt-4 border-t border-[#E0D5C8]">
                          <p className="font-sans-ui text-[11px] text-[#8B7D72] tracking-wider uppercase mb-3">老年人人数</p>
                          <div className="flex gap-2 flex-wrap">
                            {[1,2,3,4,5,6].map(n => (
                              <button key={n} type="button" onClick={() => set("elderlyCount", n)}
                                className={`w-12 h-12 border font-noto text-sm transition-all ${
                                  form.elderlyCount === n
                                    ? "border-[#A6192E] bg-[#A6192E] text-white"
                                    : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"
                                }`}>{n}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Children */}
                    <div className="bg-[#F8F5F0] border border-[#E0D5C8] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-noto text-sm text-[#1A1A1A]">团队中有儿童吗？</p>
                        <div className="flex gap-2 flex-shrink-0">
                          {([{ val: true, label: "有" }, { val: false, label: "没有" }] as const).map(opt => (
                            <button key={String(opt.val)} type="button"
                              onClick={() => set("hasChildren", opt.val)}
                              className={`px-4 py-2 text-xs font-sans-ui tracking-wider border transition-all ${
                                form.hasChildren === opt.val
                                  ? "border-[#A6192E] bg-[#A6192E] text-white"
                                  : "border-[#E0D5C8] bg-white text-[#8B7D72] hover:border-[#A6192E]/50"
                              }`}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                      {form.hasChildren && (
                        <div className="mt-4 pt-4 border-t border-[#E0D5C8] space-y-4">
                          <div>
                            <p className="font-sans-ui text-[11px] text-[#8B7D72] tracking-wider uppercase mb-3">儿童人数</p>
                            <div className="flex gap-2 flex-wrap">
                              {[1,2,3,4,5].map(n => (
                                <button key={n} type="button" onClick={() => setChildrenCount(n)}
                                  className={`w-12 h-12 border font-noto text-sm transition-all ${
                                    form.childrenCount === n
                                      ? "border-[#A6192E] bg-[#A6192E] text-white"
                                      : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"
                                  }`}>{n}</button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {form.childrenAges.map((age, i) => (
                              <div key={i}>
                                <label className="block font-sans-ui text-[10px] text-[#8B7D72] tracking-wider uppercase mb-1.5">
                                  第 {i + 1} 位 · 年龄（岁）
                                </label>
                                <input type="number" min="0" max="17" value={age}
                                  onChange={e => setChildAge(i, e.target.value)}
                                  placeholder="例如：8"
                                  className="w-full bg-white border border-[#E0D5C8] px-3 py-3 font-noto text-base text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tip */}
                    <div className="flex items-start gap-3 border-l-2 border-[#C9A84C] pl-4">
                      <p className="font-noto text-sm text-[#6B5E52] leading-relaxed">
                        <strong className="text-[#1A1A1A] font-[400]">填写信息越准确，导览越贴近您的需求</strong>——我们会根据团队情况调整讲解的深度、节奏与侧重点，让每位访客都有最好的体验。
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-2">
                        特殊需求 <span className="text-[#C8BDB5]">选填</span>
                      </label>
                      <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
                        placeholder="无障碍需求、语言偏好、希望重点介绍的内容..."
                        rows={3}
                        className="w-full bg-white border border-[#E0D5C8] px-4 py-4 font-noto text-base text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none" />
                    </div>
                  </div>
                )}

                {/* ──── Step 3: Confirm & Pay ──── */}
                {step === 3 && (
                  <div className="space-y-6">

                    {/* Summary */}
                    <div className="border border-[#E0D5C8]">
                      <div className="bg-[#F8F5F0] px-5 py-3 border-b border-[#E0D5C8]">
                        <p className="font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase">预约信息确认</p>
                      </div>
                      <div className="divide-y divide-[#F0EBE3]">
                        {[
                          { label: "姓名",   value: form.name },
                          { label: "邮箱",   value: form.email },
                          { label: "日期",   value: form.tourDate ? new Date(form.tourDate + "T12:00:00").toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" }) : "—" },
                          { label: "场次",   value: form.timeSlot ? (form.timeSlot === "10:00" ? "上午 10:00" : "下午 2:00") : "—" },
                          { label: "人数",   value: `${form.groupSize} 人` },
                          ...(form.hasElderly ? [{ label: "老年人", value: `${form.elderlyCount} 位` }] : []),
                          ...(form.hasChildren ? [{ label: "儿童", value: `${form.childrenCount} 位${form.childrenAges.some(a => a) ? `（${form.childrenAges.join("、")} 岁）` : ""}` }] : []),
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between px-5 py-3.5">
                            <span className="font-sans-ui text-[12px] tracking-wide text-[#8B7D72]">{row.label}</span>
                            <span className="font-noto text-sm text-[#1A1A1A] text-right max-w-[60%]">{row.value}</span>
                          </div>
                        ))}
                        {form.notes && (
                          <div className="px-5 py-3.5">
                            <span className="font-sans-ui text-[12px] tracking-wide text-[#8B7D72]">备注</span>
                            <p className="font-noto text-sm text-[#6B5E52] mt-1 leading-relaxed">{form.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment option — Met ticket-style */}
                    <div>
                      <p className="font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-3">选择票价</p>
                      <div className="space-y-3">
                        {[
                          { id: "full",    price: "$75", sub: "今日全额支付 · 完整体验", tag: "推荐" },
                          { id: "deposit", price: "$20", sub: "先付定金，导览当天补 $55 尾款", tag: "" },
                        ].map((opt) => (
                          <button key={opt.id} type="button" onClick={() => set("paymentType", opt.id)}
                            className={`w-full flex items-center justify-between p-5 border text-left transition-all ${
                              form.paymentType === opt.id
                                ? "border-[#A6192E] bg-white ring-1 ring-[#A6192E]/20"
                                : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"
                            }`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                form.paymentType === opt.id ? "border-[#A6192E]" : "border-[#E0D5C8]"
                              }`}>
                                {form.paymentType === opt.id && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#A6192E]" />
                                )}
                              </div>
                              <div>
                                <p className="font-noto text-[#1A1A1A] font-[400]">{opt.sub}</p>
                                {opt.tag && (
                                  <span className="inline-block font-sans-ui text-[9px] tracking-widest uppercase text-[#C9A84C] border border-[#C9A84C]/40 px-2 py-0.5 mt-1">
                                    {opt.tag}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="font-noto text-2xl text-[#A6192E] font-[300] flex-shrink-0">{opt.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 p-4 text-sm font-noto text-red-700">
                        {error}
                      </div>
                    )}

                    {/* Submit — desktop only; mobile uses sticky footer */}
                    <div className="hidden md:block">
                      <button type="submit" disabled={loading}
                        className={`w-full py-5 font-sans-ui text-sm tracking-widest uppercase transition-all ${
                          !loading
                            ? "bg-[#A6192E] text-white hover:bg-[#8B1525]"
                            : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
                        }`}>
                        {loading ? "正在跳转..." : `前往支付 ${form.paymentType === "full" ? "$75" : "$20"} →`}
                      </button>
                      <p className="font-sans-ui text-[10px] text-center text-[#8B7D72] tracking-wider mt-3">
                        由 Stripe 加密保护 · 我们不储存您的支付信息
                      </p>
                    </div>
                  </div>
                )}

                {/* Desktop nav buttons (steps 1–2) */}
                {step < 3 && (
                  <div className="hidden md:flex items-center justify-between mt-10 pt-8 border-t border-[#E0D5C8]">
                    {step > 1 ? (
                      <button type="button" onClick={() => setStep((s) => s - 1)}
                        className="font-sans-ui text-sm text-[#8B7D72] hover:text-[#1A1A1A] transition-colors tracking-wide flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                        </svg>
                        上一步
                      </button>
                    ) : <div />}
                    <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
                      className={`px-10 py-4 font-sans-ui text-sm tracking-widest uppercase transition-all ${
                        canNext()
                          ? "bg-[#A6192E] text-white hover:bg-[#8B1525]"
                          : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
                      }`}>
                      下一步 →
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* ── Right: Event info card (desktop only) ── */}
          <div className="hidden md:block sticky top-[130px]">
            <div className="border border-[#E0D5C8] overflow-hidden">
              {/* Dark header panel */}
              <div className="bg-[#1A1A1A] p-8 relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
                <p className="font-sans-ui text-[9px] tracking-[0.25em] uppercase text-[#C9A84C]/70 mb-3">欧洲艺术史私人导览</p>
                <h2 className="font-noto text-white text-xl font-[200] leading-tight mb-1">大都会艺术博物馆</h2>
                <p className="font-noto text-white/40 text-sm">纽约 · 预约制 · 全程中文</p>
              </div>

              <div className="bg-white p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <div>
                    <p className="font-sans-ui text-[10px] tracking-wider text-[#8B7D72] uppercase mb-0.5">场次</p>
                    <p className="font-noto text-sm text-[#1A1A1A]">每周六、日</p>
                    <p className="font-sans-ui text-[11px] text-[#8B7D72] mt-0.5">上午 10:00 · 下午 2:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <p className="font-sans-ui text-[10px] tracking-wider text-[#8B7D72] uppercase mb-0.5">时长</p>
                    <p className="font-noto text-sm text-[#1A1A1A]">3.5 小时</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <p className="font-sans-ui text-[10px] tracking-wider text-[#8B7D72] uppercase mb-0.5">地点</p>
                    <p className="font-noto text-sm text-[#1A1A1A]">大都会艺术博物馆</p>
                    <p className="font-sans-ui text-[11px] text-[#8B7D72] mt-0.5">1000 Fifth Ave, New York, NY</p>
                  </div>
                </div>

                <div className="border-t border-[#E0D5C8] pt-4 space-y-2">
                  {["含拉斐尔特展", "全程中文", "参观前个性化问卷", "每组最多 6 人"].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-3.5 h-px bg-[#A6192E]" />
                      <span className="font-noto text-xs text-[#6B5E52]">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E0D5C8]">
                  <p className="font-noto text-sm text-[#8B7D72]">价格从</p>
                  <p className="font-noto text-3xl text-[#A6192E] font-[200]">$75<span className="text-base text-[#8B7D72]"> / 人</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky footer ─────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E0D5C8] p-4 safe-area-bottom">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => s - 1)}
              className="flex-shrink-0 w-12 h-12 border border-[#E0D5C8] flex items-center justify-center text-[#8B7D72] hover:border-[#1A1A1A] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
          )}

          {step < 3 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
              className={`flex-1 h-12 font-sans-ui text-sm tracking-widest uppercase transition-all ${
                canNext()
                  ? "bg-[#A6192E] text-white active:bg-[#8B1525]"
                  : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
              }`}>
              下一步 →
            </button>
          ) : (
            <button
              onClick={handleSubmit as React.MouseEventHandler<HTMLButtonElement>}
              disabled={loading}
              className={`flex-1 h-12 font-sans-ui text-sm tracking-widest uppercase transition-all ${
                !loading
                  ? "bg-[#A6192E] text-white active:bg-[#8B1525]"
                  : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"
              }`}>
              {loading ? "正在跳转..." : `前往支付 ${form.paymentType === "full" ? "$75" : "$20"} →`}
            </button>
          )}
        </div>
        {step === 3 && (
          <p className="font-sans-ui text-[9px] text-center text-[#8B7D72] tracking-wider mt-2">
            由 Stripe 加密保护
          </p>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#A6192E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-sans-ui text-[11px] tracking-widest text-[#8B7D72] uppercase">加载中</p>
        </div>
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
