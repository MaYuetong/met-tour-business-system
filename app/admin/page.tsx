import Link from "next/link";
import { getBookings, getPostSurveys, getPreSurveys, getAnalytics, getReviews } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [bookings, pre, post, analytics, reviews] = await Promise.all([
    getBookings(), getPreSurveys(), getPostSurveys(), getAnalytics(), getReviews(),
  ]);

  const confirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const revenue   = confirmed.reduce((s, b) => s + b.amount, 0);
  const upcoming  = bookings.filter((b) => b.tourDate && b.status === "confirmed");

  return (
    <div>
      {/* 数据概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "总预约数", value: bookings.length,  note: `${confirmed.length} 已确认`, color: "text-[#E51B23]" },
          { label: "总收入",   value: `$${revenue}`,    note: "来自已确认预约",              color: "text-[#999999]" },
          { label: "平均评分", value: analytics.responseCount > 0 ? analytics.avgRatings.overall.toFixed(1) + " / 5" : "—", note: `${post.length} 份反馈`, color: "text-[#E51B23]" },
          { label: "NPS 分数", value: analytics.responseCount > 0 ? analytics.nps : "—", note: analytics.nps >= 50 ? "优秀" : analytics.nps >= 0 ? "良好" : "—", color: analytics.nps >= 50 ? "text-green-700" : "text-[#999999]" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E5E5E5] rounded-sm p-6">
            <p className="text-xs text-[#767676] font-noto mb-2">{s.label}</p>
            <p className={`font-noto text-3xl font-light ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#767676] font-noto mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {/* 快速入口 */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { href: "/admin/bookings",  label: "预约记录", count: bookings.length,  desc: "查看所有预约" },
          { href: "/admin/surveys",   label: "问卷数据", count: pre.length + post.length, desc: `前置 ${pre.length} · 后置 ${post.length}` },
          { href: "/admin/reviews",   label: "访客评价", count: reviews.length,   desc: "星级评分 · 文字评语" },
          { href: "/admin/analytics", label: "数据分析", count: post.length,      desc: "评分、NPS、趋势" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-white border border-[#E5E5E5] rounded-sm p-6 hover:border-[#E51B23] transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-noto text-[#1A1A1A]">{item.label}</h3>
              <span className="font-noto text-[#E51B23] text-xl font-light">{item.count}</span>
            </div>
            <p className="text-sm font-noto text-[#767676]">{item.desc}</p>
            <p className="text-xs text-[#E51B23] font-noto mt-3 group-hover:underline">查看 →</p>
          </Link>
        ))}
      </div>

      {/* 即将到来的导览 */}
      <div className="mb-10">
        <h2 className="font-noto text-xl text-[#1A1A1A] mb-5">即将到来的导览</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-sm p-8 text-center">
            <p className="text-[#767676] font-noto">暂无已安排的导览。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((b) => {
              const preSurvey = pre.find((s) => s.bookingId === b.id);
              return (
                <div key={b.id} className="bg-white border border-[#E5E5E5] rounded-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="font-noto text-[#1A1A1A]">{b.name}</p>
                    <p className="text-sm font-noto text-[#767676]">{b.email}</p>
                    {preSurvey && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs bg-[#E51B23]/10 text-[#E51B23] px-2 py-0.5 rounded-sm font-noto">
                          {b.profileTag ?? preSurvey.profileTag}
                        </span>
                        {(preSurvey.interests ?? []).slice(0, 2).map((i) => (
                          <span key={i} className="text-xs bg-[#F5F5F5] border border-[#E5E5E5] text-[#767676] px-2 py-0.5 rounded-sm font-noto">{i}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-noto text-[#999999]">{new Date(b.tourDate!).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</p>
                    <p className="text-xs text-[#767676] font-noto mt-0.5">${b.amount}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 近期访客评价 */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-noto text-xl text-[#1A1A1A]">近期访客评价</h2>
          <Link href="/admin/reviews" className="text-xs text-[#E51B23] font-noto hover:underline">查看全部 →</Link>
        </div>
        {reviews.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-8 text-center">
            <p className="font-noto text-[#767676]">暂无评价。导览结束后将 <Link href="/review" className="text-[#E51B23] hover:underline">/review</Link> 链接发给访客。</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {[...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4).map((r) => (
              <div key={r.id} className="bg-white border border-[#E5E5E5] p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-noto text-[#1A1A1A] font-medium">{r.name}</p>
                  <p className="font-noto text-[#E51B23] text-lg font-light">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                </div>
                <p className="font-noto text-[#666666] text-sm leading-relaxed border-l-2 border-[#E51B23] pl-3">「{r.review}」</p>
                <p className="text-xs text-[#767676] font-noto mt-3">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
