"use client";

import { useState } from "react";

const FAQS = [
  { q: "需要艺术史基础吗？", a: "我们会根据您的情况设计适合您的讲解内容，导览专门设计为对任何背景的访客都有真实的启发，无论是第一次进博物馆还是第一百次。" },
  { q: "大都会门票包含在内吗？", a: "不包含。大都会的建议成人门票为 $30，需另行购买。我们提供当日有效的折扣票价，可以多次出入。" },
  { q: "每组最多几人？", a: "最多 6 位访客。保持亲密的团队规模，确保每位访客都能自由提问。" },
  { q: "预约后会发生什么？", a: "您将收到包含参观前问卷链接的确认邮件，帮助我们为您个性化本次体验。" },
  { q: "可以用中文导览吗？", a: "可以。中文或英文均可，预约时请在备注中说明。" },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#E0D5C8]">
      {FAQS.map((faq, i) => (
        <div key={faq.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-6 text-left gap-4 group">
            <h3 className="font-noto text-[#1A1A1A] font-[400] text-lg leading-snug group-hover:text-[#A6192E] transition-colors">
              {faq.q}
            </h3>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#A6192E" strokeWidth="1.5"
              className={`flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          {open === i && (
            <p className="font-noto text-[#6B5E52] leading-relaxed pb-6 -mt-1">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
