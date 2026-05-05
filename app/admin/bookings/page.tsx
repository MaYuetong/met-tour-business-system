import { getBookings, getPreSurveys } from "@/lib/db";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending:   "待确认",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

const PAYMENT_LABELS: Record<string, string> = {
  full:    "全额",
  deposit: "定金",
};

export default async function BookingsPage() {
  const [bookings, pre] = await Promise.all([getBookings(), getPreSurveys()]);
  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-noto text-2xl text-[#1A1A1A]">预约记录</h1>
        <div className="flex items-center gap-3 text-sm font-noto">
          <span className="text-[#8B7D72]">合计：{bookings.length}</span>
          <span className="text-[#8B7D72]">·</span>
          <span className="text-green-700">已确认：{bookings.filter(b => b.status === "confirmed").length}</span>
          <span className="text-[#8B7D72]">·</span>
          <span className="text-[#C9A84C]">收入：${bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.amount, 0)}</span>
          <a href="/api/admin/export?type=bookings" download
            className="font-sans-ui text-[11px] tracking-widest uppercase border border-[#E0D5C8] bg-white px-4 py-2 text-[#8B7D72] hover:border-[#A6192E] hover:text-[#A6192E] transition-colors">
            下载 CSV
          </a>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white border border-[#E0D5C8] rounded-sm p-16 text-center">
          <p className="font-noto text-[#8B7D72] text-xl mb-2">暂无预约记录</p>
          <p className="font-noto text-[#8B7D72] text-sm">访客预约后将在此显示。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((b) => {
            const preSurvey = pre.find((s) => s.bookingId === b.id);
            return (
              <div key={b.id} className="bg-white border border-[#E0D5C8] rounded-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-noto text-[#1A1A1A] text-lg">{b.name}</h3>
                      <span className={`text-xs px-2 py-0.5 border rounded-sm font-noto ${STATUS_COLORS[b.status] ?? ""}`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                      {b.profileTag && (
                        <span className="text-xs bg-[#A6192E]/10 text-[#A6192E] px-2 py-0.5 rounded-sm font-noto">
                          {b.profileTag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-noto text-[#8B7D72]">{b.email}</p>

                    {preSurvey && (
                      <div className="mt-3">
                        <p className="text-xs text-[#8B7D72] font-noto mb-1.5">兴趣方向</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(preSurvey.interests ?? []).map((i) => (
                            <span key={i} className="text-xs bg-[#F8F5F0] border border-[#E0D5C8] text-[#8B7D72] px-2 py-0.5 rounded-sm font-noto">{i}</span>
                          ))}
                        </div>
                        {preSurvey.openQuestion && (
                          <p className="text-sm font-noto text-[#6B5E52] mt-2 border-t border-[#E0D5C8] pt-2">
                            「{preSurvey.openQuestion}」
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <p className="font-noto text-2xl text-[#A6192E] font-light">${b.amount}</p>
                    <p className="text-xs text-[#8B7D72] font-noto">{PAYMENT_LABELS[b.paymentType] ?? b.paymentType}</p>
                    {b.tourDate && (
                      <p className="text-sm font-noto text-[#C9A84C]">
                        {new Date(b.tourDate).toLocaleDateString("zh-CN", { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                    )}
                    <p className="text-xs text-[#8B7D72] font-noto">
                      {new Date(b.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                    <DeleteButton id={b.id} type="booking" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
