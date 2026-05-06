import Link from "next/link";
import { getAnalytics } from "@/lib/db";
import { getNextAvailableDate } from "@/lib/availability";
import AnnouncementBar from "@/components/AnnouncementBar";
import MobileNavMenu from "@/components/MobileNavMenu";
import MetLogo from "@/components/MetLogo";
import MobileBookingBar from "@/components/MobileBookingBar";
import FAQAccordion from "@/components/FAQAccordion";

export const dynamic = "force-dynamic";

const TOUR_ROUTE = [
  { num: "01", en: "Architecture & Sculpture",   title: "建筑与雕塑",         duration: "30 min", desc: "从宏伟的入口大厅开始，在罗马柱廊与希腊雕像之间，感受西方艺术最初的形与魂。建筑本身，就是第一件展品。" },
  { num: "02", en: "Medieval to Neoclassicism",  title: "中世纪至新古典主义", duration: "1.5 hr",  desc: "穿越千年欧洲艺术长廊——从镀金圣像到理性之美的大卫。见证艺术如何成为信仰、权力与启蒙精神的镜子。" },
  { num: "03", en: "Raphael Exhibition",         title: "拉斐尔特展",         duration: "1 hr",   desc: "此行的核心。拉斐尔的画作在大都会难得聚首——我们将在此停留最久，理解为何他被称为「画家王子」。" },
  { num: "04", en: "19th–20th Century Masters",  title: "十九至二十世纪大师", duration: "30 min", desc: "以印象派收尾——莫奈的光影、塞尚的结构。见证艺术家如何打破传统，发明现代视觉语言。" },
];

const STATIC_TESTIMONIALS = [
  { quote: "之前自己来过两次，每次都是走马观花，看完啥也没记住。这次跟着历史线走才发现原来这样看才对，前后一串联起来一下就懂了。", name: "蒋女士", detail: "来自深圳" },
  { quote: "带着16岁的女儿一起来，女儿比较好奇。讲解的节奏舒适，随时可以细看，很值得。", name: "Cathy Wong", detail: "来自西雅图" },
];

export default async function LandingPage() {
  const nextTour = getNextAvailableDate();
  let testimonials = STATIC_TESTIMONIALS;
  try {
    const analytics = await getAnalytics();
    const dbT = (analytics.testimonials ?? [])
      .filter((t: { text: string }) => t.text?.length > 20)
      .map((t: { text: string; date: string }) => ({
        quote: t.text,
        name: "访客评价",
        detail: new Date(t.date).toLocaleDateString("zh-CN", { month: "long", year: "numeric" }),
      }));
    if (dbT.length >= 2) testimonials = dbT;
  } catch { /* use static */ }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      <MobileBookingBar />
      <AnnouncementBar />

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-3">
              <MetLogo className="h-8 w-auto text-[#E51B23]" />
              <div className="hidden sm:block">
                <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999] leading-tight">欧洲艺术史 · European Art History</p>
                <p className="font-sans-ui text-[9px] tracking-[0.2em] uppercase text-[#999999] leading-tight">私人导览 · Private Tour</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {[
                { href: "#route",      label: "导览路线" },
                { href: "#experience", label: "体验" },
                { href: "#pricing",    label: "价格" },
                { href: "#faq",        label: "FAQ" },
                { href: "#tip",        label: "支付" },
              ].map((item) => (
                <a key={item.href} href={item.href}
                  className="font-sans-ui text-[12px] text-[#333333] hover:text-[#E51B23] transition-colors tracking-wide">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/book"
                className="hidden md:block font-sans-ui bg-[#E51B23] text-white text-[11px] tracking-widest uppercase px-5 py-2.5 hover:bg-[#C01018] transition-colors">
                预约导览
              </Link>
              <MobileNavMenu />
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center bg-[#111111] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E51B23]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-20 w-full">
          <div className="grid lg:grid-cols-[1fr_360px] gap-16 items-center">

            <div>
              <p className="font-sans-ui text-[11px] tracking-[0.3em] uppercase text-[#767676] mb-10">
                The Metropolitan Museum of Art · 大都会艺术博物馆
              </p>

              <div className="mb-8">
                <h1 className="font-noto leading-none mb-3">
                  <span className="block text-[clamp(52px,8vw,96px)] font-[200] text-white">读懂</span>
                  <span className="block text-[clamp(52px,8vw,96px)] font-[200] text-[#E51B23]">欧洲艺术史</span>
                </h1>
                <p className="font-sans-ui text-[13px] tracking-[0.15em] text-white/35 font-[300]">
                  Understanding European Art History
                </p>
              </div>

              <p className="font-noto text-white/50 text-sm leading-relaxed max-w-xl mb-1.5 font-[300]">
                含拉斐尔特展 · 全程中文 · 小团私享
              </p>
              <p className="font-sans-ui text-[11px] text-white/25 tracking-wider mb-12">
                Raphael Exhibition · Chinese-guided · Private Groups up to 6
              </p>

              <div className="flex flex-wrap gap-3 mb-16">
                <Link href="/book"
                  className="inline-flex items-center gap-3 bg-[#E51B23] text-white px-10 py-4 font-sans-ui text-[12px] tracking-widest uppercase hover:bg-[#C01018] transition-colors">
                  立即预约 / Book Now →
                </Link>
                <a href="#route"
                  className="inline-flex items-center gap-3 border border-white/15 text-white/50 px-8 py-4 font-sans-ui text-[12px] tracking-widest uppercase hover:border-white/35 hover:text-white/70 transition-colors">
                  查看路线 / Tour Route
                </a>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/10">
                {[
                  { val: "4",    en: "Sections",      label: "展区章节" },
                  { val: "$86",  en: "Per Person",    label: "每人起" },
                  { val: "≤ 6", en: "Private Group", label: "私享小团" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-noto text-2xl text-white font-[200]">{s.val}</p>
                    <p className="font-sans-ui text-[10px] text-white/35 tracking-widest uppercase mt-0.5">{s.en}</p>
                    <p className="font-noto text-[12px] text-white/25 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="lg:hidden mt-8 border border-white/10 p-5 flex items-center justify-between">
                <div>
                  <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-1">Next Tour · 下一场</p>
                  <p className="font-noto text-white text-xl font-[200]">{nextTour.label} · {nextTour.weekday}</p>
                  <p className="font-sans-ui text-[11px] text-white/35 tracking-wider mt-1">10:00 · 14:00</p>
                </div>
                <Link href="/book"
                  className="bg-[#E51B23] text-white px-5 py-3 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-[#C01018] transition-colors">
                  预约 →
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="border border-white/10 p-8">
                <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#767676] mb-6">
                  Next Available · 下一场导览
                </p>
                <p className="font-noto text-white/10 text-[60px] font-[200] leading-none mb-1">{nextTour.label}</p>
                <p className="font-noto text-white/60 text-sm font-[300] mb-8">{nextTour.weekday} · 名额有限</p>
                <div className="space-y-2 mb-8">
                  {[
                    { time: "10:00", note: "Morning · 上午场" },
                    { time: "14:00", note: "Afternoon · 下午场" },
                  ].map((slot) => (
                    <div key={slot.time} className="flex items-center justify-between border border-white/8 px-4 py-3">
                      <span className="font-sans-ui text-white/70 text-sm tracking-wider">{slot.time}</span>
                      <span className="font-sans-ui text-[10px] text-[#767676] tracking-wide">{slot.note}</span>
                    </div>
                  ))}
                </div>
                <Link href="/book"
                  className="block text-center bg-[#E51B23] text-white py-3.5 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-[#C01018] transition-colors">
                  查看可用日期 / Check Dates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="bg-[#E51B23] py-2.5 overflow-hidden">
        <div className="flex gap-10 whitespace-nowrap font-sans-ui text-[10px] tracking-[0.25em] uppercase text-white/65 animate-[marquee_35s_linear_infinite]">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>大都会艺术博物馆</span>
              <span className="text-white/25">·</span>
              <span>The Metropolitan Museum of Art</span>
              <span className="text-white/25">·</span>
              <span>欧洲艺术史私人导览</span>
              <span className="text-white/25">·</span>
              <span>European Art History Tour</span>
              <span className="text-white/25">·</span>
              <span>含拉斐尔特展 · Raphael Exhibition</span>
              <span className="text-white/25">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Tour Route ── */}
      <section id="route" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[220px_1fr] gap-16 items-start">

            <div className="lg:sticky lg:top-20">
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#E51B23] mb-2">Tour Route · 导览路线</p>
              <h2 className="font-noto text-xl text-[#1A1A1A] font-[300] leading-tight mb-2">
                四个章节<br /><span className="text-[#E51B23]">五个世纪</span>
              </h2>
              <p className="font-sans-ui text-[11px] text-[#999999] tracking-wider mb-5">Four chapters · Five centuries</p>
              <p className="font-noto text-[#767676] text-sm leading-relaxed mb-6">
                每一站都经过精心设计，既有独立的深度，又构成完整的历史叙事。
              </p>
              <Link href="/book"
                className="inline-block border border-[#E51B23] text-[#E51B23] px-5 py-2.5 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-[#E51B23] hover:text-white transition-colors">
                预约导览
              </Link>
            </div>

            <div className="divide-y divide-[#E5E5E5]">
              {TOUR_ROUTE.map((stop, idx) => (
                <div key={stop.num} className="py-6 flex gap-6 items-start group">
                  <p className="flex-shrink-0 font-sans-ui text-[28px] font-[300] text-[#E5E5E5] leading-none group-hover:text-[#E51B23]/20 transition-colors w-9">
                    {idx + 1}
                  </p>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#999999] mb-1">{stop.en}</p>
                        <h3 className="font-noto text-base text-[#1A1A1A] font-[300]">{stop.title}</h3>
                      </div>
                      <span className="flex-shrink-0 font-sans-ui text-[10px] text-[#E51B23] bg-[#E51B23]/5 border border-[#E51B23]/15 px-2.5 py-1 tracking-wide">
                        {stop.duration}
                      </span>
                    </div>
                    <p className="font-noto text-[#666666] text-sm leading-relaxed">{stop.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" className="py-20 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="bg-[#111111] p-12">
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#767676] mb-8">Quote</p>
              <blockquote className="font-noto text-white/20 text-[32px] font-[200] leading-tight mb-6">
                "艺术不是你所见之物，<br />而是你让他人所见之物。"
              </blockquote>
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#767676]">— Edgar Degas · 埃德加·德加</p>
            </div>

            <div>
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#E51B23] mb-2">Experience · 关于体验</p>
              <h2 className="font-noto text-xl text-[#1A1A1A] font-[300] leading-tight mb-2">
                不只是参观，<br /><span className="text-[#E51B23]">是一种全新的观看方式。</span>
              </h2>
              <p className="font-sans-ui text-[11px] text-[#999999] tracking-wider mb-6">More than a visit — a new way of seeing.</p>
              <p className="font-noto text-[#666666] text-sm leading-relaxed mb-8">
                大都会艺术博物馆藏有超过七十万件作品。这次导览给你的不是年代与史实，而是理解一幅画为何存在、艺术家在回应什么，以及它如何改变了之后的一切。
              </p>
              <div className="divide-y divide-[#E5E5E5]">
                {[
                  { title: "为你个性化定制", en: "Personalized for you",  desc: "参观前问卷了解你的兴趣与知识背景，调整深度与重点。" },
                  { title: "小团私享 · 最多 6 位", en: "Private group", desc: "亲密、从容，有充分的提问空间。" },
                  { title: "拉斐尔特展专场",  en: "Raphael Exhibition",  desc: "在纽约目前最受瞩目的特展中，停留最完整的时间。" },
                  { title: "终身受用",         en: "A skill for life",    desc: "离开后，你将拥有欣赏艺术的眼睛——在任何地方，一生有效。" },
                ].map((item) => (
                  <div key={item.title} className="py-4 flex gap-4 group">
                    <div className="flex-shrink-0 w-[2px] bg-[#E5E5E5] group-hover:bg-[#E51B23] transition-colors mt-1 self-stretch" />
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-noto text-[#1A1A1A] text-sm font-[400]">{item.title}</h3>
                        <span className="font-sans-ui text-[10px] text-[#BBBBBB] tracking-wider">{item.en}</span>
                      </div>
                      <p className="font-noto text-[12px] text-[#767676] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-4 mb-12">
            <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#767676]">Reviews · 访客评语</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:pb-0 -mx-6 md:mx-0 px-6 md:px-0">
            {testimonials.map((t, i) => (
              <div key={i} className="flex-shrink-0 w-[82vw] sm:w-[60vw] md:w-auto snap-center bg-[#1A1A1A] border border-white/5 p-8 hover:bg-[#1E1E1E] transition-colors">
                <p className="font-noto text-white/55 leading-relaxed mb-6 text-sm">{t.quote}</p>
                <div className="border-t border-white/8 pt-4">
                  <p className="font-noto text-white/75 text-sm">{t.name}</p>
                  <p className="font-sans-ui text-[10px] text-[#767676] tracking-wider mt-0.5 uppercase">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-1.5 mt-5 md:hidden">
            {testimonials.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/15" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="mb-10">
            <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#E51B23] mb-2">Pricing · 预约导览</p>
            <h2 className="font-noto text-xl text-[#1A1A1A] font-[300] mb-2">选择您的预约方式</h2>
            <p className="font-noto text-[#767676] text-sm">不含隐藏费用。大都会门票需另行购买（建议票价 $30），<span className="text-[#E51B23]">可代为预约</span>。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-0 border border-[#E5E5E5] mb-8">
            <div className="bg-[#E51B23] p-10">
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-white/50 mb-6">Full Payment · 全额支付</p>
              <span className="font-noto text-5xl text-white font-[200]">$86</span>
              <p className="font-sans-ui text-[11px] text-white/45 tracking-wider mt-1 mb-8">每人 · Per person</p>
              <ul className="space-y-2.5 mb-10">
                {["精品私人导览", "拉斐尔特展专场", "参观前个性化问卷", "导览后学习资料", "优先保留团队名额"].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-noto text-sm text-white/75">
                    <div className="w-3 h-px bg-white/40 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/book?plan=full"
                className="block w-full text-center bg-white text-[#E51B23] py-3.5 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-[#F5F5F5] transition-colors">
                全额预约 / Book Full
              </Link>
            </div>

            <div className="bg-white p-10 border-l border-[#E5E5E5]">
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#999999] mb-6">Deposit · 预付定金</p>
              <span className="font-noto text-5xl text-[#1A1A1A] font-[200]">$20</span>
              <p className="font-sans-ui text-[11px] text-[#999999] tracking-wider mt-1 mb-8">定金 · 当天补 $66 尾款</p>
              <ul className="space-y-2.5 mb-10">
                {["先锁定名额", "当天结清尾款", "体验完全相同", "适合灵活安排"].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-noto text-sm text-[#666666]">
                    <div className="w-3 h-px bg-[#E51B23] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/book?plan=deposit"
                className="block w-full text-center border border-[#E5E5E5] text-[#1A1A1A] py-3.5 font-sans-ui text-[11px] tracking-widest uppercase hover:border-[#E51B23] hover:text-[#E51B23] transition-colors">
                预付定金 / Deposit
              </Link>
            </div>
          </div>

          <div id="tip" className="mt-12 pt-12 border-t border-[#E5E5E5]">
            <div className="mb-8">
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#999999] mb-2">Add-on · 另有选项</p>
              <h3 className="font-noto text-lg text-[#1A1A1A] font-[300]">仅预约入场门票</h3>
              <p className="font-sans-ui text-[11px] text-[#999999] tracking-wider mt-1">Ticket Booking Only · 不含导览服务</p>
            </div>

            <div className="border border-[#E5E5E5] p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-[#E5E5E5]">
                <p className="font-noto text-[#666666] text-sm leading-relaxed max-w-md">
                  我每天有 <strong className="text-[#1A1A1A] font-[400]">5 个入场预约名额</strong>，可帮您提前预约门票，到场后直接凭票入场，无需排队购票。
                </p>
                <div className="sm:text-right flex-shrink-0">
                  <p className="font-noto text-3xl text-[#E51B23] font-[200]">$8</p>
                  <p className="font-sans-ui text-[10px] text-[#999999] tracking-widest uppercase mt-0.5">每人 / per person</p>
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-6">
                <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#999999] text-center mb-6">支付方式 · Payment</p>
                <div className="grid grid-cols-3 gap-6 max-w-[320px] mx-auto">
                  {[
                    { src: "/qr-wechat.png", label: "微信 WeChat" },
                    { src: "/qr-alipay.png", label: "支付宝 Alipay" },
                    { src: "/qr-zelle.png",  label: "Zelle" },
                  ].map((qr) => (
                    <div key={qr.label} className="text-center">
                      <div className="aspect-square bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden mb-2">
                        <img src={qr.src} alt={qr.label} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-sans-ui text-[10px] text-[#999999] tracking-wider">{qr.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="font-sans-ui text-[10px] text-[#CCCCCC] text-center mt-8 leading-relaxed max-w-lg mx-auto">
            参考：馆内设有免费中文导览（周二及周四），约 1 小时，约介绍 4 件作品，详情可向博物馆前台咨询。
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 bg-[#F5F5F5] border-t border-[#E5E5E5]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-10">
            <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#E51B23] mb-2">FAQ · 常见问题</p>
            <h2 className="font-noto text-xl text-[#1A1A1A] font-[300]">常见问题解答</h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 pb-44 md:pb-28 bg-[#E51B23] text-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="font-sans-ui text-[10px] tracking-[0.3em] uppercase text-white/35 mb-10">
            European Art History · 欧洲艺术史私人导览
          </p>
          <h2 className="font-noto text-4xl md:text-5xl font-[200] mb-3 leading-tight">
            从古罗马到印象派
          </h2>
          <p className="font-sans-ui text-[13px] tracking-[0.1em] text-white/45 mb-8">
            From Ancient Rome to Impressionism
          </p>
          <p className="font-noto text-white/55 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            沿着欧洲艺术史最自然的脉络走一遍——看懂每个时代如何孕育下一个时代，看见艺术如何一步步走到今天。
          </p>
          <Link href="/book"
            className="inline-flex items-center gap-4 bg-white text-[#E51B23] px-12 py-4 font-sans-ui text-[12px] tracking-widest uppercase hover:bg-[#F5F5F5] transition-colors">
            立即预约 / Book Now →
          </Link>
          <p className="font-sans-ui text-[10px] text-white/25 tracking-widest uppercase mt-6">
            $86 · Max 6 Guests · Weekend Sessions
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0D0D0D] text-white/40 py-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 pb-8 border-b border-white/8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <MetLogo className="h-8 w-auto text-white/40" />
                <div>
                  <p className="font-sans-ui text-[8px] tracking-[0.2em] uppercase text-white/20 leading-tight">欧洲艺术史私人导览</p>
                  <p className="font-sans-ui text-[8px] tracking-[0.2em] uppercase text-white/20 leading-tight">European Art History Tour</p>
                </div>
              </div>
              <p className="font-sans-ui text-[11px] text-white/20">New York · The Metropolitan Museum of Art</p>
            </div>
            <div>
              <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-white/20 mb-4">访客链接 / Visitor Links</p>
              <div className="space-y-2">
                {[
                  { href: "/survey/pre",  label: "参观前问卷 / Pre-Visit Survey" },
                  { href: "/survey/post", label: "参观后问卷 / Post-Visit Survey" },
                  { href: "/review",      label: "留下评价 / Leave a Review" },
                ].map((l) => (
                  <Link key={l.href} href={l.href}
                    className="block font-sans-ui text-[11px] text-white/25 hover:text-white/55 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-white/20 mb-4">后台 / Admin</p>
              <Link href="/admin"
                className="font-sans-ui text-[11px] text-white/25 hover:text-white/55 transition-colors">
                管理后台 / Dashboard
              </Link>
            </div>
          </div>
          <div className="pt-6">
            <p className="font-sans-ui text-[10px] text-white/15 tracking-wider">© 2026 · All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
