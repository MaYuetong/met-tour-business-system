import { getBookings, getPreSurveys } from "@/lib/db";
import DeleteButton from "@/components/DeleteButton";
import BookingStatusButtons from "@/components/BookingStatusButtons";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-[#F5F5F5] text-[#999999] border-[#E5E5E5]",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "待确认", confirmed: "已确认", completed: "已完成", cancelled: "已取消",
};
const INTEREST_LABELS: Record<string, string> = {
  architecture: "建筑与雕塑", medieval: "中世纪艺术", renaissance: "文艺复兴",
  baroque: "巴洛克", neoclassicism: "新古典主义", impressionism: "印象派",
  "europe-new-world": "欧洲与新世界",
};

export default async function BookingsPage() {
  const [bookings, pre] = await Promise.all([getBookings(), getPreSurveys()]);
  const sorted  = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const revenue = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999] mb-1">预约管理</p>
          <h1 className="font-noto text-2xl font-[300] text-[#1A1A1A]">预约记录</h1>
        </div>
        <a href="/api/admin/export?type=bookings" download
          className="flex-shrink-0 font-sans-ui text-[10px] tracking-widest uppercase border border-[#E5E5E5] bg-white px-3 py-2 text-[#767676] hover:border-[#E51B23] hover:text-[#E51B23] transition-colors mt-1">
          CSV
        </a>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-px bg-[#E5E5E5] border border-[#E5E5E5] mb-5">
        {[
          { label: "总计",   value: bookings.length },
          { label: "已确认", value: bookings.filter((b) => b.status === "confirmed").length },
          { label: "收入",   value: `$${revenue}` },
        ].map((s) => (
          <div key={s.label} className="bg-white px-4 py-3 text-center">
            <p className="font-noto text-2xl font-[200] text-[#1A1A1A]">{s.value}</p>
            <p className="font-sans-ui text-[9px] tracking-wider text-[#999999] uppercase mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] p-12 text-center">
          <p className="font-noto text-[#999999]">暂无预约记录</p>
        </div>
      ) : (
        <div className="space-y-px">
          {sorted.map((b) => {
            const preSurvey  = pre.find((s) => s.bookingId === b.id || s.email?.toLowerCase() === b.email?.toLowerCase());
            const interests  = (preSurvey?.interests ?? []).map((i) => INTEREST_LABELS[i] ?? i);
            return (
              <div key={b.id} className="bg-white border border-[#E5E5E5]">
                {/* Card header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex-shrink-0 font-sans-ui text-[9px] tracking-wider px-2 py-0.5 border ${STATUS_COLORS[b.status]}`}>
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                    {b.checkedIn && (
                      <span className="flex-shrink-0 font-sans-ui text-[9px] tracking-wider px-2 py-0.5 border bg-green-50 text-green-700 border-green-200">
                        ✓ 已到场
                      </span>
                    )}
                    <span className="font-sans-ui text-[10px] tracking-widest text-[#BBBBBB] truncate">{b.bookingCode}</span>
                  </div>
                  <p className="font-noto text-xl font-[200] text-[#E51B23] flex-shrink-0">${b.amount}</p>
                </div>

                {/* Card body */}
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-noto text-base text-[#1A1A1A]">{b.name}</p>
                      <p className="font-noto text-xs text-[#767676] mt-0.5 truncate">{b.email}</p>
                      {b.phone && <p className="font-noto text-xs text-[#999999]">{b.phone}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {b.tourDate && (
                        <p className="font-noto text-sm text-[#444444]">
                          {new Date(b.tourDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })}
                        </p>
                      )}
                      {b.groupSize && (
                        <p className="font-sans-ui text-[10px] text-[#999999] mt-0.5">{b.groupSize} 人</p>
                      )}
                    </div>
                  </div>

                  {/* Interests from pre-survey */}
                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {interests.map((i) => (
                        <span key={i} className="font-sans-ui text-[9px] tracking-wide bg-[#F5F5F5] border border-[#E5E5E5] text-[#767676] px-2 py-0.5">{i}</span>
                      ))}
                    </div>
                  )}

                  {preSurvey?.openQuestion && (
                    <p className="font-noto text-xs text-[#999999] mt-2 border-l-2 border-[#E51B23]/30 pl-2 line-clamp-2">
                      「{preSurvey.openQuestion}」
                    </p>
                  )}

                  {b.notes && (
                    <p className="font-noto text-xs text-[#666666] mt-2 bg-[#FFFBEA] border border-[#FFE58F] px-3 py-1.5">
                      {b.notes}
                    </p>
                  )}

                  {b.guideNotes && (
                    <p className="font-noto text-xs text-[#666666] mt-1 border-l-2 border-[#E5E5E5] pl-2 italic">
                      导览备注：{b.guideNotes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-[#F0F0F0] bg-[#FAFAFA]">
                  <p className="font-sans-ui text-[9px] text-[#BBBBBB] tracking-wide">
                    {new Date(b.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                  <div className="flex items-center gap-2">
                    <BookingStatusButtons id={b.id} status={b.status} groupSize={b.groupSize} tourDate={b.tourDate} timeSlot={b.timeSlot} notes={b.notes} amount={b.amount} />
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
