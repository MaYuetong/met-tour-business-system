import Link from "next/link";
import { getBookings, getPostSurveys, getPreSurveys, getAnalytics, getReviews } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [bookings, pre, post, analytics, reviews] = await Promise.all([
    getBookings(), getPreSurveys(), getPostSurveys(), getAnalytics(), getReviews(),
  ]);

  const confirmed       = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const revenue         = confirmed.reduce((s, b) => s + b.amount, 0);
  const upcoming        = bookings.filter((b) => b.tourDate && b.status === "confirmed");
  const upcomingPeople  = upcoming.reduce((s, b) => s + (b.groupSize ?? 1), 0);

  return (
    <div>
      {/* 数据概览 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: "总预约数",   value: bookings.length,  note: `${confirmed.length} 已确认`, color: "text-[#E51B23]" },
          { label: "即将到来",   value: upcoming.length,  note: `共 ${upcomingPeople} 人`,    color: "text-green-700" },
          { label: "总收入",     value: `$${revenue}`,    note: "来自已确认预约",              color: "text-[#999999]" },
          { label: "平均评分",   value: analytics.responseCount > 0 ? analytics.avgRatings.overall.toFixed(1) + " / 5" : "—", note: `${post.length} 份反馈`, color: "text-[#E51B23]" },
          { label: "NPS 分数",   value: analytics.responseCount > 0 ? analytics.nps : "—", note: analytics.nps >= 50 ? "优秀" : analytics.nps >= 0 ? "良好" : "—", color: analytics.nps >= 50 ? "text-green-700" : "text-[#999999]" },
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

      {/* 导览简报 */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-noto text-xl text-[#1A1A1A]">导览简报</h2>
          <span className="text-xs text-[#767676] font-noto">已确认 · 按日期排序</span>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-sm p-8 text-center">
            <p className="text-[#767676] font-noto">暂无已确认的导览安排。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...upcoming]
              .sort((a, b) => new Date(a.tourDate!).getTime() - new Date(b.tourDate!).getTime())
              .map((b, idx) => {
                const preSurvey = pre.find((s) => s.bookingId === b.id);
                const tourDateObj = new Date(b.tourDate!);
                const isNext = idx === 0;
                const daysUntil = Math.ceil((tourDateObj.getTime() - Date.now()) / 86400000);
                const daysLabel = daysUntil === 0 ? "今天" : daysUntil === 1 ? "明天" : `${daysUntil} 天后`;

                return (
                  <div key={b.id} className={`bg-white border rounded-sm overflow-hidden ${isNext ? "border-[#E51B23]" : "border-[#E5E5E5]"}`}>
                    {/* 顶部日期栏 */}
                    <div className={`flex items-center justify-between px-5 py-3 border-b ${isNext ? "bg-[#E51B23] border-[#E51B23]" : "bg-[#F5F5F5] border-[#E5E5E5]"}`}>
                      <div className="flex items-center gap-3">
                        {isNext && <span className="font-sans-ui text-[10px] tracking-widest uppercase text-white/80">下次导览</span>}
                        <p className={`font-noto text-sm font-medium ${isNext ? "text-white" : "text-[#1A1A1A]"}`}>
                          {tourDateObj.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
                          {b.timeSlot && <span className="ml-2 opacity-80">{b.timeSlot}</span>}
                        </p>
                      </div>
                      <span className={`font-sans-ui text-[10px] tracking-widest ${isNext ? "text-white/70" : "text-[#999999]"}`}>{daysLabel}</span>
                    </div>

                    {/* 内容 */}
                    <div className="p-5 grid md:grid-cols-3 gap-5">
                      {/* 左：访客信息 */}
                      <div>
                        <p className="font-sans-ui text-[9px] tracking-[0.15em] uppercase text-[#999999] mb-2">访客</p>
                        <p className="font-noto text-lg text-[#1A1A1A] font-medium">{b.name}</p>
                        <p className="text-xs font-noto text-[#767676] mt-0.5">{b.email}</p>
                        {b.phone && <p className="text-xs font-noto text-[#767676]">{b.phone}</p>}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="font-sans-ui text-[10px] tracking-widest text-[#999999]">人数</span>
                          <span className="font-noto text-xl text-[#E51B23] font-light">{b.groupSize ?? 1}</span>
                          <span className="font-noto text-xs text-[#767676]">人</span>
                        </div>
                      </div>

                      {/* 中：预期与画像 */}
                      <div>
                        <p className="font-sans-ui text-[9px] tracking-[0.15em] uppercase text-[#999999] mb-2">画像与兴趣</p>
                        {(b.profileTag || preSurvey?.profileTag) && (
                          <span className="inline-block text-xs bg-[#E51B23]/10 text-[#E51B23] px-2 py-0.5 rounded-sm font-noto mb-2">
                            {b.profileTag ?? preSurvey?.profileTag}
                          </span>
                        )}
                        {preSurvey && (preSurvey.interests?.length ?? 0) > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(preSurvey.interests ?? []).map((i) => (
                              <span key={i} className="text-xs bg-[#F5F5F5] border border-[#E5E5E5] text-[#767676] px-2 py-0.5 rounded-sm font-noto">{i}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-noto text-[#BBBBBB]">尚未填写前置问卷</p>
                        )}
                        {preSurvey?.openQuestion && (
                          <p className="text-xs font-noto text-[#666666] mt-2 border-l-2 border-[#E51B23]/30 pl-2 italic">
                            「{preSurvey.openQuestion}」
                          </p>
                        )}
                        {preSurvey && (
                          <div className="mt-2 flex gap-3 text-[10px] font-noto text-[#999999]">
                            {preSurvey.firstVisit === "yes" && <span>首次参观</span>}
                            {preSurvey.knowledgeLevel && <span>程度：{preSurvey.knowledgeLevel}</span>}
                            {preSurvey.country && <span>来自 {preSurvey.country}</span>}
                          </div>
                        )}
                      </div>

                      {/* 右：备注与支付 */}
                      <div>
                        <p className="font-sans-ui text-[9px] tracking-[0.15em] uppercase text-[#999999] mb-2">备注 & 支付</p>
                        {b.notes ? (
                          <p className="text-sm font-noto text-[#444444] leading-relaxed bg-[#FFFBEA] border border-[#FFE58F] rounded-sm px-3 py-2">
                            {b.notes}
                          </p>
                        ) : (
                          <p className="text-xs font-noto text-[#BBBBBB]">无特殊备注</p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="font-noto text-xl text-[#1A1A1A] font-light">${b.amount}</span>
                          <span className="text-xs font-noto text-[#999999]">{b.paymentType === "full" ? "全额" : b.paymentType === "deposit" ? "定金" : b.paymentType}</span>
                        </div>
                        {b.bookingCode && (
                          <p className="text-[10px] font-sans-ui tracking-widest text-[#BBBBBB] mt-1"># {b.bookingCode}</p>
                        )}
                      </div>
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
