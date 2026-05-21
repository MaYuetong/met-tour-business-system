import { getCRMData } from "@/lib/db";

export const dynamic = "force-dynamic";

const TAG_STYLES: Record<string, string> = {
  academic:         "bg-blue-50 text-blue-700 border-blue-200",
  storytelling:     "bg-purple-50 text-purple-700 border-purple-200",
  "photo-type":     "bg-pink-50 text-pink-700 border-pink-200",
  beginner:         "bg-green-50 text-green-700 border-green-200",
  "curious-learner":"bg-amber-50 text-amber-700 border-amber-200",
  unknown:          "bg-gray-50 text-gray-500 border-gray-200",
};

const TAG_LABELS: Record<string, string> = {
  academic:          "学术探索者",
  storytelling:      "故事追寻者",
  "photo-type":      "视觉漫游者",
  beginner:          "好奇的新访客",
  "curious-learner": "求知探索者",
};

const STATUS_LABELS: Record<string, string> = {
  pending:   "待确认",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

export default async function CRMPage() {
  const guests = await getCRMData();

  const renaissanceFans   = guests.filter((g) => g.interests.includes("renaissance"));
  const impressionismFans = guests.filter((g) => g.interests.includes("impressionism"));
  const returners         = guests.filter((g) => g.interestedInFuture === "yes");

  return (
    <div>
      <div className="mb-5">
        <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999] mb-1">访客管理</p>
        <div className="flex items-end justify-between">
          <h1 className="font-noto text-2xl font-[300] text-[#1A1A1A]">访客 / CRM</h1>
          <p className="font-sans-ui text-[10px] text-[#999999] tracking-wide">{guests.length} 位</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: `文艺复兴爱好者（${renaissanceFans.length}）`,   color: "bg-[#E51B23]/10 text-[#E51B23] border-[#E51B23]/20" },
          { label: `印象派爱好者（${impressionismFans.length}）`,   color: "bg-[#999999]/20 text-[#8B5E00] border-[#999999]/30" },
          { label: `有意再访（${returners.length}）`,               color: "bg-green-50 text-green-700 border-green-200" },
        ].map((seg) => (
          <span key={seg.label} className={`text-xs px-3 py-1.5 border rounded-sm font-noto ${seg.color}`}>
            {seg.label}
          </span>
        ))}
      </div>

      {guests.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-sm p-16 text-center">
          <p className="font-noto text-[#767676] text-xl mb-2">暂无访客数据</p>
          <p className="font-noto text-[#767676] text-sm">访客完成首次预约和问卷后将在此显示。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guests.map((g) => (
            <div key={g.id} className="bg-white border border-[#E5E5E5] rounded-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-noto text-[#1A1A1A]">{g.name}</h3>
                    <span className={`text-xs px-2 py-0.5 border rounded-sm font-noto ${TAG_STYLES[g.profileTag] ?? TAG_STYLES.unknown}`}>
                      {TAG_LABELS[g.profileTag] ?? g.profileTag}
                    </span>
                    {g.interestedInFuture === "yes" && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-sm font-noto">
                        有意再访
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-noto text-[#767676]">{g.contactEmail}</p>

                  {g.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {g.interests.map((i) => (
                        <span key={i} className="text-xs bg-[#F5F5F5] border border-[#E5E5E5] text-[#767676] px-2 py-0.5 rounded-sm font-noto">{i}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  {g.nps !== null && (
                    <div>
                      <p className="font-noto text-2xl text-[#E51B23] font-light">{g.nps}</p>
                      <p className="text-xs text-[#767676] font-noto">NPS</p>
                    </div>
                  )}
                  <p className="text-xs text-[#767676] font-noto mt-2">{STATUS_LABELS[g.status] ?? g.status}</p>
                </div>
              </div>

              {g.testimonial && (
                <p className="text-sm font-noto text-[#666666] border-t border-[#E5E5E5] mt-3 pt-3">
                  「{g.testimonial}」
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
