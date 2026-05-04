"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const params      = useSearchParams();
  const name        = params.get("name")        ?? "访客";
  const email       = params.get("email")       ?? "";
  const paymentType = params.get("paymentType") ?? "full";
  const amount      = params.get("amount")      ?? "7500";
  const sessionId   = params.get("session_id");
  const isMock      = params.get("mock") === "1";
  const bookingId   = params.get("bookingId");

  const [bookingCreated, setBookingCreated] = useState(false);

  useEffect(() => {
    if (bookingCreated) return;
    if (isMock && bookingId) { setBookingCreated(true); return; }
    if (sessionId && !isMock) {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, paymentType, amount: parseInt(amount) / 100, status: "confirmed", stripeSessionId: sessionId }),
      }).then(() => setBookingCreated(true));
    }
  }, [name, email, paymentType, amount, sessionId, isMock, bookingId, bookingCreated]);

  const paidAmount = parseInt(amount) / 100;
  const preSurveyHref = `/survey/pre?bookingId=${bookingId ?? ""}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Red header */}
      <header className="bg-[#A6192E]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-end gap-2.5">
            <div className="flex flex-col leading-[0.8]">
              <span className="font-sans-ui font-black text-[17px] tracking-[-0.03em] text-white uppercase">THE</span>
              <span className="font-sans-ui font-black text-[17px] tracking-[-0.03em] text-white uppercase">MET</span>
            </div>
            <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-white/60 pb-0.5 leading-tight hidden sm:block">欧洲艺术史导览</p>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">

        {/* Success mark */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 bg-[#A6192E] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-5 h-px bg-[#C9A84C]" />
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#C9A84C]">预约已确认</p>
            </div>
            <h1 className="font-noto text-3xl sm:text-4xl text-[#1A1A1A] font-[300]">{name}，欢迎。</h1>
          </div>
        </div>

        <p className="font-noto text-[#6B5E52] leading-relaxed mb-8">
          您在大都会艺术博物馆欧洲艺术史私人导览的名额已成功预留。
          {paymentType === "deposit" && " 尾款 $55 将于导览当天结清。"}
          {" "}确认邮件已发送至 <strong className="text-[#1A1A1A] font-[400]">{email}</strong>。
        </p>

        {/* Booking summary */}
        <div className="border border-[#E0D5C8] mb-8">
          <div className="bg-[#F8F5F0] px-5 py-3 border-b border-[#E0D5C8]">
            <p className="font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase">预约详情</p>
          </div>
          <div className="divide-y divide-[#F0EBE3]">
            {[
              { label: "姓名",     value: name },
              { label: "邮箱",     value: email },
              { label: "支付方式", value: paymentType === "full" ? `全额 — $75` : `定金 — $${paidAmount}（+ $55 尾款）` },
              { label: "导览时长", value: "3.5 小时" },
              { label: "地点",     value: "大都会艺术博物馆，纽约" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-start px-5 py-3.5 gap-4">
                <span className="font-sans-ui text-[12px] tracking-wide text-[#8B7D72] flex-shrink-0">{row.label}</span>
                <span className="font-noto text-sm text-[#1A1A1A] text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-survey CTA */}
        <div className="border-l-4 border-[#A6192E] pl-5 mb-8">
          <p className="font-noto text-[#A6192E] font-[400] mb-1.5">下一步：参观前问卷</p>
          <p className="font-noto text-sm text-[#6B5E52] leading-relaxed">
            请完成一份约 3 分钟的问卷，帮助我们为您个性化定制导览内容。
          </p>
        </div>

        <Link href={preSurveyHref}
          className="block w-full sm:w-auto sm:inline-flex items-center justify-center gap-3 bg-[#A6192E] text-white px-10 py-4 font-sans-ui text-sm tracking-widest uppercase hover:bg-[#8B1525] active:bg-[#8B1525] transition-colors text-center mb-6">
          开始参观前问卷 →
        </Link>

        <div className="mt-2">
          <Link href="/" className="font-sans-ui text-[11px] text-[#8B7D72] tracking-wider hover:text-[#A6192E] transition-colors">
            ← 返回首页
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#A6192E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-sans-ui text-[11px] tracking-widest text-[#8B7D72] uppercase">加载中</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
