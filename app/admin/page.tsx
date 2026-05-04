import Link from "next/link";
import { getBookings, getPostSurveys, getPreSurveys, getAnalytics } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [bookings, pre, post, analytics] = await Promise.all([
    getBookings(), getPreSurveys(), getPostSurveys(), getAnalytics(),
  ]);

  const confirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const revenue   = confirmed.reduce((s, b) => s + b.amount, 0);
  const upcoming  = bookings.filter((b) => b.tourDate && b.status === "confirmed");

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Bookings", value: bookings.length, note: `${confirmed.length} confirmed`, color: "text-[#A6192E]" },
          { label: "Revenue",        value: `$${revenue}`,  note: "from confirmed bookings", color: "text-[#C9A84C]" },
          { label: "Avg Rating",     value: analytics.responseCount > 0 ? analytics.avgRatings.overall.toFixed(1) + " / 5" : "—", note: `${post.length} responses`, color: "text-[#A6192E]" },
          { label: "NPS Score",      value: analytics.responseCount > 0 ? analytics.nps : "—", note: analytics.nps >= 50 ? "Excellent" : analytics.nps >= 0 ? "Good" : "—", color: analytics.nps >= 50 ? "text-green-700" : "text-[#C9A84C]" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E0D5C8] rounded-sm p-6">
            <p className="text-xs text-[#8B7D72] uppercase tracking-widest font-garamond mb-2">{s.label}</p>
            <p className={`font-playfair text-3xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#8B7D72] font-garamond mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { href: "/admin/bookings",  label: "Bookings",  count: bookings.length,  desc: "View all reservations" },
          { href: "/admin/crm",       label: "Guests",    count: confirmed.length, desc: "CRM & interest tags" },
          { href: "/admin/analytics", label: "Analytics", count: post.length,      desc: "Ratings, NPS, trends" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-white border border-[#E0D5C8] rounded-sm p-6 hover:border-[#A6192E] transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-playfair text-[#1A1A1A]">{item.label}</h3>
              <span className="font-playfair text-[#A6192E] text-xl">{item.count}</span>
            </div>
            <p className="text-sm font-garamond text-[#8B7D72]">{item.desc}</p>
            <p className="text-xs text-[#A6192E] font-garamond mt-3 group-hover:underline">View →</p>
          </Link>
        ))}
      </div>

      {/* Upcoming Tours */}
      <div className="mb-10">
        <h2 className="font-playfair text-xl text-[#1A1A1A] mb-5">Upcoming Tours</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white border border-[#E0D5C8] rounded-sm p-8 text-center">
            <p className="text-[#8B7D72] font-garamond">No upcoming scheduled tours.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((b) => {
              const preSurvey = pre.find((s) => s.bookingId === b.id);
              return (
                <div key={b.id} className="bg-white border border-[#E0D5C8] rounded-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="font-playfair text-[#1A1A1A]">{b.name}</p>
                    <p className="text-sm font-garamond text-[#8B7D72]">{b.email}</p>
                    {preSurvey && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs bg-[#A6192E]/10 text-[#A6192E] px-2 py-0.5 rounded-sm font-garamond">
                          {b.profileTag ?? preSurvey.profileTag}
                        </span>
                        {(preSurvey.interests ?? []).slice(0, 2).map((i) => (
                          <span key={i} className="text-xs bg-[#F8F5F0] border border-[#E0D5C8] text-[#8B7D72] px-2 py-0.5 rounded-sm font-garamond">{i}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-playfair text-[#C9A84C]">{new Date(b.tourDate!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    <p className="text-xs text-[#8B7D72] font-garamond mt-0.5">${b.amount}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Testimonials */}
      {analytics.testimonials && analytics.testimonials.length > 0 && (
        <div>
          <h2 className="font-playfair text-xl text-[#1A1A1A] mb-5">Recent Testimonials</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.testimonials.slice(0, 4).map((t: { text: string; date: string }, i: number) => (
              <div key={i} className="bg-white border border-[#E0D5C8] rounded-sm p-5">
                <p className="text-[#C9A84C] font-playfair text-2xl mb-2">"</p>
                <p className="font-garamond text-[#6B5E52] italic leading-relaxed text-sm mb-3">{t.text}</p>
                <p className="text-xs text-[#8B7D72] font-garamond">{new Date(t.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
