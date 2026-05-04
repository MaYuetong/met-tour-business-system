import { getBookings, getPreSurveys } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default async function BookingsPage() {
  const [bookings, pre] = await Promise.all([getBookings(), getPreSurveys()]);
  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair text-2xl text-[#1A1A1A]">Bookings</h1>
        <div className="flex gap-3 text-sm font-garamond">
          <span className="text-[#8B7D72]">Total: {bookings.length}</span>
          <span className="text-[#8B7D72]">·</span>
          <span className="text-green-700">Confirmed: {bookings.filter(b => b.status === "confirmed").length}</span>
          <span className="text-[#8B7D72]">·</span>
          <span className="text-[#C9A84C]">Revenue: ${bookings.filter(b=>b.status!=="cancelled").reduce((s,b)=>s+b.amount,0)}</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white border border-[#E0D5C8] rounded-sm p-16 text-center">
          <p className="font-playfair text-[#8B7D72] text-xl mb-2">No bookings yet</p>
          <p className="font-garamond text-[#8B7D72] text-sm">Bookings will appear here once guests reserve.</p>
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
                      <h3 className="font-playfair text-[#1A1A1A] text-lg">{b.name}</h3>
                      <span className={`text-xs px-2 py-0.5 border rounded-sm font-garamond capitalize ${STATUS_COLORS[b.status] ?? ""}`}>
                        {b.status}
                      </span>
                      {b.profileTag && (
                        <span className="text-xs bg-[#A6192E]/10 text-[#A6192E] px-2 py-0.5 rounded-sm font-garamond">
                          {b.profileTag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-garamond text-[#8B7D72]">{b.email}</p>

                    {preSurvey && (
                      <div className="mt-3">
                        <p className="text-xs text-[#8B7D72] font-garamond mb-1.5 uppercase tracking-widest">Interests</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(preSurvey.interests ?? []).map((i) => (
                            <span key={i} className="text-xs bg-[#F8F5F0] border border-[#E0D5C8] text-[#8B7D72] px-2 py-0.5 rounded-sm font-garamond">{i}</span>
                          ))}
                        </div>
                        {preSurvey.openQuestion && (
                          <p className="text-sm font-garamond text-[#6B5E52] italic mt-2 border-t border-[#E0D5C8] pt-2">
                            "{preSurvey.openQuestion}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-playfair text-2xl text-[#A6192E]">${b.amount}</p>
                    <p className="text-xs text-[#8B7D72] font-garamond mt-0.5 capitalize">{b.paymentType}</p>
                    {b.tourDate && (
                      <p className="text-sm font-garamond text-[#C9A84C] mt-2">
                        {new Date(b.tourDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                    )}
                    <p className="text-xs text-[#8B7D72] font-garamond mt-2">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </p>
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
