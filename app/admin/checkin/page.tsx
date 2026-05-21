"use client";

import { useState } from "react";

const KNOWLEDGE: Record<string, string> = {
  beginner: "初次接触", some: "略知一二", familiar: "有所了解", professional: "专业背景",
};
const PREF: Record<string, string> = {
  storytelling: "故事叙述", structured: "系统知识", academic: "学术深度", photo: "轻松随性",
};
const INTEREST: Record<string, string> = {
  architecture: "欧洲建筑与雕塑", medieval: "中世纪艺术", renaissance: "文艺复兴",
  baroque: "巴洛克/宫廷艺术", neoclassicism: "新古典主义", impressionism: "印象派",
  "europe-new-world": "欧洲与新世界",
};
const SECTION: Record<string, string> = {
  architecture: "背景与历史", medieval: "中世纪艺术", renaissance: "文艺复兴（拉斐尔特展）",
  "17-18th": "十七至十八世纪", impressionism: "印象派", other: "其他",
};

type BookingData = {
  id: string; name: string; email: string; phone?: string;
  tourDate?: string; timeSlot?: string; groupSize?: number;
  amount: number; bookingCode?: string;
  checkedIn?: boolean; checkedInAt?: string; guideNotes?: string;
  status: string;
};
type PreData = {
  knowledgeLevel?: string; interests?: string[]; experiencePreference?: string;
  openQuestion?: string; firstVisit?: string; city?: string; country?: string;
  gender?: string; profileTag?: string;
};
type PostData = {
  ratings?: { overall: number; clarity: number; pacing: number };
  nps?: number; testimonial?: string;
  mostImpressive?: string | string[];
  allowPublic?: boolean | null;
};

type Result = { booking: BookingData; preSurvey: PreData | null; postSurvey: PostData | null };

export default function CheckinPage() {
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState<Result | null>(null);
  const [notes, setNotes]       = useState("");
  const [checking, setChecking] = useState(false);
  const [done, setDone]         = useState(false);

  async function lookup() {
    if (!code.trim()) return;
    setLoading(true); setError(""); setResult(null); setDone(false);
    try {
      const res = await fetch(`/api/admin/checkin?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "查询失败"); return; }
      setResult(data);
      setNotes(data.booking.guideNotes ?? "");
      if (data.booking.checkedIn) setDone(true);
    } catch { setError("网络错误，请重试"); }
    finally { setLoading(false); }
  }

  async function checkIn() {
    if (!result) return;
    setChecking(true);
    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode: result.booking.bookingCode, guideNotes: notes }),
      });
      if (res.ok) {
        setResult((r) => r ? { ...r, booking: { ...r.booking, checkedIn: true, checkedInAt: new Date().toISOString() } } : r);
        setDone(true);
      }
    } finally { setChecking(false); }
  }

  const b  = result?.booking;
  const ps = result?.preSurvey;
  const po = result?.postSurvey;
  const interests = (ps?.interests ?? []).map((i) => INTEREST[i] ?? i);
  const sections  = (Array.isArray(po?.mostImpressive) ? po!.mostImpressive : po?.mostImpressive ? [po.mostImpressive] : [])
    .map((s) => SECTION[s] ?? s);

  return (
    <div className="max-w-lg mx-auto">
      {/* Title */}
      <div className="mb-8">
        <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#999999] mb-1">导览核销</p>
        <h1 className="font-noto text-2xl text-[#1A1A1A] font-[300]">到场验票</h1>
        <p className="font-noto text-sm text-[#767676] mt-1">输入预约码，确认客人到场并查看导览简报。</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="输入预约码，如 20260512ABC"
          className="flex-1 bg-white border border-[#E5E5E5] px-4 py-3 font-noto text-[#1A1A1A] text-base placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#E51B23] transition-colors tracking-widest uppercase"
        />
        <button onClick={lookup} disabled={loading}
          className="px-5 py-3 bg-[#E51B23] text-white font-sans-ui text-sm tracking-widest uppercase hover:bg-[#C01018] transition-colors disabled:opacity-50">
          {loading ? "…" : "查询"}
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 mb-6">
          <p className="font-noto text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Result card */}
      {b && (
        <div className="space-y-4">

          {/* Status banner */}
          {done ? (
            <div className="bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div>
                <p className="font-noto text-green-800 font-medium">已到场核销</p>
                {b.checkedInAt && (
                  <p className="text-xs text-green-600 font-noto mt-0.5">
                    {new Date(b.checkedInAt).toLocaleString("zh-CN")}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 px-5 py-3">
              <p className="font-noto text-amber-800 text-sm">尚未核销 · 请确认客人身份后点击下方按钮</p>
            </div>
          )}

          {/* Booking summary */}
          <div className="bg-white border border-[#E5E5E5] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-noto text-[#1A1A1A] text-xl font-[400]">{b.name}</p>
                <p className="font-noto text-sm text-[#767676] mt-0.5">{b.email}</p>
                {b.phone && <p className="font-noto text-sm text-[#767676]">{b.phone}</p>}
              </div>
              <span className="font-sans-ui text-[11px] tracking-widest bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-1.5 text-[#444444]">
                {b.bookingCode}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {[
                { label: "参观日期", val: b.tourDate ?? "—" },
                { label: "时间段",   val: b.timeSlot ?? "—" },
                { label: "人数",     val: b.groupSize ? `${b.groupSize} 人` : "—" },
              ].map((item) => (
                <div key={item.label} className="bg-[#F5F5F5] px-3 py-2">
                  <p className="font-sans-ui text-[10px] tracking-wider text-[#767676] uppercase mb-1">{item.label}</p>
                  <p className="font-noto text-[#1A1A1A]">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-survey briefing */}
          {ps ? (
            <div className="bg-white border border-[#E51B23]/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#E51B23]" />
                <p className="font-sans-ui text-[11px] tracking-widest uppercase text-[#E51B23]">导览简报 · 参观前问卷</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                {[
                  { label: "首次参观", val: ps.firstVisit === "yes" ? "是，第一次" : "来过" },
                  { label: "来自",     val: [ps.city, ps.country].filter(Boolean).join("，") || "—" },
                  { label: "艺术背景", val: KNOWLEDGE[ps.knowledgeLevel ?? ""] ?? "—" },
                  { label: "体验偏好", val: PREF[ps.experiencePreference ?? ""] ?? "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#FDF8F8] px-3 py-2">
                    <p className="font-sans-ui text-[10px] tracking-wider text-[#999999] uppercase mb-1">{item.label}</p>
                    <p className="font-noto text-[#1A1A1A]">{item.val}</p>
                  </div>
                ))}
              </div>

              {interests.length > 0 && (
                <div className="mb-3">
                  <p className="font-sans-ui text-[10px] tracking-wider text-[#999999] uppercase mb-2">感兴趣方向</p>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((i) => (
                      <span key={i} className="text-xs border border-[#E51B23]/30 text-[#E51B23] px-2.5 py-1 font-noto">{i}</span>
                    ))}
                  </div>
                </div>
              )}

              {ps.openQuestion && (
                <div className="mt-3 border-l-2 border-[#E51B23] pl-3">
                  <p className="font-sans-ui text-[10px] tracking-wider text-[#999999] uppercase mb-1">特别期望</p>
                  <p className="font-noto text-sm text-[#444444] leading-relaxed">「{ps.openQuestion}」</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#F5F5F5] border border-[#E5E5E5] px-5 py-4">
              <p className="font-noto text-sm text-[#767676]">该客人尚未填写参观前问卷</p>
            </div>
          )}

          {/* Post-survey (if already done) */}
          {po && (
            <div className="bg-white border border-green-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <p className="font-sans-ui text-[11px] tracking-widest uppercase text-green-700">已填写参观后问卷</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="font-sans-ui text-[10px] text-[#999999] uppercase tracking-wider mb-0.5">整体评分</p>
                  <p className="font-noto text-[#E51B23] text-xl">{po.ratings?.overall ?? "—"}/5</p>
                </div>
                <div>
                  <p className="font-sans-ui text-[10px] text-[#999999] uppercase tracking-wider mb-0.5">NPS</p>
                  <p className="font-noto text-xl text-[#1A1A1A]">{po.nps ?? "—"}</p>
                </div>
                {sections.length > 0 && (
                  <div>
                    <p className="font-sans-ui text-[10px] text-[#999999] uppercase tracking-wider mb-0.5">最深刻</p>
                    <p className="font-noto text-sm text-[#444444]">{sections.join("、")}</p>
                  </div>
                )}
              </div>
              {po.testimonial && (
                <p className="mt-3 font-noto text-sm text-[#444444] border-l-2 border-green-400 pl-3 leading-relaxed">
                  「{po.testimonial}」
                </p>
              )}
            </div>
          )}

          {/* Guide notes */}
          <div className="bg-white border border-[#E5E5E5] p-5">
            <label className="block font-sans-ui text-[10px] tracking-widest uppercase text-[#999999] mb-2">
              导览备注（选填，仅自己可见）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录特殊需求、观察或跟进事项…"
              rows={3}
              className="w-full bg-[#F5F5F5] border border-[#E5E5E5] px-4 py-3 font-noto text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#E51B23] transition-colors resize-none"
            />
          </div>

          {/* Check-in button */}
          {!done && (
            <button onClick={checkIn} disabled={checking}
              className="w-full py-5 bg-[#E51B23] text-white font-sans-ui text-sm tracking-widest uppercase hover:bg-[#C01018] transition-colors disabled:opacity-60">
              {checking ? "处理中…" : "✓ 确认到场核销"}
            </button>
          )}

          {done && notes !== (b.guideNotes ?? "") && (
            <button onClick={checkIn} disabled={checking}
              className="w-full py-3 border border-[#E5E5E5] bg-white text-[#444444] font-sans-ui text-sm tracking-widest uppercase hover:border-[#E51B23] hover:text-[#E51B23] transition-colors">
              保存备注
            </button>
          )}
        </div>
      )}
    </div>
  );
}
