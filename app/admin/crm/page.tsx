import { getCRMData } from "@/lib/db";

export const dynamic = "force-dynamic";

const TAG_STYLES: Record<string, string> = {
  academic:        "bg-blue-50 text-blue-700 border-blue-200",
  storytelling:    "bg-purple-50 text-purple-700 border-purple-200",
  "photo-type":    "bg-pink-50 text-pink-700 border-pink-200",
  beginner:        "bg-green-50 text-green-700 border-green-200",
  "curious-learner":"bg-amber-50 text-amber-700 border-amber-200",
  unknown:         "bg-gray-50 text-gray-500 border-gray-200",
};

export default async function CRMPage() {
  const guests = await getCRMData();

  const renaissanceFans = guests.filter((g) => g.interests.includes("renaissance"));
  const impressionismFans = guests.filter((g) => g.interests.includes("impressionism"));
  const returners = guests.filter((g) => g.interestedInFuture === "yes");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair text-2xl text-[#1A1A1A]">Guest CRM</h1>
        <p className="text-sm font-garamond text-[#8B7D72]">{guests.length} total guests</p>
      </div>

      {/* Segment Chips */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: `Renaissance fans (${renaissanceFans.length})`, color: "bg-[#A6192E]/10 text-[#A6192E] border-[#A6192E]/20" },
          { label: `Impressionism fans (${impressionismFans.length})`, color: "bg-[#C9A84C]/20 text-[#8B5E00] border-[#C9A84C]/30" },
          { label: `Interested in return (${returners.length})`, color: "bg-green-50 text-green-700 border-green-200" },
        ].map((seg) => (
          <span key={seg.label} className={`text-xs px-3 py-1.5 border rounded-sm font-garamond ${seg.color}`}>
            {seg.label}
          </span>
        ))}
      </div>

      {guests.length === 0 ? (
        <div className="bg-white border border-[#E0D5C8] rounded-sm p-16 text-center">
          <p className="font-playfair text-[#8B7D72] text-xl mb-2">No guest data yet</p>
          <p className="font-garamond text-[#8B7D72] text-sm">Guest profiles will appear after the first booking and survey completion.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guests.map((g) => (
            <div key={g.id} className="bg-white border border-[#E0D5C8] rounded-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-playfair text-[#1A1A1A]">{g.name}</h3>
                    <span className={`text-xs px-2 py-0.5 border rounded-sm font-garamond capitalize ${TAG_STYLES[g.profileTag] ?? TAG_STYLES.unknown}`}>
                      {g.profileTag}
                    </span>
                    {g.interestedInFuture === "yes" && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-sm font-garamond">
                        Will return
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-garamond text-[#8B7D72]">{g.contactEmail}</p>

                  {g.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {g.interests.map((i) => (
                        <span key={i} className="text-xs bg-[#F8F5F0] border border-[#E0D5C8] text-[#8B7D72] px-2 py-0.5 rounded-sm font-garamond">{i}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  {g.nps !== null && (
                    <div>
                      <p className="font-playfair text-2xl text-[#A6192E]">{g.nps}</p>
                      <p className="text-xs text-[#8B7D72] font-garamond">NPS</p>
                    </div>
                  )}
                  <p className="text-xs text-[#8B7D72] font-garamond mt-2 capitalize">{g.status}</p>
                </div>
              </div>

              {g.testimonial && (
                <p className="text-sm font-garamond text-[#6B5E52] italic border-t border-[#E0D5C8] mt-3 pt-3">
                  "{g.testimonial}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
