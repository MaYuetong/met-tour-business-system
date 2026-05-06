import { getPreSurveys, getPostSurveys } from "@/lib/db";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const KNOWLEDGE: Record<string, string> = {
  none:     "零基础",
  casual:   "略有了解",
  moderate: "有一定基础",
  deep:     "深度爱好者",
};
const EXPERIENCE: Record<string, string> = {
  story:    "故事与背景",
  visual:   "视觉与技法",
  history:  "历史脉络",
  personal: "个人共鸣",
};
const PRICE: Record<string, string> = {
  "80-100":  "$80–$100",
  "100-120": "$100–$120",
  "120-150": "$120–$150",
  "150+":    "$150 以上",
};

export default async function SurveysPage() {
  const [pre, post] = await Promise.all([getPreSurveys(), getPostSurveys()]);
  const preSorted  = [...pre].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const postSorted = [...post].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-12">

      {/* ── 参观前问卷 ── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-noto text-2xl text-[#1A1A1A]">参观前问卷 <span className="text-[#E51B23] font-light">({pre.length})</span></h1>
          <a href="/api/admin/export?type=pre-surveys" download
            className="font-sans-ui text-[11px] tracking-widest uppercase border border-[#E5E5E5] bg-white px-4 py-2 text-[#767676] hover:border-[#E51B23] hover:text-[#E51B23] transition-colors">
            下载 CSV
          </a>
        </div>

        {preSorted.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-10 text-center">
            <p className="font-noto text-[#767676]">暂无参观前问卷数据</p>
          </div>
        ) : (
          <div className="space-y-3">
            {preSorted.map((r) => (
              <div key={r.id} className="bg-white border border-[#E5E5E5] p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-noto text-[#1A1A1A] font-medium">{r.name ?? "匿名访客"}</p>
                    <p className="text-xs text-[#767676] font-noto mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" })}
                      {r.bookingId && ` · 预约 #${r.bookingId.slice(0, 6)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-[#E51B23]/10 text-[#E51B23] border border-[#E51B23]/20 px-2.5 py-1 font-noto">
                      {r.profileTag}
                    </span>
                    <DeleteButton id={r.id} type="pre-survey" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-[#F5F5F5] px-3 py-2">
                    <p className="font-sans-ui text-[10px] tracking-wider text-[#767676] uppercase mb-1">首次参观</p>
                    <p className="font-noto text-[#1A1A1A]">{r.firstVisit === "yes" ? "是" : "否"}</p>
                  </div>
                  <div className="bg-[#F5F5F5] px-3 py-2">
                    <p className="font-sans-ui text-[10px] tracking-wider text-[#767676] uppercase mb-1">知识背景</p>
                    <p className="font-noto text-[#1A1A1A]">{KNOWLEDGE[r.knowledgeLevel] ?? r.knowledgeLevel}</p>
                  </div>
                  <div className="bg-[#F5F5F5] px-3 py-2">
                    <p className="font-sans-ui text-[10px] tracking-wider text-[#767676] uppercase mb-1">偏好体验</p>
                    <p className="font-noto text-[#1A1A1A]">{EXPERIENCE[r.experiencePreference] ?? r.experiencePreference}</p>
                  </div>
                </div>
                {r.interests?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.interests.map((i) => (
                      <span key={i} className="text-xs bg-white border border-[#E5E5E5] text-[#666666] px-2 py-0.5 font-noto">{i}</span>
                    ))}
                  </div>
                )}
                {r.openQuestion && (
                  <p className="mt-3 font-noto text-sm text-[#666666] border-l-2 border-[#999999] pl-3 leading-relaxed">
                    「{r.openQuestion}」
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 参观后问卷 ── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-noto text-2xl text-[#1A1A1A]">参观后问卷 <span className="text-[#E51B23] font-light">({post.length})</span></h1>
          <a href="/api/admin/export?type=post-surveys" download
            className="font-sans-ui text-[11px] tracking-widest uppercase border border-[#E5E5E5] bg-white px-4 py-2 text-[#767676] hover:border-[#E51B23] hover:text-[#E51B23] transition-colors">
            下载 CSV
          </a>
        </div>

        {postSorted.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-10 text-center">
            <p className="font-noto text-[#767676]">暂无参观后问卷数据</p>
          </div>
        ) : (
          <div className="space-y-3">
            {postSorted.map((r) => (
              <div key={r.id} className="bg-white border border-[#E5E5E5] p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <p className="font-noto text-[#E51B23] text-2xl font-light">{r.ratings.overall}/5</p>
                      <span className={`text-xs px-2 py-0.5 font-noto border ${r.nps >= 9 ? "bg-green-50 text-green-700 border-green-200" : r.nps >= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                        NPS {r.nps}
                      </span>
                    </div>
                    <p className="text-xs text-[#767676] font-noto">
                      {new Date(r.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" })}
                      {r.contactEmail && ` · ${r.contactEmail}`}
                    </p>
                  </div>
                  <div className="text-right text-xs font-noto text-[#767676] flex flex-col items-end gap-1">
                    <p>价格感知：{PRICE[r.pricePerception] ?? r.pricePerception}</p>
                    <p className="mt-0.5">再次参加：{r.interestedInFuture === "yes" ? "是" : "否"}</p>
                    <DeleteButton id={r.id} type="post-survey" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
                  {[
                    { label: "讲解清晰度", val: r.ratings.clarity },
                    { label: "导览节奏",   val: r.ratings.pacing },
                    { label: "最深刻部分", val: Array.isArray(r.mostImpressive) ? r.mostImpressive.join("、") : r.mostImpressive },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#F5F5F5] px-3 py-2">
                      <p className="font-sans-ui text-[10px] tracking-wider text-[#767676] uppercase mb-1">{item.label}</p>
                      <p className="font-noto text-[#1A1A1A]">{item.val}</p>
                    </div>
                  ))}
                </div>

                {r.testimonial && (
                  <p className="font-noto text-sm text-[#666666] border-l-2 border-[#E51B23] pl-3 leading-relaxed mb-2">
                    「{r.testimonial}」
                  </p>
                )}
                {r.improvement && (
                  <p className="font-noto text-xs text-[#767676] mt-2">改进建议：{r.improvement}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
