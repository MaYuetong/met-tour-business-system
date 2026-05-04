import Link from "next/link";
import { Noto_Serif_SC } from "next/font/google";
import "../globals.css";
import AdminLogout from "@/components/AdminLogout";

const notoSerifSC = Noto_Serif_SC({
  weight: ["200", "300", "400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

const NAV = [
  { href: "/admin",            label: "概览" },
  { href: "/admin/bookings",   label: "预约记录" },
  { href: "/admin/surveys",    label: "问卷数据" },
  { href: "/admin/reviews",    label: "访客评价" },
  { href: "/admin/crm",        label: "访客 / CRM" },
  { href: "/admin/analytics",  label: "数据分析" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSerifSC.variable} antialiased bg-[#F8F5F0]`}>
        <div className="min-h-screen flex">
          <aside className="w-60 bg-[#1A1A1A] text-white flex-shrink-0 flex flex-col">
            <div className="px-6 py-6 border-b border-white/10">
              <p className="text-[10px] tracking-[0.2em] text-[#C9A84C] font-noto">后台管理</p>
              <p className="font-noto text-white mt-0.5">大都会艺术导览</p>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-sm text-white/70 hover:text-white hover:bg-white/5 transition-all font-noto text-sm">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-6 py-5 border-t border-white/10 space-y-2">
              <Link href="/" className="block text-xs text-white/40 hover:text-white/70 transition-colors font-noto">
                ← 返回前台
              </Link>
              <AdminLogout />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="border-b border-[#E0D5C8] bg-white/60 backdrop-blur-sm px-8 py-4">
              <p className="font-noto text-sm text-[#8B7D72]">欧洲艺术史导览 · 管理后台</p>
            </div>
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
