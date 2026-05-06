"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function MobileBookingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="bg-[#E51B23] px-5 py-4 flex items-center justify-between border-t border-[#C01018]">
        <div>
          <p className="font-noto text-white text-[15px] font-[400]">5月12日 · 周日</p>
          <p className="font-sans-ui text-[11px] text-white/60 tracking-wider mt-0.5">$86 起 · 最多 6 人</p>
        </div>
        <Link href="/book"
          className="bg-white text-[#E51B23] px-6 py-3 font-sans-ui text-[12px] tracking-widest uppercase font-[500] active:bg-[#F5F5F5] transition-colors">
          立即预约 →
        </Link>
      </div>
    </div>
  );
}
