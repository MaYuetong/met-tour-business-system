import { getAnalytics, getPreSurveys } from "@/lib/db";

export const dynamic = "force-dynamic";

function BarChart({ data, total, color = "#A6192E" }: {
  data: Record<string, number>;
  total: number;
  color?: string;
}) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-3">
      {sorted.map(([label, count]) => (
        <div key={label}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-garamond text-[#6B5E52] capitalize">{label}</span>
            <span className="text-sm font-garamond text-[#1A1A1A]">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
          </div>
          <div className="w-full bg-[#E0D5C8] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function NPSGauge({ nps }: { nps: number }) {
  const clamped = Math.max(-100, Math.min(100, nps));
  const angle   = ((clamped + 100) / 200) * 180;
  const color   = nps >= 50 ? "#16a34a" : nps >= 0 ? "#C9A84C" : "#A6192E";
  const label   = nps >= 50 ? "Excellent" : nps >= 30 ? "Good" : nps >= 0 ? "Fair" : "Needs work";

  const cx = 100; const cy = 100; const r = 75;
  const toRad  = (deg: number) => (deg * Math.PI) / 180;
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
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#E0D5C8" strokeWidth="12" strokeLinecap="round"
        />
        {/* Value arc */}
        {angle > 0 && (
          <path
            d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
            fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          />
        )}
        <text x={cx} y={cy - 8} textAnchor="middle" className="font-playfair" style={{ fontSize: 28, fill: color, fontFamily: "Georgia, serif", fontWeight: 700 }}>
          {nps}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 11, fill: "#8B7D72", fontFamily: "Georgia, serif" }}>
          {label}
        </text>
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
        <h1 className="font-playfair text-2xl text-[#1A1A1A]">Analytics</h1>
        <p className="text-sm font-garamond text-[#8B7D72]">{analytics.responseCount} post-tour responses</p>
      </div>

      {analytics.responseCount === 0 && pre.length === 0 ? (
        <div className="bg-white border border-[#E0D5C8] rounded-sm p-16 text-center">
          <p className="font-playfair text-[#8B7D72] text-xl mb-2">No data yet</p>
          <p className="font-garamond text-[#8B7D72] text-sm">Analytics will populate after guests complete surveys.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* Ratings */}
            <div className="bg-white border border-[#E0D5C8] rounded-sm p-6 md:col-span-2">
              <h2 className="font-playfair text-lg text-[#1A1A1A] mb-6">Average Ratings</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Overall", value: analytics.avgRatings.overall },
                  { label: "Clarity", value: analytics.avgRatings.clarity },
                  { label: "Pacing",  value: analytics.avgRatings.pacing  },
                ].map((r) => (
                  <div key={r.label} className="text-center">
                    <p className="font-playfair text-4xl text-[#A6192E]">{r.value}</p>
                    <p className="text-xs text-[#8B7D72] font-garamond mt-1">{r.label}</p>
                    <div className="mt-2 h-1 bg-[#E0D5C8] rounded-full">
                      <div className="h-1 bg-[#A6192E] rounded-full" style={{ width: `${(r.value / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center pt-4 border-t border-[#E0D5C8]">
                <p className="text-xs text-[#8B7D72] font-garamond uppercase tracking-widest mb-1">Based on {analytics.responseCount} surveys</p>
              </div>
            </div>

            {/* NPS */}
            <div className="bg-white border border-[#E0D5C8] rounded-sm p-6">
              <h2 className="font-playfair text-lg text-[#1A1A1A] mb-4">Net Promoter Score</h2>
              {analytics.responseCount > 0 ? (
                <NPSGauge nps={analytics.nps} />
              ) : (
                <p className="text-center text-[#8B7D72] font-garamond text-sm py-8">No data yet</p>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Price Perception */}
            <div className="bg-white border border-[#E0D5C8] rounded-sm p-6">
              <h2 className="font-playfair text-lg text-[#1A1A1A] mb-6">Price Perception</h2>
              {Object.keys(analytics.priceBreakdown).length > 0 ? (
                <BarChart data={analytics.priceBreakdown} total={analytics.responseCount} color="#C9A84C" />
              ) : (
                <p className="text-[#8B7D72] font-garamond text-sm">No data yet</p>
              )}
            </div>

            {/* Most Impressive Sections */}
            <div className="bg-white border border-[#E0D5C8] rounded-sm p-6">
              <h2 className="font-playfair text-lg text-[#1A1A1A] mb-6">Most Impressive Sections</h2>
              {Object.keys(analytics.sectionBreakdown).length > 0 ? (
                <BarChart data={analytics.sectionBreakdown} total={analytics.responseCount} />
              ) : (
                <p className="text-[#8B7D72] font-garamond text-sm">No data yet</p>
              )}
            </div>
          </div>

          {/* Pre-Survey Analytics */}
          {pre.length > 0 && (
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white border border-[#E0D5C8] rounded-sm p-6">
                <h2 className="font-playfair text-lg text-[#1A1A1A] mb-6">Top Guest Interests</h2>
                <BarChart data={interestCounts} total={pre.length} color="#A6192E" />
              </div>
              <div className="bg-white border border-[#E0D5C8] rounded-sm p-6">
                <h2 className="font-playfair text-lg text-[#1A1A1A] mb-6">Guest Profile Types</h2>
                <BarChart data={profileTagCounts} total={pre.length} color="#C9A84C" />
              </div>
            </div>
          )}

          {/* Revenue */}
          <div className="bg-white border border-[#E0D5C8] rounded-sm p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[#8B7D72] uppercase tracking-widest font-garamond mb-2">Total Bookings</p>
                <p className="font-playfair text-3xl text-[#1A1A1A]">{analytics.bookingCount}</p>
              </div>
              <div>
                <p className="text-xs text-[#8B7D72] uppercase tracking-widest font-garamond mb-2">Confirmed</p>
                <p className="font-playfair text-3xl text-green-700">{analytics.confirmedCount}</p>
              </div>
              <div>
                <p className="text-xs text-[#8B7D72] uppercase tracking-widest font-garamond mb-2">Total Revenue</p>
                <p className="font-playfair text-3xl text-[#C9A84C]">${analytics.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
