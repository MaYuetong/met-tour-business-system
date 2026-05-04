import Link from "next/link";
import { getBookings, getPostSurveys, getPreSurveys, getAnalytics } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [bookings, pre, post, analytics] = await Promise.all([
    getBookings(), getPreSurveys(), getPostSurveys(), getAnalytics(),
  ]);

  const confirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const revenue   = confirmed.reduce((s, b) => s + b.amount, 0);
  const upcoming  = bookings.filter((b) => b.tourDate && b.status === "confirmed");

  return (
    <div>
      {/* 数据概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "总预约数", value: bookings.length,  note: `${confirmed.length} 已确认`, color: "text-[#A6192E]" },
          { label: "总收入",   value: `$${revenue}`,    note: "来自已确认预约",              color: "text-[#C9A84C]" },
          { label: "平均评分", value: analytics.responseCount > 0 ? analytics.avgRatings.overall.toFixed(1) + " / 5" : "—", note: `${post.length} 份反馈`, color: "text-[#A6192E]" },
          { label: "NPS 分数", value: analytics.responseCount > 0 ? analytics.nps : "—", note: analytics.nps >= 50 ? "优秀" : analytics.nps >= 0 ? "良好" : "—", color: analytics.nps >= 50 ? "text-green-700" : "text-[#C9A84C]" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E0D5C8] rounded-sm p-6">
            <p className="text-xs text-[#8B7D72] font-noto mb-2">{s.label}</p>
            <p className={`font-noto text-3xl font-light ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#8B7D72] font-noto mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {/* 快速入口 */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { href: "/admin/bookings",  label: "预约记录", count: bookings.length,  desc: "查看所有预约" },
          { href: "/admin/crm",       label: "访客管理", count: confirmed.length, desc: "CRM · 兴趣标签" },
          { href: "/admin/analytics", label: "数据分析", count: post.length,      desc: "评分、NPS、趋势" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-white border border-[#E0D5C8] rounded-sm p-6 hover:border-[#A6192E] transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-noto text-[#1A1A1A]">{item.label}</h3>
              <span className="font-noto text-[#A6192E] text-xl font-light">{item.count}</span>
            </div>
            <p className="text-sm font-noto text-[#8B7D72]">{item.desc}</p>
            <p className="text-xs text-[#A6192E] font-noto mt-3 group-hover:underline">查看 →</p>
          </Link>
        ))}
      </div>

      {/* 即将到来的导览 */}
      <div className="mb-10">
        <h2 className="font-noto text-xl text-[#1A1A1A] mb-5">即将到来的导览</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white border border-[#E0D5C8] rounded-sm p-8 text-center">
            <p className="text-[#8B7D72] font-noto">暂无已安排的导览。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((b) => {
              const preSurvey = pre.find((s) => s.bookingId === b.id);
              return (
                <div key={b.id} className="bg-white border border-[#E0D5C8] rounded-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="font-noto text-[#1A1A1A]">{b.name}</p>
                    <p className="text-sm font-noto text-[#8B7D72]">{b.email}</p>
                    {preSurvey && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs bg-[#A6192E]/10 text-[#A6192E] px-2 py-0.5 rounded-sm font-noto">
                          {b.profileTag ?? preSurvey.profileTag}
                        </span>
                        {(preSurvey.interests ?? []).slice(0, 2).map((i) => (
                          <span key={i} className="text-xs bg-[#F8F5F0] border border-[#E0D5C8] text-[#8B7D72] px-2 py-0.5 rounded-sm font-noto">{i}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-noto text-[#C9A84C]">{new Date(b.tourDate!).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</p>
                    <p className="text-xs text-[#8B7D72] font-noto mt-0.5">${b.amount}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 近期评语 */}
      {analytics.testimonials && analytics.testimonials.length > 0 && (
        <div>
          <h2 className="font-noto text-xl text-[#1A1A1A] mb-5">近期评语</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.testimonials.slice(0, 4).map((t: { text: string; date: string }, i: number) => (
              <div key={i} className="bg-white border border-[#E0D5C8] rounded-sm p-5">
                <p className="text-[#C9A84C] font-noto text-2xl mb-2">"</p>
                <p className="font-noto text-[#6B5E52] leading-relaxed text-sm mb-3">{t.text}</p>
                <p className="text-xs text-[#8B7D72] font-noto">{new Date(t.date).toLocaleDateString("zh-CN")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
