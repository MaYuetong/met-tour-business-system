"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const PRIMARY_NAV = [
  {
    href: "/admin",
    label: "概览",
    exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/admin/checkin",
    label: "核销",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  {
    href: "/admin/bookings",
    label: "预约",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="0"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: "/admin/surveys",
    label: "问卷",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

const MORE_NAV = [
  { href: "/admin/reviews",   label: "访客评价" },
  { href: "/admin/crm",       label: "访客 / CRM" },
  { href: "/admin/analytics", label: "数据分析" },
  { href: "/admin/guides",    label: "讲解员管理" },
];

export default function AdminBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const isMoreActive = MORE_NAV.some((n) => pathname.startsWith(n.href));

  return (
    <>
      {/* Overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* More drawer — slides up from bottom */}
      <div className={`md:hidden fixed bottom-16 left-0 right-0 z-50 bg-[#1A1A1A] border-t border-white/10 transition-transform duration-300 ${drawerOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="px-4 py-4 space-y-1">
          {MORE_NAV.map((item) => (
            <Link key={item.href} href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center justify-between px-4 py-4 font-noto text-base transition-colors ${pathname.startsWith(item.href) ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}>
              {item.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ))}
          <div className="border-t border-white/10 mt-2 pt-2">
            <Link href="/" onClick={() => setDrawerOpen(false)}
              className="flex items-center px-4 py-4 font-noto text-sm text-white/40 hover:text-white/70 transition-colors">
              ← 返回前台
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] border-t border-white/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-5 h-16">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-[#E51B23]" : "text-white/40 hover:text-white/70"}`}>
                {item.icon}
                <span className="font-sans-ui text-[9px] tracking-wider">{item.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setDrawerOpen((o) => !o)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${isMoreActive || drawerOpen ? "text-[#E51B23]" : "text-white/40 hover:text-white/70"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
            <span className="font-sans-ui text-[9px] tracking-wider">更多</span>
          </button>
        </div>
      </nav>
    </>
  );
}
