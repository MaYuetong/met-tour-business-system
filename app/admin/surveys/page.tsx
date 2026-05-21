import { getPreSurveys, getPostSurveys } from "@/lib/db";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const GENDER: Record<string, string> = { male: "男", female: "女", undisclosed: "不便透露" };
const KNOWLEDGE: Record<string, string> = {
  beginner:     "初次接触",
  some:         "略知一二",
  familiar:     "有所了解",
  professional: "专业背景",
};
const PREF: Record<string, string> = {
  storytelling: "故事叙述",
  structured:   "系统知识",
  academic:     "学术深度",
  photo:        "轻松随性",
};
const INTEREST: Record<string, string> = {
  architecture:    "欧洲建筑与雕塑",
  medieval:        "中世纪艺术",
  renaissance:     "文艺复兴",
  baroque:         "巴洛克/宫廷艺术",
  neoclassicism:   "新古典主义",
  impressionism:   "印象派",
  "europe-new-world": "欧洲与新世界",
};
const SECTION: Record<string, string> = {
  architecture:  "背景与历史",
  medieval:      "中世纪艺术",
  renaissance:   "文艺复兴（拉斐尔特展）",
  "17-18th":     "十七至十八世纪",
  impressionism: "印象派",
  other:         "其他",
};
const PRICE: Record<string, string> = {
  "80-100":  "$80–$100",
  "100-120": "$100–$120",
  "120-150": "$120–$150",
  "150+":    "$150 以上",
};

function Cell({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="bg-[#F5F5F5] px-3 py-2">
      <p className="font-sans-ui text-[10px] tracking-wider text-[#767676] uppercase mb-1">{label}</p>
      <p className="font-noto text-[#1A1A1A] text-sm">{value ?? "—"}</p>
    </div>
  );
}

export default async function SurveysPage() {
  const [pre, post] = await Promise.all([getPreSurveys(), getPostSurveys()]);
  const preSorted  = [...pre].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const postSorted = [...post].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-14">

      {/* ── 参观前问卷 ── */}
      <section>
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999] mb-1">问卷数据</p>
            <h1 className="font-noto text-xl font-[300] text-[#1A1A1A]">
              参观前问卷 <span className="text-[#E51B23]">({pre.length})</span>
            </h1>
          </div>
          <a href="/api/admin/export?type=pre-surveys" download
            className="flex-shrink-0 font-sans-ui text-[10px] tracking-widest uppercase border border-[#E5E5E5] bg-white px-3 py-2 text-[#767676] hover:border-[#E51B23] hover:text-[#E51B23] transition-colors mt-1">
            CSV
          </a>
        </div>

        {preSorted.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-10 text-center">
            <p className="font-noto text-[#767676]">暂无参观前问卷数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {preSorted.map((r) => {
              const interests = (r.interests ?? []).map((i) => INTEREST[i] ?? i);
              return (
                <div key={r.id} className="bg-white border border-[#E5E5E5] p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-noto text-[#1A1A1A] font-medium text-base">{r.name || "匿名访客"}</p>
                      <p className="text-xs text-[#767676] font-noto mt-0.5 space-x-2">
                        <span>{new Date(r.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" })}</span>
                        {r.visitDate && <span>· 参观日期：{r.visitDate}</span>}
                        {(r as { email?: string }).email && <span>· {(r as { email?: string }).email}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.profileTag && (
                        <span className="text-xs bg-[#E51B23]/10 text-[#E51B23] border border-[#E51B23]/20 px-2.5 py-1 font-noto">
                          {r.profileTag}
                        </span>
                      )}
                      <DeleteButton id={r.id} type="pre-survey" />
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <Cell label="性别"     value={GENDER[r.gender ?? ""] ?? r.gender} />
                    <Cell label="来自城市"  value={r.city} />
                    <Cell label="来自国家"  value={r.country} />
                    <Cell label="首次参观"  value={r.firstVisit === "yes" ? "是，第一次" : r.firstVisit === "no" ? "来过" : undefined} />
                    <Cell label="艺术背景"  value={KNOWLEDGE[r.knowledgeLevel ?? ""] ?? r.knowledgeLevel} />
                    <Cell label="体验偏好"  value={PREF[r.experiencePreference ?? ""] ?? r.experiencePreference} />
                  </div>

                  {/* Interests */}
                  {interests.length > 0 && (
                    <div className="mb-3">
                      <p className="font-sans-ui text-[10px] tracking-wider text-[#767676] uppercase mb-1.5">感兴趣方向</p>
                      <div className="flex flex-wrap gap-1.5">
                        {interests.map((i) => (
                          <span key={i} className="text-xs bg-white border border-[#E5E5E5] text-[#444444] px-2.5 py-0.5 font-noto">{i}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Open question */}
                  {r.openQuestion && (
                    <p className="font-noto text-sm text-[#444444] border-l-2 border-[#E51B23] pl-3 leading-relaxed mt-2">
                      「{r.openQuestion}」
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 参观后问卷 ── */}
      <section>
        <div className="flex items-start justify-between mb-4 gap-3 mt-8">
          <h2 className="font-noto text-xl font-[300] text-[#1A1A1A]">
            参观后问卷 <span className="text-[#E51B23]">({post.length})</span>
          </h2>
          <a href="/api/admin/export?type=post-surveys" download
            className="flex-shrink-0 font-sans-ui text-[10px] tracking-widest uppercase border border-[#E5E5E5] bg-white px-3 py-2 text-[#767676] hover:border-[#E51B23] hover:text-[#E51B23] transition-colors mt-1">
            CSV
          </a>
        </div>

        {postSorted.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-10 text-center">
            <p className="font-noto text-[#767676]">暂无参观后问卷数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {postSorted.map((r) => {
              const sections = (Array.isArray(r.mostImpressive) ? r.mostImpressive : [r.mostImpressive])
                .filter(Boolean).map((s) => SECTION[s] ?? s);
              const allowPublic = (r as { allowPublic?: boolean | null }).allowPublic;
              return (
                <div key={r.id} className="bg-white border border-[#E5E5E5] p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-noto text-[#E51B23] text-2xl font-light">{r.ratings.overall}/5</p>
                        <span className={`text-xs px-2 py-0.5 font-noto border ${r.nps >= 9 ? "bg-green-50 text-green-700 border-green-200" : r.nps >= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                          NPS {r.nps}
                        </span>
                        {allowPublic === true && (
                          <span className="text-xs px-2 py-0.5 font-sans-ui bg-green-50 text-green-700 border border-green-200">✅ 可公开</span>
                        )}
                        {allowPublic === false && (
                          <span className="text-xs px-2 py-0.5 font-sans-ui bg-[#F5F5F5] text-[#767676] border border-[#E5E5E5]">🔒 保密</span>
                        )}
                      </div>
                      <p className="text-xs text-[#767676] font-noto space-x-2">
                        <span>{new Date(r.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" })}</span>
                        {r.visitDate && <span>· 参观日期：{r.visitDate}</span>}
                        {r.contactEmail && <span>· {r.contactEmail}</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <DeleteButton id={r.id} type="post-survey" />
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <Cell label="性别"      value={GENDER[r.gender ?? ""] ?? r.gender} />
                    <Cell label="来自城市"   value={r.city} />
                    <Cell label="来自国家"   value={r.country} />
                    <Cell label="价格感知"   value={PRICE[r.pricePerception] ?? r.pricePerception} />
                    <Cell label="讲解清晰度" value={`${r.ratings.clarity} / 5`} />
                    <Cell label="导览节奏"   value={`${r.ratings.pacing} / 5`} />
                    <Cell label="再次参加"   value={r.interestedInFuture === "yes" ? "非常有兴趣" : r.interestedInFuture === "no" ? "暂时不需要" : undefined} />
                    <Cell label="公开授权"   value={allowPublic === true ? "✅ 同意匿名公开" : allowPublic === false ? "❌ 请保密" : "— 未作答"} />
                  </div>

                  {/* Most impressive sections */}
                  {sections.length > 0 && (
                    <div className="mb-3">
                      <p className="font-sans-ui text-[10px] tracking-wider text-[#767676] uppercase mb-1.5">最深刻部分</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sections.map((s) => (
                          <span key={s} className="text-xs bg-white border border-[#E5E5E5] text-[#444444] px-2.5 py-0.5 font-noto">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testimonial */}
                  {r.testimonial && (
                    <p className="font-noto text-sm text-[#444444] border-l-2 border-[#E51B23] pl-3 leading-relaxed mt-2 mb-2">
                      「{r.testimonial}」
                    </p>
                  )}

                  {/* Improvement */}
                  {r.improvement && (
                    <p className="font-noto text-xs text-[#767676] mt-2 border-l-2 border-[#E5E5E5] pl-3">
                      改进建议：{r.improvement}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
