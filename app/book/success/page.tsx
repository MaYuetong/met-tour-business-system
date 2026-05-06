"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MetLogo from "@/components/MetLogo";

function SuccessContent() {
  const params      = useSearchParams();
  const name        = params.get("name")        ?? "访客";
  const email       = params.get("email")       ?? "";
  const paymentType = params.get("paymentType") ?? "full";
  const amount      = params.get("amount")      ?? "8600";
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
      <header className="bg-[#E51B23]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <MetLogo className="h-8 w-auto text-white" />
            <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-white/60 pb-0.5 leading-tight hidden sm:block">欧洲艺术史导览</p>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">

        {/* Success mark */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 bg-[#E51B23] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-5 h-px bg-[#999999]" />
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#999999]">预约已确认</p>
            </div>
            <h1 className="font-noto text-3xl sm:text-4xl text-[#1A1A1A] font-[300]">{name}，欢迎。</h1>
          </div>
        </div>

        <p className="font-noto text-[#666666] leading-relaxed mb-8">
          您在大都会艺术博物馆欧洲艺术史私人导览的名额已成功预留。
          {paymentType === "deposit" && " 尾款 $66 将于导览当天结清。"}
          {" "}确认邮件已发送至 <strong className="text-[#1A1A1A] font-[400]">{email}</strong>。
        </p>

        {/* Booking code */}
        <div className="bg-[#1A1A1A] p-6 mb-6 text-center">
          <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#999999] mb-2">当日专属入场码</p>
          <p className="font-noto text-3xl font-[200] tracking-[0.3em] text-white mb-2">
            {params.get("bookingCode") ?? "—"}
          </p>
          <p className="font-sans-ui text-[10px] text-white/40 tracking-wider">请妥善保存，导览当天出示给讲解员</p>
        </div>

        {/* WeChat */}
        <div className="flex items-center gap-4 border border-green-200 bg-green-50 px-5 py-4 mb-8">
          <span className="text-2xl">💬</span>
          <div>
            <p className="font-noto text-sm text-green-800 leading-relaxed">请添加讲解员微信，方便导览前沟通行程细节。</p>
            <p className="font-noto font-[500] text-green-900 text-base mt-0.5">Yuti_9999</p>
          </div>
        </div>

        {/* Booking summary */}
        <div className="border border-[#E5E5E5] mb-8">
          <div className="bg-[#F5F5F5] px-5 py-3 border-b border-[#E5E5E5]">
            <p className="font-sans-ui text-[11px] tracking-wider text-[#767676] uppercase">预约详情</p>
          </div>
          <div className="divide-y divide-[#F0EBE3]">
            {[
              { label: "姓名",     value: name },
              { label: "邮箱",     value: email },
              { label: "支付方式", value: paymentType === "full" ? `全额 — $86` : paymentType === "deposit" ? `定金 — $${paidAmount}（+ $66 尾款）` : "已于其他方式支付" },
              { label: "地点",     value: "大都会艺术博物馆，纽约" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-start px-5 py-3.5 gap-4">
                <span className="font-sans-ui text-[12px] tracking-wide text-[#767676] flex-shrink-0">{row.label}</span>
                <span className="font-noto text-sm text-[#1A1A1A] text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-survey CTA */}
        <div className="border-l-4 border-[#E51B23] pl-5 mb-8">
          <p className="font-noto text-[#E51B23] font-[400] mb-1.5">下一步：参观前问卷</p>
          <p className="font-noto text-sm text-[#666666] leading-relaxed">
            请完成一份约 3 分钟的问卷，帮助我们为您个性化定制导览内容。
          </p>
        </div>

        <Link href={preSurveyHref}
          className="block w-full sm:w-auto sm:inline-flex items-center justify-center gap-3 bg-[#E51B23] text-white px-10 py-4 font-sans-ui text-sm tracking-widest uppercase hover:bg-[#C01018] active:bg-[#C01018] transition-colors text-center mb-6">
          开始参观前问卷 →
        </Link>

        <div className="mt-2">
          <Link href="/" className="font-sans-ui text-[11px] text-[#767676] tracking-wider hover:text-[#E51B23] transition-colors">
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
          <div className="w-8 h-8 border-2 border-[#E51B23] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-sans-ui text-[11px] tracking-widest text-[#767676] uppercase">加载中</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
