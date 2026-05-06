import { getAnalytics, getPreSurveys } from "@/lib/db";

export const dynamic = "force-dynamic";

const INTEREST_LABELS: Record<string, string> = {
  architecture:     "建筑与雕塑",
  medieval:         "中世纪艺术",
  renaissance:      "文艺复兴",
  baroque:          "巴洛克",
  neoclassicism:    "新古典主义",
  impressionism:    "印象派",
  "europe-new-world": "欧洲与新世界",
};

const SECTION_LABELS: Record<string, string> = {
  architecture:  "建筑与雕塑",
  medieval:      "中世纪艺术",
  renaissance:   "文艺复兴",
  "17-18th":     "十七至十八世纪",
  impressionism: "印象派",
  other:         "其他",
};

const PROFILE_LABELS: Record<string, string> = {
  academic:          "学术探索者",
  storytelling:      "故事追寻者",
  "photo-type":      "视觉漫游者",
  beginner:          "好奇的新访客",
  "curious-learner": "求知探索者",
};

function BarChart({ data, total, color = "#E51B23", labelMap }: {
  data: Record<string, number>;
  total: number;
  color?: string;
  labelMap?: Record<string, string>;
}) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-3">
      {sorted.map(([label, count]) => (
        <div key={label}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-noto text-[#666666]">{labelMap?.[label] ?? label}</span>
            <span className="text-sm font-noto text-[#1A1A1A]">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
          </div>
          <div className="w-full bg-[#E5E5E5] rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function NPSGauge({ nps }: { nps: number }) {
  const clamped   = Math.max(-100, Math.min(100, nps));
  const angle     = ((clamped + 100) / 200) * 180;
  const color     = nps >= 50 ? "#16a34a" : nps >= 0 ? "#999999" : "#E51B23";
  const label     = nps >= 50 ? "优秀" : nps >= 30 ? "良好" : nps >= 0 ? "一般" : "需要改进";

  const cx = 100; const cy = 100; const r = 75;
  const toRad     = (deg: number) => (deg * Math.PI) / 180;
  const startAngle = 180;
  const endAngle   = 180 + angle;
  const sx = cx + r * Math.cos(toRad(startAngle));
  const sy = cy + r * Math.sin(toRad(startAngle));
  const ex = cx + r * Math.cos(toRad(endAngle));
  const ey = cy + r * Math.sin(toRad(endAngle));
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="text-center">
      <svg viewBox="0 0 200 120" className="w-48 mx-auto">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#E5E5E5" strokeWidth="12" strokeLinecap="round" />
        {angle > 0 && (
          <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
            fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: 28, fill: color, fontWeight: 700 }}>{nps}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 11, fill: "#767676" }}>{label}</text>
      </svg>
    </div>
  );
}

export default async function AnalyticsPage() {
  const [analytics, pre] = await Promise.all([getAnalytics(), getPreSurveys()]);

  const interestCounts: Record<string, number> = {};
  for (const r of pre) {
    for (const i of (r.interests ?? [])) {
      interestCounts[i] = (interestCounts[i] ?? 0) + 1;
    }
  }

  const profileTagCounts: Record<string, number> = {};
  for (const r of pre) {
    profileTagCounts[r.profileTag] = (profileTagCounts[r.profileTag] ?? 0) + 1;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-noto text-2xl text-[#1A1A1A]">数据分析</h1>
        <p className="text-sm font-noto text-[#767676]">{analytics.responseCount} 份参观后问卷</p>
      </div>

      {analytics.responseCount === 0 && pre.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-sm p-16 text-center">
          <p className="font-noto text-[#767676] text-xl mb-2">暂无数据</p>
          <p className="font-noto text-[#767676] text-sm">访客完成问卷后数据将在此显示。</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white border border-[#E5E5E5] rounded-sm p-6 md:col-span-2">
              <h2 className="font-noto text-lg text-[#1A1A1A] mb-6">平均评分</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "整体体验",   value: analytics.avgRatings.overall },
                  { label: "讲解清晰度", value: analytics.avgRatings.clarity },
                  { label: "导览节奏",   value: analytics.avgRatings.pacing  },
                ].map((r) => (
                  <div key={r.label} className="text-center">
                    <p className="font-noto text-4xl text-[#E51B23] font-light">{r.value}</p>
                    <p className="text-xs text-[#767676] font-noto mt-1">{r.label}</p>
                    <div className="mt-2 h-1 bg-[#E5E5E5] rounded-full">
                      <div className="h-1 bg-[#E51B23] rounded-full" style={{ width: `${(r.value / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center pt-4 border-t border-[#E5E5E5]">
                <p className="text-xs text-[#767676] font-noto mb-1">基于 {analytics.responseCount} 份问卷</p>
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-sm p-6">
              <h2 className="font-noto text-lg text-[#1A1A1A] mb-4">净推荐值 (NPS)</h2>
              {analytics.responseCount > 0 ? (
                <NPSGauge nps={analytics.nps} />
              ) : (
                <p className="text-center text-[#767676] font-noto text-sm py-8">暂无数据</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white border border-[#E5E5E5] rounded-sm p-6">
              <h2 className="font-noto text-lg text-[#1A1A1A] mb-6">价格感知</h2>
              {Object.keys(analytics.priceBreakdown).length > 0 ? (
                <BarChart data={analytics.priceBreakdown} total={analytics.responseCount} color="#999999" />
              ) : (
                <p className="text-[#767676] font-noto text-sm">暂无数据</p>
              )}
            </div>
            <div className="bg-white border border-[#E5E5E5] rounded-sm p-6">
              <h2 className="font-noto text-lg text-[#1A1A1A] mb-6">最难忘的部分</h2>
              {Object.keys(analytics.sectionBreakdown).length > 0 ? (
                <BarChart data={analytics.sectionBreakdown} total={analytics.responseCount} labelMap={SECTION_LABELS} />
              ) : (
                <p className="text-[#767676] font-noto text-sm">暂无数据</p>
              )}
            </div>
          </div>

          {pre.length > 0 && (
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white border border-[#E5E5E5] rounded-sm p-6">
                <h2 className="font-noto text-lg text-[#1A1A1A] mb-6">访客兴趣偏好</h2>
                <BarChart data={interestCounts} total={pre.length} color="#E51B23" labelMap={INTEREST_LABELS} />
              </div>
              <div className="bg-white border border-[#E5E5E5] rounded-sm p-6">
                <h2 className="font-noto text-lg text-[#1A1A1A] mb-6">访客类型分布</h2>
                <BarChart data={profileTagCounts} total={pre.length} color="#999999" labelMap={PROFILE_LABELS} />
              </div>
            </div>
          )}

          <div className="bg-white border border-[#E5E5E5] rounded-sm p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[#767676] font-noto mb-2">总预约数</p>
                <p className="font-noto text-3xl text-[#1A1A1A] font-light">{analytics.bookingCount}</p>
              </div>
              <div>
                <p className="text-xs text-[#767676] font-noto mb-2">已确认</p>
                <p className="font-noto text-3xl text-green-700 font-light">{analytics.confirmedCount}</p>
              </div>
              <div>
                <p className="text-xs text-[#767676] font-noto mb-2">总收入</p>
                <p className="font-noto text-3xl text-[#999999] font-light">${analytics.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
