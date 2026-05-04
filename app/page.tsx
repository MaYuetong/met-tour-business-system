import Link from "next/link";
import { getAnalytics } from "@/lib/db";
import AnnouncementBar from "@/components/AnnouncementBar";
import MobileNavMenu from "@/components/MobileNavMenu";
import MetLogo from "@/components/MetLogo";

export const dynamic = "force-dynamic";

const TOUR_ROUTE = [
  {
    num: "一",
    en:  "Architecture & Sculpture",
    title: "建筑与雕塑",
    duration: "30 分钟",
    desc: "从宏伟的入口大厅开始，在罗马柱廊与希腊雕像之间，感受西方艺术最初的形与魂。建筑本身，就是第一件展品。",
  },
  {
    num: "二",
    en:  "Medieval to Neoclassicism",
    title: "中世纪至新古典主义",
    duration: "1.5 小时",
    desc: "穿越千年欧洲艺术长廊——从镀金圣像到理性之美的大卫。见证艺术如何成为信仰、权力与启蒙精神的镜子。",
  },
  {
    num: "三",
    en:  "Raphael Exhibition",
    title: "拉斐尔特展",
    duration: "1 小时",
    desc: "此行的核心。拉斐尔的画作在大都会难得聚首——我们将在此停留最久，理解为何他被称为「画家王子」，以及他的和谐与优雅如何定义了文艺复兴的巅峰。",
  },
  {
    num: "四",
    en:  "19th–20th Century Masters",
    title: "十九至二十世纪大师",
    duration: "30 分钟",
    desc: "以印象派收尾——莫奈的光影、塞尚的结构。见证艺术家如何打破传统，发明现代视觉语言。",
  },
];

const STATIC_TESTIMONIALS = [
  {
    quote: "我去过大都会五次，却从未真正看懂过。这次导览彻底改变了我。仅仅是拉斐尔那一小时，就值回全部的票价。",
    name: "蒋女士",
    detail: "来自深圳",
  },
  {
    quote: "A rare gift — centuries of art history told as a personal story. The pacing was perfect, the depth astonishing.",
    name: "Cathy Wong",
    detail: "来自西雅图",
  },
];

export default async function LandingPage() {
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
    <div className="min-h-screen bg-[#F8F5F0]">

      {/* ── Announcement Bar ─────────────────────────────────────────── */}
      <AnnouncementBar />

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E0D5C8] shadow-[0_1px_0_#E0D5C8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-[70px]">

            {/* Logo mark */}
            <Link href="/" className="flex items-end gap-3 group">
              <MetLogo className="h-10 w-auto text-[#A6192E]" />
              <div className="pb-0.5">
                <p className="font-noto text-[9px] tracking-[0.22em] uppercase text-[#8B7D72] leading-tight">欧洲艺术史</p>
                <p className="font-noto text-[9px] tracking-[0.22em] uppercase text-[#8B7D72] leading-tight">私人导览</p>
              </div>
            </Link>

            {/* Center nav */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { href: "#route",    label: "导览路线" },
                { href: "#experience", label: "体验" },
                { href: "#pricing",  label: "价格" },
                { href: "#faq",      label: "常见问题" },
              ].map((item) => (
                <a key={item.href} href={item.href}
                  className="font-sans-ui text-[13px] text-[#1A1A1A] hover:text-[#A6192E] transition-colors tracking-wide">
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <Link href="/book"
                className="hidden md:block font-sans-ui bg-[#A6192E] text-white text-[12px] tracking-widest uppercase px-5 py-2.5 hover:bg-[#8B1525] transition-colors">
                预约导览
              </Link>
              <MobileNavMenu />
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-[#111111] overflow-hidden">
        {/* Warm paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Subtle gold accent line — left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#C9A84C]/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-24 w-full">
          <div className="grid lg:grid-cols-[1fr_400px] gap-20 items-center">

            {/* Main hero text */}
            <div>
              <div className="flex items-center gap-4 mb-12">
                <span className="gold-rule" />
                <p className="section-caps text-[#C9A84C]/80">纽约大都会艺术博物馆 · 精品私人导览</p>
              </div>

              <h1 className="font-noto text-white leading-[1.1] mb-8">
                <span className="block text-[clamp(52px,8vw,96px)] font-[200] text-white/20 tracking-tight">三点五小时</span>
                <span className="block text-[clamp(48px,7.5vw,88px)] font-[200] text-white mt-2">读懂</span>
                <span className="block text-[clamp(48px,7.5vw,88px)] font-[200] text-[#A6192E]">欧洲艺术史</span>
              </h1>

              <p className="font-noto text-white/50 text-lg tracking-wider mb-3 font-[200]">含拉斐尔特展 · 全程中文</p>
              <p className="font-noto text-white/60 text-base leading-relaxed max-w-xl mb-12 font-[300]">
                一场穿越五个世纪的私人导览——从古罗马到印象派，在大都会艺术博物馆，用一个下午建立起属于你的艺术史观。
              </p>

              <div className="flex flex-wrap gap-4 mb-16">
                <Link href="/book"
                  className="inline-flex items-center gap-3 bg-[#A6192E] text-white px-10 py-4 font-sans-ui text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-all">
                  立即预约 →
                </Link>
                <a href="#route"
                  className="inline-flex items-center gap-3 border border-white/20 text-white/80 px-8 py-4 font-sans-ui text-sm tracking-widest uppercase hover:border-white/50 transition-colors">
                  查看路线
                </a>
              </div>

              {/* Key stats */}
              <div className="flex items-center gap-10 pt-8 border-t border-white/10">
                {[
                  { val: "3.5 小时", label: "深度导览" },
                  { val: "4 展区", label: "精选路线" },
                  { val: "$75", label: "每人起" },
                  { val: "≤ 6 人", label: "私享小团" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-noto text-2xl text-white/90 font-[200]">{s.val}</p>
                    <p className="font-sans-ui text-[11px] text-white/40 tracking-widest uppercase mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: decorative panel */}
            <div className="hidden lg:block">
              <div className="border border-white/10 p-10 relative">
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
                <p className="section-caps text-[#C9A84C]/60 mb-8">下一场导览</p>
                <p className="font-noto text-white/20 text-[68px] font-[200] leading-none tracking-tighter mb-2">5月12日</p>
                <p className="font-noto text-white/70 text-lg font-[300] mb-8">周日 · 名额有限</p>
                <div className="space-y-3 mb-8">
                  {[
                    { time: "10:00", note: "上午场 · 人流最少" },
                    { time: "14:00", note: "下午场 · 最受欢迎" },
                  ].map((slot) => (
                    <div key={slot.time} className="flex items-center justify-between border border-white/10 px-4 py-3">
                      <span className="font-sans-ui text-white/80 text-sm tracking-wider">{slot.time}</span>
                      <span className="font-noto text-white/40 text-xs">{slot.note}</span>
                    </div>
                  ))}
                </div>
                <Link href="/book"
                  className="block text-center bg-[#A6192E] text-white py-3.5 font-sans-ui text-xs tracking-widest uppercase hover:bg-[#8B1525] transition-colors">
                  查看可用日期
                </Link>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r border-b border-[#C9A84C]/30" />
                <div className="absolute -top-4 -left-4 w-8 h-8 border-l border-t border-[#C9A84C]/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ────────────────────────────────────────────── */}
      <div className="bg-[#A6192E] py-3 overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap font-sans-ui text-[11px] tracking-[0.25em] uppercase text-white/70 animate-[marquee_30s_linear_infinite]">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>大都会艺术博物馆</span>
              <span className="text-white/30">·</span>
              <span>欧洲艺术史私人导览</span>
              <span className="text-white/30">·</span>
              <span>含拉斐尔特展</span>
              <span className="text-white/30">·</span>
              <span>3.5 小时深度体验</span>
              <span className="text-white/30">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Tour Route ───────────────────────────────────────────────── */}
      <section id="route" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-[280px_1fr] gap-16 items-start">
            <div className="lg:sticky lg:top-24">
              <span className="gold-rule mb-6 block" />
              <p className="section-caps mb-4">导览路线</p>
              <h2 className="font-noto text-4xl text-[#1A1A1A] font-[300] leading-tight mb-6">
                四个章节<br /><span className="text-[#A6192E]">五个世纪</span>
              </h2>
              <p className="font-noto text-[#8B7D72] text-sm leading-relaxed mb-8">
                每一站都经过精心设计，既有独立的深度，又构成完整的历史叙事。
              </p>
              <Link href="/book"
                className="inline-block border border-[#A6192E] text-[#A6192E] px-6 py-3 font-sans-ui text-xs tracking-widest uppercase hover:bg-[#A6192E] hover:text-white transition-colors">
                预约导览
              </Link>
            </div>

            <div className="space-y-0 divide-y divide-[#E0D5C8]">
              {TOUR_ROUTE.map((stop, idx) => (
                <div key={stop.num} className="py-10 group flex gap-8 items-start">
                  <div className="flex-shrink-0 pt-1">
                    <p className="font-noto text-[64px] font-[200] text-[#E0D5C8] leading-none group-hover:text-[#A6192E]/20 transition-colors">
                      {idx + 1}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="section-caps text-[#C9A84C] mb-1">{stop.en}</p>
                        <h3 className="font-noto text-2xl text-[#1A1A1A] font-[300]">{stop.title}</h3>
                      </div>
                      <span className="flex-shrink-0 font-sans-ui text-xs text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-3 py-1.5 tracking-wide">
                        {stop.duration}
                      </span>
                    </div>
                    <p className="font-noto text-[#6B5E52] leading-relaxed">{stop.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Experience ───────────────────────────────────────────────── */}
      <section id="experience" className="py-28 bg-[#F8F5F0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Left: dark panel — editorial statement */}
            <div className="bg-[#111111] p-14 relative">
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
              <span className="gold-rule mb-8 block" />
              <blockquote className="font-noto text-white/20 text-[42px] font-[200] leading-tight mb-8">
                "艺术不是你所见之物，<br />而是你让他人所见之物。"
              </blockquote>
              <p className="font-sans-ui text-[11px] tracking-[0.25em] uppercase text-[#C9A84C]/70">— 埃德加·德加</p>
              <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-[#C9A84C]/15" />
            </div>

            {/* Right: feature list */}
            <div>
              <span className="gold-rule mb-6 block" />
              <p className="section-caps mb-4">关于此次体验</p>
              <h2 className="font-noto text-4xl text-[#1A1A1A] font-[300] leading-tight mb-6">
                不只是参观，<br /><span className="text-[#A6192E]">是一种全新的观看方式。</span>
              </h2>
              <p className="font-noto text-[#6B5E52] leading-relaxed mb-10">
                大都会艺术博物馆藏有超过七十万件作品。这次导览给你的不是年代与史实，而是理解<em>一幅画为何存在</em>、艺术家<em>在回应什么</em>，以及它<em>如何改变了之后的一切</em>。
              </p>
              <div className="space-y-0 divide-y divide-[#E0D5C8]">
                {[
                  { title: "为你个性化定制", desc: "参观前问卷帮助我们了解你的兴趣与知识背景，调整深度与重点。" },
                  { title: "小团私享 · 最多 6 位", desc: "亲密、从容，有充分的提问空间。" },
                  { title: "拉斐尔特展专场", desc: "在纽约目前最受瞩目的特展中，停留最完整的时间。" },
                  { title: "终身受用", desc: "离开后，你将拥有欣赏艺术的眼睛——在任何地方，一生有效。" },
                ].map((item) => (
                  <div key={item.title} className="py-5 flex gap-5 group">
                    <div className="flex-shrink-0 w-px bg-[#E0D5C8] group-hover:bg-[#A6192E] transition-colors mt-1 self-stretch" />
                    <div>
                      <h3 className="font-noto text-[#1A1A1A] font-[400] mb-1">{item.title}</h3>
                      <p className="font-noto text-sm text-[#8B7D72] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-28 bg-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg,#E0D5C8 0px,transparent 1px,transparent 60px),
                              repeating-linear-gradient(90deg,#E0D5C8 0px,transparent 1px,transparent 60px)`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-6 justify-center mb-16">
            <div className="w-12 h-px bg-[#C9A84C]/40" />
            <p className="section-caps text-[#C9A84C]/70">访客评语</p>
            <div className="w-12 h-px bg-[#C9A84C]/40" />
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[#111111] p-10 hover:bg-[#161616] transition-colors group">
                <div className="text-[#C9A84C]/40 text-5xl font-noto font-[200] leading-none mb-6 group-hover:text-[#C9A84C]/70 transition-colors">"</div>
                <p className="font-noto text-white/70 leading-relaxed mb-8 text-[15px]">{t.quote}</p>
                <div className="border-t border-white/10 pt-6">
                  <p className="font-noto text-white/90 text-sm font-[400]">{t.name}</p>
                  <p className="font-sans-ui text-[11px] text-white/40 tracking-wider mt-1 uppercase">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-[#F8F5F0]">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="gold-rule mx-auto mb-6 block" />
            <p className="section-caps mb-4">预约导览</p>
            <h2 className="font-noto text-4xl text-[#1A1A1A] font-[300] mb-4">一个价格，完整体验</h2>
            <p className="font-noto text-[#8B7D72] text-lg">不含隐藏费用。大都会门票需另行购买（建议票价 $30）。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-0 border border-[#E0D5C8] mb-8">
            {/* Full payment */}
            <div className="bg-[#A6192E] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-black/10 -translate-y-12 translate-x-12" />
              <p className="section-caps text-[#C9A84C]/80 mb-6">全额支付</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-noto text-6xl text-white font-[200]">$75</span>
              </div>
              <p className="font-sans-ui text-[12px] text-white/60 tracking-wider mb-8">每人 · 全包价格</p>
              <ul className="space-y-3 mb-10">
                {[
                  "3.5 小时深度导览",
                  "拉斐尔特展专场",
                  "参观前个性化问卷",
                  "导览后学习资料",
                  "优先保留团队名额",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-noto text-sm text-white/85">
                    <span className="w-4 h-px bg-[#C9A84C] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/book?plan=full"
                className="block w-full text-center bg-white text-[#A6192E] py-4 font-sans-ui text-xs tracking-widest uppercase hover:bg-[#F8F5F0] transition-colors">
                全额预约
              </Link>
            </div>

            {/* Deposit */}
            <div className="bg-white p-10 border-l border-[#E0D5C8]">
              <p className="section-caps text-[#8B7D72] mb-6">预付定金</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-noto text-6xl text-[#1A1A1A] font-[200]">$20</span>
              </div>
              <p className="font-sans-ui text-[12px] text-[#8B7D72] tracking-wider mb-8">定金 · 当天补 $55 尾款</p>
              <ul className="space-y-3 mb-10">
                {[
                  "先锁定名额",
                  "当天结清尾款",
                  "体验完全相同",
                  "适合灵活安排",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-noto text-sm text-[#6B5E52]">
                    <span className="w-4 h-px bg-[#A6192E] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/book?plan=deposit"
                className="block w-full text-center border border-[#E0D5C8] text-[#1A1A1A] py-4 font-sans-ui text-xs tracking-widest uppercase hover:border-[#A6192E] hover:text-[#A6192E] transition-colors">
                预付定金
              </Link>
            </div>
          </div>

          {/* Ticket-only option */}
          <div className="mt-14 pt-14 border-t border-[#E0D5C8]">
            <div className="flex items-center gap-6 justify-center mb-10">
              <div className="w-10 h-px bg-[#E0D5C8]" />
              <p className="section-caps">另有选项</p>
              <div className="w-10 h-px bg-[#E0D5C8]" />
            </div>

            <div className="border border-[#E0D5C8] bg-white p-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 pb-8 border-b border-[#E0D5C8]">
                <div>
                  <p className="section-caps text-[#C9A84C] mb-2">便民服务</p>
                  <h3 className="font-noto text-2xl text-[#1A1A1A] font-[300]">仅预约入场门票</h3>
                  <p className="font-noto text-sm text-[#8B7D72] mt-1">不含导览讲解服务</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-noto text-4xl text-[#A6192E] font-[200]">$6</p>
                  <p className="font-sans-ui text-[11px] text-[#8B7D72] tracking-widest uppercase mt-0.5">每人</p>
                </div>
              </div>

              <p className="font-noto text-[#6B5E52] mb-5 leading-relaxed">
                我每天有 <strong className="text-[#1A1A1A] font-[400]">5 个入场预约名额</strong>，可帮您提前预约门票。
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                  "到场后直接凭票入场，无需排队购票",
                  "门票全天有效，可随时出入博物馆",
                  "抵达存包后，直接凭票入场即可",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="w-4 h-px bg-[#A6192E] mt-3 flex-shrink-0" />
                    <p className="font-noto text-sm text-[#6B5E52] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <p className="font-sans-ui text-[11px] text-[#8B7D72] tracking-wide mb-8">
                费用说明：按大都会建议票价 $30 的 20% 计，为渠道预约服务费性质。
              </p>

              <div className="border-t border-[#E0D5C8] pt-8">
                <p className="section-caps text-center mb-6">扫码支付预约</p>
                <div className="grid grid-cols-2 gap-8 max-w-[260px] mx-auto">
                  <div className="text-center">
                    <div className="aspect-square bg-[#F8F5F0] border border-[#E0D5C8] overflow-hidden mb-3 flex items-center justify-center">
                      <img src="/qr-wechat.png" alt="微信收款码" className="w-full h-full object-cover" />
                    </div>
                    <p className="font-sans-ui text-[11px] text-[#8B7D72] tracking-wider uppercase">微信</p>
                  </div>
                  <div className="text-center">
                    <div className="aspect-square bg-[#F8F5F0] border border-[#E0D5C8] overflow-hidden mb-3 flex items-center justify-center">
                      <img src="/qr-alipay.png" alt="支付宝收款码" className="w-full h-full object-cover" />
                    </div>
                    <p className="font-sans-ui text-[11px] text-[#8B7D72] tracking-wider uppercase">支付宝</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="font-sans-ui text-[10px] text-[#C8BDB5] text-center mt-10 leading-relaxed opacity-60 max-w-lg mx-auto">
            参考信息：馆内设有免费中文导览（周二及周四），约 1 小时，约介绍 4 件作品，详情可向博物馆前台咨询。
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white border-t border-[#E0D5C8]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="gold-rule mx-auto mb-6 block" />
            <h2 className="font-noto text-3xl text-[#1A1A1A] font-[300]">常见问题</h2>
          </div>
          <div className="divide-y divide-[#E0D5C8]">
            {[
              { q: "需要艺术史基础吗？", a: "我们会根据您的情况设计适合您的讲解内容，导览专门设计为对任何背景的访客都有真实的启发，无论是第一次进博物馆还是第一百次。" },
              { q: "大都会门票包含在内吗？", a: "不包含。大都会的建议成人门票为 $30，需另行购买。我们提供当日有效的折扣票价，可以多次出入。" },
              { q: "每组最多几人？", a: "最多 6 位访客。保持亲密的团队规模，确保每位访客都能自由提问。" },
              { q: "预约后会发生什么？", a: "您将收到包含参观前问卷链接的确认邮件，帮助我们为您个性化本次体验。" },
              { q: "可以用中文导览吗？", a: "可以。中文或英文均可，预约时请在备注中说明。" },
            ].map((faq) => (
              <div key={faq.q} className="py-7">
                <h3 className="font-noto text-[#1A1A1A] font-[400] mb-3 text-lg">{faq.q}</h3>
                <p className="font-noto text-[#6B5E52] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-32 bg-[#A6192E] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg,white 0px,transparent 1px,transparent 40px),
                              repeating-linear-gradient(-45deg,white 0px,transparent 1px,transparent 40px)`,
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <span className="inline-block w-12 h-px bg-white/30 mb-10" />
          <h2 className="font-noto text-5xl md:text-6xl font-[200] mb-6 leading-tight">
            博物馆一直都在。<br />
            <span className="text-white/50">是时候真正看懂它了。</span>
          </h2>
          <p className="font-noto text-white/60 text-lg leading-relaxed mb-12 max-w-md mx-auto">
            预约一场 3.5 小时的私人导览，踏入欧洲最重要的艺术收藏之一。
          </p>
          <Link href="/book"
            className="inline-flex items-center gap-4 bg-white text-[#A6192E] px-14 py-5 font-sans-ui text-sm tracking-widest uppercase hover:bg-[#F8F5F0] transition-colors shadow-2xl font-[500]">
            立即预约 →
          </Link>
          <p className="font-sans-ui text-[11px] text-white/30 tracking-widest uppercase mt-8">
            $75 · 每组最多 6 人 · 周末场次
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-[#0D0D0D] text-white/40 py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 pb-10 border-b border-white/10">
            <div>
              <div className="flex items-end gap-3 mb-4">
                <MetLogo className="h-9 w-auto text-white/60" />
                <div className="pb-0.5">
                  <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-white/30 leading-tight">欧洲艺术史私人导览</p>
                </div>
              </div>
              <p className="font-sans-ui text-[11px] text-white/30 leading-relaxed">纽约 · 大都会艺术博物馆 · 预约制</p>
            </div>
            <div>
              <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-white/30 mb-4">访客链接</p>
              <div className="space-y-2">
                {[
                  { href: "/survey/pre",  label: "参观前问卷" },
                  { href: "/survey/post", label: "参观后问卷" },
                  { href: "/review",      label: "留下评价" },
                ].map((l) => (
                  <Link key={l.href} href={l.href}
                    className="block font-sans-ui text-[12px] text-white/40 hover:text-white/70 transition-colors tracking-wide">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-white/30 mb-4">后台</p>
              <Link href="/admin"
                className="font-sans-ui text-[12px] text-white/40 hover:text-white/70 transition-colors tracking-wide">
                管理后台
              </Link>
            </div>
          </div>
          <div className="pt-8 flex items-center justify-between">
            <p className="font-sans-ui text-[11px] text-white/20 tracking-wider">© 2026 · 版权所有</p>
            <span className="gold-rule opacity-30" />
          </div>
        </div>
      </footer>
    </div>
  );
}
