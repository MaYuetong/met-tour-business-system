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

function calcAmount(groupSize: number) {
  const rate = groupSize >= 3 ? RATE_GROUP : RATE_SMALL;
  return { rate, total: rate * groupSize };
}

export default function BookingStatusButtons({ id, status, groupSize = 1 }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const { rate, total } = calcAmount(groupSize);

  const handleConfirm = () => {
    startTransition(async () => {
      await confirmWithAmount(id, total);
      setShowModal(false);
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
              onClick={() => setShowModal(true)}
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white border border-[#E5E5E5] w-full max-w-xs">
            <div className="bg-[#1A1A1A] px-5 py-4">
              <p className="font-sans-ui text-[11px] tracking-[0.2em] text-[#999999] uppercase">确认预约</p>
            </div>
            <div className="p-5 space-y-4">
              {/* 计算明细 */}
              <div className="bg-[#F5F5F5] px-4 py-4 space-y-2">
                <div className="flex justify-between text-sm font-noto">
                  <span className="text-[#767676]">人数</span>
                  <span className="text-[#1A1A1A] font-medium">{groupSize} 人</span>
                </div>
                <div className="flex justify-between text-sm font-noto">
                  <span className="text-[#767676]">单价</span>
                  <span className="text-[#1A1A1A]">
                    ${rate} / 人
                    <span className="ml-1 text-xs text-[#999999]">
                      （{groupSize >= 3 ? "团体价" : "标准价"}）
                    </span>
                  </span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-2 flex justify-between">
                  <span className="font-noto text-sm text-[#767676]">合计</span>
                  <span className="font-noto text-2xl text-[#E51B23] font-light">${total}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-[#E5E5E5] py-2.5 font-sans-ui text-[11px] tracking-widest uppercase text-[#767676] hover:border-[#999999] transition-colors">
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="flex-1 bg-green-600 text-white py-2.5 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-green-700 transition-colors disabled:opacity-40">
                  {isPending ? "确认中..." : `确认 $${total}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
