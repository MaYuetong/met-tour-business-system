"use client";

import { useState } from "react";
import Link from "next/link";
import MetLogo from "@/components/MetLogo";

const NAV_ITEMS = [
  { href: "#route",      label: "导览路线" },
  { href: "#experience", label: "体验介绍" },
  { href: "#pricing",    label: "价格" },
  { href: "#faq",        label: "常见问题" },
];

export default function MobileNavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
        aria-label="打开菜单"
      >
        <span className="block w-5 h-[1.5px] bg-[#1A1A1A]" />
        <span className="block w-5 h-[1.5px] bg-[#1A1A1A]" />
        <span className="block w-3.5 h-[1.5px] bg-[#1A1A1A]" />
      </button>

      {/* Fullscreen overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          {/* Overlay header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D5C8]">
            <div className="flex items-center gap-3">
              <MetLogo className="h-9 w-auto text-[#A6192E]" />
              <div className="pb-0.5">
                <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-[#8B7D72] leading-tight">欧洲艺术史</p>
                <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-[#8B7D72] leading-tight">私人导览</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 text-[#1A1A1A]" aria-label="关闭菜单">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col px-6 pt-8">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-5 border-b border-[#E0D5C8] group"
              >
                <div className="flex items-center gap-4">
                  <span className="font-sans-ui text-[11px] text-[#C9A84C] tracking-widest">0{i + 1}</span>
                  <span className="font-noto text-xl text-[#1A1A1A] font-[300] group-hover:text-[#A6192E] transition-colors">{item.label}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8BDB5" strokeWidth="1.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="px-6 pb-10 pt-6">
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="block w-full text-center bg-[#A6192E] text-white py-4 font-sans-ui text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-colors"
            >
              立即预约 →
            </Link>
            <p className="font-sans-ui text-[10px] text-[#8B7D72] text-center mt-3 tracking-wider">$75 · 每组最多 6 人 · 周末场次</p>
          </div>
        </div>
      )}
    </>
  );
}
