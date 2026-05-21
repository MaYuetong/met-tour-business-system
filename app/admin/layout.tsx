import Link from "next/link";
import { Noto_Serif_SC } from "next/font/google";
import "../globals.css";
import AdminLogout from "@/components/AdminLogout";
import AdminBottomNav from "@/components/AdminBottomNav";

const notoSerifSC = Noto_Serif_SC({
  weight: ["200", "300", "400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

const NAV = [
  { href: "/admin",            label: "概览" },
  { href: "/admin/checkin",    label: "到场核销 ✓" },
  { href: "/admin/bookings",   label: "预约记录" },
  { href: "/admin/surveys",    label: "问卷数据" },
  { href: "/admin/reviews",    label: "访客评价" },
  { href: "/admin/crm",        label: "访客 / CRM" },
  { href: "/admin/analytics",  label: "数据分析" },
  { href: "/admin/guides",     label: "讲解员管理" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSerifSC.variable} antialiased bg-[#F5F5F5]`}>
        <div className="min-h-screen flex">

          {/* ── Desktop sidebar (hidden on mobile) ── */}
          <aside className="hidden md:flex w-56 bg-[#1A1A1A] text-white flex-shrink-0 flex-col">
            <div className="px-5 py-5 border-b border-white/10">
              <p className="text-[9px] tracking-[0.2em] text-white/40 font-sans-ui uppercase mb-0.5">后台管理</p>
              <p className="font-noto text-white text-sm">大都会艺术导览</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 transition-all font-noto text-sm">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-5 py-4 border-t border-white/10 space-y-2">
              <Link href="/" className="block text-xs text-white/30 hover:text-white/60 transition-colors font-noto">
                ← 返回前台
              </Link>
              <AdminLogout />
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 flex flex-col">

            {/* Mobile top bar */}
            <header className="md:hidden sticky top-0 z-30 bg-[#1A1A1A] border-b border-white/10">
              <div className="flex items-center justify-between px-4 h-12">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#E51B23] flex items-center justify-center">
                    <span className="font-sans-ui text-white text-[9px] font-bold">M</span>
                  </div>
                  <p className="font-noto text-white text-sm tracking-wide">管理后台</p>
                </div>
                <Link href="/" className="font-sans-ui text-[10px] text-white/40 tracking-wider uppercase">
                  前台 ↗
                </Link>
              </div>
            </header>

            {/* Desktop breadcrumb bar */}
            <div className="hidden md:block border-b border-[#E5E5E5] bg-white/60 px-8 py-3">
              <p className="font-noto text-xs text-[#999999]">欧洲艺术史导览 · 管理后台</p>
            </div>

            {/* Page content */}
            <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <AdminBottomNav />
      </body>
    </html>
  );
}
