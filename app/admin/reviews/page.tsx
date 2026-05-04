import { getReviews } from "@/lib/db";

export const dynamic = "force-dynamic";

const STARS = (n: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? "#A6192E" : "#E0D5C8" }}>★</span>
  ));

const SECTION_LABELS: Record<string, string> = {
  architecture:  "Architecture & Sculpture",
  medieval:      "Medieval Art",
  renaissance:   "Renaissance / Raphael",
  "17-18th":     "17th–18th Century",
  impressionism: "Impressionism",
  overall:       "The whole tour",
};

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  const sorted  = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const quotable = reviews.filter((r) => r.allowQuote === "yes");
  const recommenders = reviews.filter((r) => r.wouldRecommend === "yes");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair text-2xl text-[#1A1A1A]">Guest Reviews</h1>
        <a
          href="/review"
          target="_blank"
          className="text-xs tracking-widest uppercase font-garamond text-[#A6192E] hover:underline"
        >
          View Review Form ↗
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Reviews",      value: reviews.length },
          { label: "Avg Rating",         value: avgRating + (reviews.length ? " / 5" : "") },
          { label: "Would Recommend",    value: recommenders.length },
          { label: "May Quote Publicly", value: quotable.length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E0D5C8] rounded-sm p-5">
            <p className="text-xs text-[#8B7D72] uppercase tracking-widest font-garamond mb-2">{s.label}</p>
            <p className="font-playfair text-3xl text-[#A6192E]">{s.value}</p>
          </div>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white border border-[#E0D5C8] rounded-sm p-16 text-center">
          <p className="font-playfair text-[#8B7D72] text-xl mb-3">No reviews yet</p>
          <p className="font-garamond text-[#8B7D72] text-sm mb-6">
            Share the review link with guests after the tour.
          </p>
          <a
            href="/review"
            target="_blank"
            className="inline-block bg-[#A6192E] text-white px-8 py-3 font-garamond text-xs tracking-widest uppercase hover:bg-[#8B1525] transition-colors rounded-sm"
          >
            Open Review Form ↗
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => (
            <div key={r.id} className="bg-white border border-[#E0D5C8] rounded-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Stars + name */}
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-lg leading-none">{STARS(r.rating)}</div>
                    <h3 className="font-playfair text-[#1A1A1A]">{r.name}</h3>
                    {r.wouldRecommend === "yes" && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-sm font-garamond">
                        Recommends
                      </span>
                    )}
                    {r.allowQuote === "yes" && (
                      <span className="text-xs bg-[#C9A84C]/20 text-[#8B5E00] border border-[#C9A84C]/30 px-2 py-0.5 rounded-sm font-garamond">
                        Quotable
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <p className="text-xs text-[#8B7D72] font-garamond mb-4">
                    {SECTION_LABELS[r.section] ?? r.section}
                    {r.email && ` · ${r.email}`}
                    {r.tourDate && ` · Tour: ${r.tourDate}`}
                  </p>

                  {/* Review text */}
                  <p className="font-garamond text-[#1A1A1A] leading-relaxed text-base italic border-l-2 border-[#A6192E] pl-4">
                    "{r.review}"
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-playfair text-3xl text-[#A6192E]">{r.rating}/5</p>
                  <p className="text-xs text-[#8B7D72] font-garamond mt-1">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
