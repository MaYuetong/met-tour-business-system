import { getReviews } from "@/lib/db";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const STARS = (n: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? "#E51B23" : "#E5E5E5" }}>★</span>
  ));

const SECTION_LABELS: Record<string, string> = {
  architecture:  "建筑与雕塑",
  medieval:      "中世纪艺术",
  renaissance:   "文艺复兴 / 拉斐尔特展",
  "17-18th":     "十七至十八世纪",
  impressionism: "印象派",
  overall:       "整场导览",
};

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  const sorted  = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const avgRating    = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const quotable     = reviews.filter((r) => r.allowQuote === "yes");
  const recommenders = reviews.filter((r) => r.wouldRecommend === "yes");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-noto text-2xl text-[#1A1A1A]">访客评语</h1>
        <div className="flex items-center gap-3">
          <a href="/review" target="_blank" className="text-xs font-noto text-[#E51B23] hover:underline">
            查看评语表单 ↗
          </a>
          <a href="/api/admin/export?type=reviews" download
            className="font-sans-ui text-[11px] tracking-widest uppercase border border-[#E5E5E5] bg-white px-4 py-2 text-[#767676] hover:border-[#E51B23] hover:text-[#E51B23] transition-colors">
            下载 CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "总评语数",   value: reviews.length },
          { label: "平均评分",   value: avgRating + (reviews.length ? " / 5" : "") },
          { label: "推荐导览",   value: recommenders.length },
          { label: "可公开引用", value: quotable.length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E5E5E5] rounded-sm p-5">
            <p className="text-xs text-[#767676] font-noto mb-2">{s.label}</p>
            <p className="font-noto text-3xl text-[#E51B23] font-light">{s.value}</p>
          </div>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-sm p-16 text-center">
          <p className="font-noto text-[#767676] text-xl mb-3">暂无评语</p>
          <p className="font-noto text-[#767676] text-sm mb-6">导览结束后将链接分享给访客。</p>
          <a href="/review" target="_blank"
            className="inline-block bg-[#E51B23] text-white px-8 py-3 font-noto text-xs hover:bg-[#C01018] transition-colors rounded-sm">
            打开评语表单 ↗
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => (
            <div key={r.id} className="bg-white border border-[#E5E5E5] rounded-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-lg leading-none">{STARS(r.rating)}</div>
                    <h3 className="font-noto text-[#1A1A1A]">{r.name}</h3>
                    {r.wouldRecommend === "yes" && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-sm font-noto">推荐</span>
                    )}
                    {r.allowQuote === "yes" && (
                      <span className="text-xs bg-[#999999]/20 text-[#8B5E00] border border-[#999999]/30 px-2 py-0.5 rounded-sm font-noto">可引用</span>
                    )}
                  </div>
                  <p className="text-xs text-[#767676] font-noto mb-4">
                    {SECTION_LABELS[r.section] ?? r.section}
                    {r.email && ` · ${r.email}`}
                    {r.tourDate && ` · 导览日期：${r.tourDate}`}
                  </p>
                  <p className="font-noto text-[#1A1A1A] leading-relaxed text-base border-l-2 border-[#E51B23] pl-4">
                    「{r.review}」
                  </p>
                </div>
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                  <p className="font-noto text-3xl text-[#E51B23] font-light">{r.rating}/5</p>
                  <p className="text-xs text-[#767676] font-noto mt-1">
                    {new Date(r.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <DeleteButton id={r.id} type="review" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
