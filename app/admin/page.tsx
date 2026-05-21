import Link from "next/link";
import { getBookings, getPostSurveys, getPreSurveys, getAnalytics, getReviews } from "@/lib/db";

export const dynamic = "force-dynamic";

const KNOWLEDGE: Record<string, string> = {
  beginner: "初次接触", some: "略知一二", familiar: "有所了解", professional: "专业背景",
};

export default async function AdminOverview() {
  const [bookings, pre, post, analytics, reviews] = await Promise.all([
    getBookings(), getPreSurveys(), getPostSurveys(), getAnalytics(), getReviews(),
  ]);

  const confirmed      = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const revenue        = confirmed.reduce((s, b) => s + b.amount, 0);
  const upcoming       = bookings
    .filter((b) => b.tourDate && b.status === "confirmed")
    .sort((a, b) => new Date(a.tourDate!).getTime() - new Date(b.tourDate!).getTime());
  const upcomingPeople = upcoming.reduce((s, b) => s + (b.groupSize ?? 1), 0);
  const nextTour       = upcoming[0];

  const stats = [
    { label: "总预约",  value: bookings.length,     sub: `${confirmed.length} 已确认` },
    { label: "即将到来", value: upcoming.length,     sub: `共 ${upcomingPeople} 人` },
    { label: "总收入",  value: `$${revenue}`,        sub: "已确认订单" },
    { label: "平均评分", value: analytics.responseCount > 0 ? `${analytics.avgRatings.overall.toFixed(1)}` : "—", sub: `共 ${post.length} 份` },
    { label: "NPS",     value: analytics.responseCount > 0 ? analytics.nps : "—", sub: analytics.nps >= 50 ? "优秀" : analytics.nps >= 0 ? "良好" : "暂无数据" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
        {stats.map((s, i) => (
          <div key={s.label} className={`bg-white px-4 py-4 md:px-5 md:py-5 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
            <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999] mb-2">{s.label}</p>
            <p className="font-noto text-3xl md:text-4xl font-[200] text-[#1A1A1A] leading-none">{s.value}</p>
            <p className="font-sans-ui text-[10px] text-[#767676] mt-1.5 tracking-wide">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Next tour spotlight ── */}
      {nextTour && (() => {
        const preSurvey  = pre.find((s) => s.bookingId === nextTour.id);
        const tourDate   = new Date(nextTour.tourDate!);
        const daysUntil  = Math.ceil((tourDate.getTime() - Date.now()) / 86400000);
        const daysLabel  = daysUntil <= 0 ? "今天" : daysUntil === 1 ? "明天" : `${daysUntil} 天后`;
        const interests  = preSurvey?.interests ?? [];
        return (
          <div className="bg-[#1A1A1A] text-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-white/50">下次导览</p>
              <span className="font-sans-ui text-[10px] tracking-wider text-[#E51B23]">{daysLabel}</span>
            </div>
            <div className="px-4 py-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="font-sans-ui text-[9px] tracking-wider text-white/40 uppercase mb-1">访客</p>
                <p className="font-noto text-lg text-white leading-tight">{nextTour.name}</p>
                <p className="font-noto text-xs text-white/50 mt-0.5">{nextTour.email}</p>
              </div>
              <div>
                <p className="font-sans-ui text-[9px] tracking-wider text-white/40 uppercase mb-1">日期 & 时间</p>
                <p className="font-noto text-white">
                  {tourDate.toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })}
                </p>
                {nextTour.timeSlot && <p className="font-noto text-sm text-white/60">{nextTour.timeSlot}</p>}
              </div>
              <div>
                <p className="font-sans-ui text-[9px] tracking-wider text-white/40 uppercase mb-1">人数 & 金额</p>
                <p className="font-noto text-white">{nextTour.groupSize ?? 1} 人</p>
                <p className="font-noto text-sm text-white/60">${nextTour.amount}</p>
              </div>
              <div>
                <p className="font-sans-ui text-[9px] tracking-wider text-white/40 uppercase mb-1">预约码</p>
                <p className="font-sans-ui text-sm tracking-widest text-[#E51B23]">{nextTour.bookingCode ?? "—"}</p>
                {nextTour.checkedIn
                  ? <p className="font-noto text-xs text-green-400 mt-1">✓ 已核销</p>
                  : <Link href="/admin/checkin" className="font-noto text-xs text-white/40 hover:text-white mt-1 inline-block">核销 →</Link>
                }
              </div>
            </div>
            {/* Pre-survey briefing strip */}
            {preSurvey && (
              <div className="border-t border-white/10 px-4 py-3">
                <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-white/40 mb-2">导览简报</p>
                <div className="flex flex-wrap gap-2 items-center">
                  {preSurvey.firstVisit === "yes" && (
                    <span className="font-sans-ui text-[10px] border border-white/20 text-white/60 px-2 py-0.5">首次</span>
                  )}
                  {preSurvey.knowledgeLevel && (
                    <span className="font-sans-ui text-[10px] border border-white/20 text-white/60 px-2 py-0.5">{KNOWLEDGE[preSurvey.knowledgeLevel] ?? preSurvey.knowledgeLevel}</span>
                  )}
                  {interests.map((i) => (
                    <span key={i} className="font-sans-ui text-[10px] border border-[#E51B23]/40 text-[#E51B23]/80 px-2 py-0.5">{i}</span>
                  ))}
                  {preSurvey.openQuestion && (
                    <span className="font-noto text-xs text-white/50 italic ml-1">「{preSurvey.openQuestion.slice(0, 40)}{preSurvey.openQuestion.length > 40 ? "…" : ""}」</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Quick nav cards ── */}
      <div className="grid grid-cols-2 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
        {[
          { href: "/admin/checkin",   label: "到场核销",  count: upcoming.length,          desc: "验票 · 导览简报" },
          { href: "/admin/bookings",  label: "预约记录",  count: bookings.length,          desc: `${confirmed.length} 已确认` },
          { href: "/admin/surveys",   label: "问卷数据",  count: pre.length + post.length, desc: `前 ${pre.length} · 后 ${post.length}` },
          { href: "/admin/analytics", label: "数据分析",  count: post.length,              desc: "评分 · NPS · 趋势" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-white px-4 py-4 hover:bg-[#F5F5F5] active:bg-[#F0F0F0] transition-colors group">
            <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999] mb-2">{item.label}</p>
            <p className="font-noto text-3xl font-[200] text-[#1A1A1A] leading-none mb-1">{item.count}</p>
            <p className="font-sans-ui text-[10px] text-[#767676] tracking-wide">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* ── Upcoming tours list ── */}
      {upcoming.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999]">即将到来的导览</p>
            <Link href="/admin/bookings" className="font-sans-ui text-[10px] text-[#E51B23] tracking-wider">全部 →</Link>
          </div>
          <div className="bg-white border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
            {upcoming.slice(1, 4).map((b) => {
              const d = new Date(b.tourDate!);
              return (
                <div key={b.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-noto text-sm text-[#1A1A1A]">{b.name}</p>
                    <p className="font-sans-ui text-[10px] text-[#999999] tracking-wide mt-0.5">
                      {d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })} · {b.groupSize ?? 1} 人
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans-ui text-[11px] tracking-widest text-[#999999]">{b.bookingCode}</p>
                    {b.checkedIn && <p className="font-sans-ui text-[9px] text-green-600 mt-0.5">✓ 已核销</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent reviews ── */}
      {reviews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999]">近期评价</p>
            <Link href="/admin/reviews" className="font-sans-ui text-[10px] text-[#E51B23] tracking-wider">全部 →</Link>
          </div>
          <div className="space-y-px">
            {[...reviews]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map((r) => (
                <div key={r.id} className="bg-white border border-[#E5E5E5] px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-noto text-sm text-[#1A1A1A]">{r.name}</p>
                    <p className="text-[#E51B23] text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  </div>
                  <p className="font-noto text-xs text-[#666666] leading-relaxed line-clamp-2">「{r.review}」</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
