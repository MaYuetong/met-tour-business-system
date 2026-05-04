import Link from "next/link";
import { getAnalytics } from "@/lib/db";

export const dynamic = "force-dynamic";

const TOUR_ROUTE = [
  {
    num: "01",
    title: "Architecture & Sculpture",
    duration: "30 min",
    desc: "Begin at the grand entrance. Trace the echoes of Rome and Greece in the museum's architectural bones — columns, friezes, and monumental form that underpins all of Western art.",
    icon: "🏛",
  },
  {
    num: "02",
    title: "Medieval to Neoclassicism",
    duration: "1.5 hours",
    desc: "Journey through a millennium of European vision — from gilded altarpieces to the rational ideal of David. Witness how art became a mirror for faith, power, and reason.",
    icon: "⚜",
  },
  {
    num: "03",
    title: "Raphael Exhibition",
    duration: "1 hour",
    desc: "The heart of the tour. Raphael's works arrive at the MET in a rare gathering. Understand why he was called 'The Prince of Painters' — his harmony, grace, and revolutionary balance of the High Renaissance.",
    icon: "🖼",
  },
  {
    num: "04",
    title: "19th–20th Century Masters",
    duration: "30 min",
    desc: "Close with the explosion of modern vision. From the shimmering light of Monet to the raw emotion of Cézanne — see how artists broke from tradition to invent the modern world.",
    icon: "🌸",
  },
];

const STATIC_TESTIMONIALS = [
  {
    quote: "I've been to the MET five times and never understood what I was looking at. This tour changed everything. The Raphael section alone was worth the price.",
    name: "Sarah M.",
    detail: "First-time tour guest",
  },
  {
    quote: "Yuetong has a rare gift — she makes centuries of art history feel like a personal story. The pacing was perfect, the depth was extraordinary.",
    name: "David L.",
    detail: "Returned for a second tour",
  },
  {
    quote: "As someone with an art history degree, I was skeptical. I was wrong. The connections she draws between periods are genuinely illuminating.",
    name: "Prof. Chen",
    detail: "Academic guest",
  },
];

export default async function LandingPage() {
  let testimonials = STATIC_TESTIMONIALS;
  try {
    const analytics = await getAnalytics();
    const dbTestimonials = (analytics.testimonials ?? [])
      .filter((t: { text: string }) => t.text?.length > 20)
      .map((t: { text: string; date: string }) => ({
        quote: t.text,
        name: "Verified Guest",
        detail: new Date(t.date).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      }));
    if (dbTestimonials.length >= 2) testimonials = dbTestimonials;
  } catch { /* fallback to static */ }

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F5F0]/90 backdrop-blur-md border-b border-[#E0D5C8]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#8B7D72] font-garamond leading-none">
              At the Metropolitan Museum
            </p>
            <p className="font-playfair text-[#1A1A1A] text-sm font-semibold leading-tight mt-0.5">
              European Art History Tour
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#route" className="text-xs text-[#8B7D72] font-garamond tracking-widest uppercase hover:text-[#A6192E] transition-colors hidden md:block">
              The Journey
            </a>
            <a href="#pricing" className="text-xs text-[#8B7D72] font-garamond tracking-widest uppercase hover:text-[#A6192E] transition-colors hidden md:block">
              Pricing
            </a>
            <Link
              href="/book"
              className="bg-[#A6192E] text-white px-5 py-2.5 font-garamond text-xs tracking-widest uppercase hover:bg-[#8B1525] transition-colors rounded-sm"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 min-h-screen flex items-center relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #1A1A1A 0px, transparent 1px, transparent 40px),
                              repeating-linear-gradient(90deg, #1A1A1A 0px, transparent 1px, transparent 40px)`,
          }}
        />

        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-fade-in">
            {/* Ornament */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <p className="text-xs tracking-[0.35em] uppercase text-[#C9A84C] font-garamond">
                Premium Guided Experience · New York
              </p>
            </div>

            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-[1.1] mb-6">
              Understand
              <br />
              <span className="text-[#A6192E]">European Art</span>
              <br />
              History in
              <br />
              3.5 Hours
            </h1>

            <p className="font-garamond text-xl text-[#6B5E52] leading-relaxed mb-4">
              Including the Raphael Exhibition
            </p>

            <p className="font-garamond text-[#8B7D72] leading-relaxed mb-10 max-w-md">
              A private guided journey through the Metropolitan Museum of Art — from Roman antiquity
              to Impressionism. Five centuries. One afternoon. Complete clarity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-3 bg-[#A6192E] text-white px-10 py-5 font-garamond text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-all duration-200 rounded-sm shadow-lg shadow-[#A6192E]/20 hover:shadow-xl hover:shadow-[#A6192E]/30"
              >
                Reserve Your Spot
                <span>→</span>
              </Link>
              <a
                href="#route"
                className="inline-flex items-center justify-center gap-2 border border-[#E0D5C8] text-[#1A1A1A] px-8 py-5 font-garamond text-sm tracking-widest uppercase hover:border-[#A6192E] transition-colors rounded-sm"
              >
                See the Route
              </a>
            </div>

            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[#E0D5C8]">
              <div>
                <p className="font-playfair text-2xl text-[#A6192E]">3.5h</p>
                <p className="text-xs text-[#8B7D72] font-garamond tracking-wide mt-0.5">Duration</p>
              </div>
              <div className="w-px h-8 bg-[#E0D5C8]" />
              <div>
                <p className="font-playfair text-2xl text-[#A6192E]">4</p>
                <p className="text-xs text-[#8B7D72] font-garamond tracking-wide mt-0.5">Galleries</p>
              </div>
              <div className="w-px h-8 bg-[#E0D5C8]" />
              <div>
                <p className="font-playfair text-2xl text-[#A6192E]">$75</p>
                <p className="text-xs text-[#8B7D72] font-garamond tracking-wide mt-0.5">Per person</p>
              </div>
            </div>
          </div>

          {/* Visual panel */}
          <div className="hidden md:block relative animate-slide-up">
            <div className="relative bg-[#1A1A1A] rounded-sm overflow-hidden aspect-[3/4] flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
                <div className="w-20 h-px bg-[#C9A84C] mb-8" />
                <p className="font-playfair text-4xl text-white/10 text-center leading-tight mb-8">
                  "Art is not what you see, but what you make others see."
                </p>
                <p className="text-xs tracking-widest uppercase text-[#C9A84C] font-garamond">Edgar Degas</p>
                <div className="w-20 h-px bg-[#C9A84C] mt-8" />
              </div>

              {/* Decorative grid */}
              <div className="absolute top-6 right-6 opacity-20">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full inline-block m-1" />
                ))}
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white border border-[#E0D5C8] rounded-sm p-5 shadow-xl max-w-[200px]">
              <p className="text-[10px] text-[#8B7D72] uppercase tracking-widest font-garamond mb-1">Next Available</p>
              <p className="font-playfair text-[#1A1A1A]">Weekends</p>
              <p className="text-xs text-[#A6192E] font-garamond mt-1">Limited spots</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Route */}
      <section id="route" className="py-28 bg-white border-y border-[#E0D5C8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="ornament-divider mb-6">
              <span className="text-xs tracking-[0.3em] uppercase font-garamond">The Journey</span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A]">
              Four Chapters,
              <span className="text-[#A6192E]"> Five Centuries</span>
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[28px] top-8 bottom-8 w-px bg-[#E0D5C8] hidden md:block" />

            <div className="space-y-10">
              {TOUR_ROUTE.map((stop, idx) => (
                <div key={stop.num} className="flex gap-8 items-start group">
                  {/* Number node */}
                  <div className="flex-shrink-0 w-14 h-14 border-2 border-[#E0D5C8] group-hover:border-[#A6192E] rounded-full flex items-center justify-center bg-[#F8F5F0] transition-colors duration-300 relative z-10">
                    <span className="font-playfair text-[#A6192E] text-sm font-bold">{stop.num}</span>
                  </div>

                  <div className="flex-1 pt-3">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-playfair text-xl text-[#1A1A1A]">{stop.title}</h3>
                      <span className="text-xs text-[#C9A84C] font-garamond tracking-widest uppercase bg-[#C9A84C]/10 px-3 py-1 rounded-sm">
                        {stop.duration}
                      </span>
                    </div>
                    <p className="font-garamond text-[#6B5E52] leading-relaxed">{stop.desc}</p>

                    {idx < TOUR_ROUTE.length - 1 && (
                      <div className="mt-4 w-8 h-px bg-[#E0D5C8]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About / What You'll Learn */}
      <section className="py-28 bg-[#F8F5F0]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="ornament-divider mb-6">
                <span className="text-xs tracking-[0.3em] uppercase font-garamond">The Experience</span>
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A] mb-6">
                More Than a Tour.<br />
                <span className="text-[#A6192E]">A New Way of Seeing.</span>
              </h2>
              <div className="space-y-4 font-garamond text-[#6B5E52] leading-relaxed">
                <p>
                  The Metropolitan Museum of Art holds over 700,000 objects. Most visitors walk past the greatest paintings in human history without truly seeing them.
                </p>
                <p>
                  This tour is different. Instead of facts and dates, you'll receive something rarer — the ability to understand <em>why</em> a painting was made, <em>what</em> the artist was responding to, and <em>how</em> it changed everything that came after.
                </p>
                <p>
                  By the end of 3.5 hours, European art history will feel like a conversation you've been a part of all along.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: "Personalized to You", desc: "A pre-tour survey lets us calibrate depth and focus to your interests." },
                { title: "Small Groups Only", desc: "Maximum 6 guests. Intimate, unhurried, and space for real questions." },
                { title: "Raphael Exhibition Access", desc: "Dedicated time in the most talked-about exhibition in New York right now." },
                { title: "Lifetime Learning", desc: "You'll leave knowing how to look at art — anywhere, for the rest of your life." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 bg-white border border-[#E0D5C8] rounded-sm p-5">
                  <div className="w-1 bg-[#A6192E] rounded-full flex-shrink-0" />
                  <div>
                    <h3 className="font-playfair text-[#1A1A1A] mb-1">{item.title}</h3>
                    <p className="text-sm font-garamond text-[#8B7D72] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 bg-[#1A1A1A]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center gap-4 justify-center mb-6">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <p className="text-xs tracking-[0.3em] uppercase text-[#C9A84C] font-garamond">Guest Reflections</p>
              <div className="w-8 h-px bg-[#C9A84C]" />
            </div>
            <h2 className="font-playfair text-3xl text-white">What Guests Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="border border-white/10 rounded-sm p-8 hover:border-[#C9A84C]/30 transition-colors">
                <div className="text-[#C9A84C] text-3xl font-playfair mb-4 leading-none">"</div>
                <p className="font-garamond text-white/80 leading-relaxed mb-6 italic">
                  {t.quote}
                </p>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-playfair text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/50 font-garamond mt-0.5">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 bg-[#F8F5F0]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="ornament-divider mb-6">
            <span className="text-xs tracking-[0.3em] uppercase font-garamond">Reserve Your Place</span>
          </div>
          <h2 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A] mb-4">
            One Price. Complete Experience.
          </h2>
          <p className="font-garamond text-[#8B7D72] mb-14 text-lg">
            No hidden fees. MET admission is separate and required.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
            {/* Full Payment */}
            <div className="relative bg-[#A6192E] text-white rounded-sm p-8 text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
              <p className="text-[#C9A84C] text-xs tracking-widest uppercase font-garamond mb-4">Full Payment</p>
              <p className="font-playfair text-5xl mb-1">$75</p>
              <p className="text-white/70 font-garamond text-sm mb-8">per person</p>
              <ul className="space-y-2 mb-8">
                {[
                  "3.5h guided tour",
                  "Raphael Exhibition",
                  "Pre-tour survey profile",
                  "Post-tour materials",
                  "Priority group size",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-garamond text-white/90">
                    <span className="text-[#C9A84C]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/book?plan=full"
                className="block w-full text-center bg-white text-[#A6192E] py-4 font-garamond text-xs tracking-widest uppercase hover:bg-[#F8F5F0] transition-colors rounded-sm"
              >
                Book Full Tour
              </Link>
            </div>

            {/* Deposit */}
            <div className="bg-white border border-[#E0D5C8] rounded-sm p-8 text-left">
              <p className="text-[#8B7D72] text-xs tracking-widest uppercase font-garamond mb-4">Reserve with Deposit</p>
              <p className="font-playfair text-5xl text-[#1A1A1A] mb-1">$20</p>
              <p className="text-[#8B7D72] font-garamond text-sm mb-8">$55 balance on the day</p>
              <ul className="space-y-2 mb-8">
                {[
                  "Hold your spot now",
                  "Pay balance later",
                  "Same full experience",
                  "Flexible for planning",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-garamond text-[#6B5E52]">
                    <span className="text-[#A6192E]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/book?plan=deposit"
                className="block w-full text-center bg-[#F8F5F0] border border-[#E0D5C8] text-[#1A1A1A] py-4 font-garamond text-xs tracking-widest uppercase hover:border-[#A6192E] transition-colors rounded-sm"
              >
                Reserve with Deposit
              </Link>
            </div>
          </div>

          <p className="text-xs text-[#8B7D72] font-garamond">
            MET suggested admission is $30 (adults). Not included in tour price.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white border-t border-[#E0D5C8]">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-playfair text-2xl text-[#1A1A1A] mb-10 text-center">Common Questions</h2>
          {[
            {
              q: "Do I need an art history background?",
              a: "Not at all. The tour is designed to be genuinely illuminating whether this is your first museum visit or your hundredth.",
            },
            {
              q: "Is MET admission included?",
              a: "No — the MET charges a suggested admission of $30 for adults. This is separate from the tour fee.",
            },
            {
              q: "How small are the groups?",
              a: "Maximum 6 guests. This ensures you always have access to the guide and can ask questions freely.",
            },
            {
              q: "What happens after I book?",
              a: "You'll receive a confirmation email and a link to a short pre-tour survey so we can personalize the experience for you.",
            },
          ].map((faq) => (
            <div key={faq.q} className="mb-6 pb-6 border-b border-[#E0D5C8] last:border-0">
              <h3 className="font-playfair text-[#1A1A1A] mb-2">{faq.q}</h3>
              <p className="font-garamond text-[#6B5E52] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 bg-[#A6192E] text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="w-8 h-px bg-white/30" />
            <p className="text-xs tracking-[0.35em] uppercase text-white/60 font-garamond">Begin Your Journey</p>
            <div className="w-8 h-px bg-white/30" />
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl mb-6 leading-tight">
            The Museum Has Always Been There.
            <br />
            <span className="text-white/70">Now See It Differently.</span>
          </h2>
          <p className="font-garamond text-white/70 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Reserve your place for a 3.5-hour journey through the greatest collection of European art on the continent.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-3 bg-white text-[#A6192E] px-14 py-5 font-garamond text-sm tracking-widest uppercase hover:bg-[#F8F5F0] transition-colors rounded-sm shadow-2xl"
          >
            Reserve Your Spot <span>→</span>
          </Link>
          <p className="text-xs text-white/40 font-garamond mt-6">$75 · Maximum 6 guests · Weekends at the MET</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-playfair text-white/80 text-sm">European Art History Tour at the MET</p>
            <p className="text-xs font-garamond mt-0.5">By appointment · New York City</p>
          </div>
          <div className="flex items-center gap-6 text-xs font-garamond tracking-widest uppercase">
            <Link href="/survey/pre" className="hover:text-white/80 transition-colors">Pre-Survey</Link>
            <Link href="/survey/post" className="hover:text-white/80 transition-colors">Post-Survey</Link>
            <Link href="/review" className="hover:text-white/80 transition-colors">Leave a Review</Link>
            <Link href="/admin" className="hover:text-white/80 transition-colors">Admin</Link>
          </div>
          <p className="text-xs font-garamond">© 2026 · All rights reserved</p>
        </div>
      </footer>
    </main>
  );
}
