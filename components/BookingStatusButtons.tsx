"use client";

import { useState, useTransition } from "react";
import { confirmWithAmount, updateStatus } from "@/app/actions/update-status";

type Status = "pending" | "confirmed" | "completed" | "cancelled";

type Props = {
  id: string;
  status: Status;
  groupSize?: number;
};

const RATE_SMALL = 86; // per person, 1–2 people
const RATE_GROUP = 75; // per person, 3+ people

export default function BookingStatusButtons({ id, status, groupSize = 1 }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // auto-suggest based on group size
  const suggestedRate = groupSize >= 3 ? RATE_GROUP : RATE_SMALL;
  const [selectedRate, setSelectedRate] = useState<number>(suggestedRate);

  const totalAmount = selectedRate * groupSize;

  const handleConfirm = () => {
    startTransition(async () => {
      await confirmWithAmount(id, totalAmount);
      setShowConfirmModal(false);
    });
  };

  const handleStatus = (next: Status) => {
    startTransition(async () => {
      await updateStatus(id, next);
    });
  };

  return (
    <>
      <div className="flex gap-2 mt-2 flex-wrap">
        {status === "pending" && (
          <>
            <button
              onClick={() => { setSelectedRate(groupSize >= 3 ? RATE_GROUP : RATE_SMALL); setShowConfirmModal(true); }}
              disabled={isPending}
              className="font-sans-ui text-[10px] tracking-widest uppercase bg-green-600 text-white px-3 py-1.5 hover:bg-green-700 transition-colors disabled:opacity-40 rounded-sm">
              确认预约
            </button>
            <button
              onClick={() => handleStatus("cancelled")}
              disabled={isPending}
              className="font-sans-ui text-[10px] tracking-widest uppercase border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-40 rounded-sm">
              取消预约
            </button>
          </>
        )}
        {status === "confirmed" && (
          <>
            <button
              onClick={() => handleStatus("completed")}
              disabled={isPending}
              className="font-sans-ui text-[10px] tracking-widest uppercase bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 transition-colors disabled:opacity-40 rounded-sm">
              标记完成
            </button>
            <button
              onClick={() => handleStatus("cancelled")}
              disabled={isPending}
              className="font-sans-ui text-[10px] tracking-widest uppercase border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-40 rounded-sm">
              取消预约
            </button>
          </>
        )}
        {status === "cancelled" && (
          <button
            onClick={() => handleStatus("pending")}
            disabled={isPending}
            className="font-sans-ui text-[10px] tracking-widest uppercase border border-[#E5E5E5] text-[#767676] px-3 py-1.5 hover:border-green-400 hover:text-green-700 transition-colors disabled:opacity-40 rounded-sm">
            恢复预约
          </button>
        )}
      </div>

      {/* 价格确认弹窗 */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmModal(false); }}>
          <div className="bg-white border border-[#E5E5E5] w-full max-w-sm">
            <div className="bg-[#1A1A1A] px-5 py-4">
              <p className="font-sans-ui text-[11px] tracking-[0.2em] text-[#999999] uppercase">确认预约 — 线下支付</p>
            </div>
            <div className="p-5 space-y-4">
              <p className="font-noto text-sm text-[#666666]">
                人数：<span className="text-[#1A1A1A] font-medium">{groupSize} 人</span>
                &nbsp;·&nbsp;请选择单价：
              </p>

              <div className="space-y-2">
                {[
                  { rate: RATE_SMALL, label: `$${RATE_SMALL} / 人`, desc: "标准价（1–2 人）" },
                  { rate: RATE_GROUP, label: `$${RATE_GROUP} / 人`, desc: "团体价（3 人及以上）" },
                ].map(({ rate, label, desc }) => (
                  <button
                    key={rate}
                    onClick={() => setSelectedRate(rate)}
                    className={`w-full flex items-center justify-between px-4 py-3 border transition-colors ${
                      selectedRate === rate
                        ? "border-[#E51B23] bg-[#E51B23]/5"
                        : "border-[#E5E5E5] hover:border-[#999999]"
                    }`}>
                    <div className="text-left">
                      <p className={`font-noto text-sm font-medium ${selectedRate === rate ? "text-[#E51B23]" : "text-[#1A1A1A]"}`}>{label}</p>
                      <p className="font-noto text-xs text-[#999999]">{desc}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-noto text-lg font-light ${selectedRate === rate ? "text-[#E51B23]" : "text-[#999999]"}`}>
                        = ${rate * groupSize}
                      </p>
                      <p className="font-noto text-[10px] text-[#BBBBBB]">合计</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-[#F5F5F5] px-4 py-3 flex items-center justify-between">
                <span className="font-noto text-sm text-[#767676]">应收金额</span>
                <span className="font-noto text-2xl text-[#E51B23] font-light">${totalAmount}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 border border-[#E5E5E5] py-2.5 font-sans-ui text-[11px] tracking-widest uppercase text-[#767676] hover:border-[#999999] transition-colors">
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="flex-1 bg-green-600 text-white py-2.5 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-green-700 transition-colors disabled:opacity-40">
                  {isPending ? "确认中..." : `确认 $${totalAmount}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
