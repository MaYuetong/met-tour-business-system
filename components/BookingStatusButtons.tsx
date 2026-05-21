"use client";

import { useState, useTransition } from "react";
import { confirmWithAmount, updateStatus, updateDateTime, cancelBooking } from "@/app/actions/update-status";

type Status = "pending" | "confirmed" | "completed" | "cancelled";

type Props = {
  id: string;
  status: Status;
  groupSize?: number;
  tourDate?: string;
  timeSlot?: string;
};

const RATE_SMALL = 86;
const RATE_GROUP = 75;

function calcAmount(groupSize: number) {
  const rate = groupSize >= 3 ? RATE_GROUP : RATE_SMALL;
  return { rate, total: rate * groupSize };
}

export default function BookingStatusButtons({ id, status, groupSize = 1, tourDate, timeSlot }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm]   = useState(false);
  const [confirmSend, setConfirmSend]   = useState(false); // default OFF for confirm
  const [showCancel, setShowCancel]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [newDate, setNewDate]           = useState(tourDate ?? "");
  const [newSlot, setNewSlot]           = useState(timeSlot ?? "");
  const [editDone, setEditDone]         = useState(false);
  const [editSize, setEditSize]         = useState(groupSize);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSend, setCancelSend]     = useState(true);

  const { rate, total } = calcAmount(editSize);
  const [finalAmount, setFinalAmount]   = useState(total);

  // Keep finalAmount in sync when editSize changes (unless user has manually edited it)
  const [amountEdited, setAmountEdited] = useState(false);
  const displayTotal = amountEdited ? finalAmount : total;

  const handleConfirm = () => {
    startTransition(async () => {
      await confirmWithAmount(id, displayTotal, editSize, confirmSend);
      setShowConfirm(false);
    });
  };

  const handleStatus = (next: Status) => {
    startTransition(async () => { await updateStatus(id, next); });
  };

  const handleCancel = () => {
    startTransition(async () => {
      await cancelBooking(id, cancelSend, cancelReason || undefined);
      setShowCancel(false);
    });
  };

  const handleDateSave = () => {
    if (!newDate) return;
    startTransition(async () => {
      await updateDateTime(id, newDate, newSlot);
      setEditDone(true);
      setTimeout(() => { setShowEdit(false); setEditDone(false); }, 1200);
    });
  };

  const TIME_SLOTS = ["上午 10:00", "下午 13:00", "下午 15:00", "其他"];

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {/* Edit date — always available */}
        <button
          onClick={() => { setNewDate(tourDate ?? ""); setNewSlot(timeSlot ?? ""); setShowEdit(true); }}
          disabled={isPending}
          className="font-sans-ui text-[10px] tracking-widest uppercase border border-[#E5E5E5] text-[#767676] px-3 py-1.5 hover:border-[#E51B23] hover:text-[#E51B23] transition-colors disabled:opacity-40">
          修改时间
        </button>

        {status === "pending" && (
          <>
            <button onClick={() => setShowConfirm(true)} disabled={isPending}
              className="font-sans-ui text-[10px] tracking-widest uppercase bg-green-600 text-white px-3 py-1.5 hover:bg-green-700 transition-colors disabled:opacity-40">
              确认预约
            </button>
            <button onClick={() => { setCancelReason(""); setCancelSend(true); setShowCancel(true); }} disabled={isPending}
              className="font-sans-ui text-[10px] tracking-widest uppercase border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-40">
              取消
            </button>
          </>
        )}
        {status === "confirmed" && (
          <>
            <button onClick={() => handleStatus("completed")} disabled={isPending}
              className="font-sans-ui text-[10px] tracking-widest uppercase bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 transition-colors disabled:opacity-40">
              标记完成
            </button>
            <button onClick={() => { setCancelReason(""); setCancelSend(true); setShowCancel(true); }} disabled={isPending}
              className="font-sans-ui text-[10px] tracking-widest uppercase border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-40">
              取消
            </button>
          </>
        )}
        {status === "cancelled" && (
          <button onClick={() => handleStatus("pending")} disabled={isPending}
            className="font-sans-ui text-[10px] tracking-widest uppercase border border-[#E5E5E5] text-[#767676] px-3 py-1.5 hover:border-green-400 hover:text-green-700 transition-colors disabled:opacity-40">
            恢复预约
          </button>
        )}
      </div>

      {/* ── Confirm modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}>
          <div className="bg-white border border-[#E5E5E5] w-full max-w-sm">
            <div className="bg-[#1A1A1A] px-5 py-4">
              <p className="font-sans-ui text-[11px] tracking-[0.2em] text-white/50 uppercase">确认预约</p>
              <p className="font-noto text-white mt-0.5">不发送邮件给客人</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#F5F5F5] px-4 py-4 space-y-3">
                {/* Editable group size */}
                <div className="flex items-center justify-between">
                  <span className="font-noto text-sm text-[#767676]">人数</span>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => { setEditSize((n) => Math.max(1, n - 1)); setAmountEdited(false); }}
                      className="w-8 h-8 border border-[#E5E5E5] bg-white text-[#444444] font-noto text-lg hover:border-[#E51B23] hover:text-[#E51B23] transition-colors flex items-center justify-center">
                      −
                    </button>
                    <span className="font-noto text-xl text-[#1A1A1A] w-6 text-center">{editSize}</span>
                    <button type="button"
                      onClick={() => { setEditSize((n) => Math.min(12, n + 1)); setAmountEdited(false); }}
                      className="w-8 h-8 border border-[#E5E5E5] bg-white text-[#444444] font-noto text-lg hover:border-[#E51B23] hover:text-[#E51B23] transition-colors flex items-center justify-center">
                      +
                    </button>
                    <span className="font-noto text-sm text-[#999999]">人</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-noto border-t border-[#E5E5E5] pt-2">
                  <span className="text-[#767676]">单价</span>
                  <span className="text-[#1A1A1A]">${rate}/人 <span className="text-xs text-[#999999]">({editSize >= 3 ? "团体价" : "标准价"})</span></span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-2">
                  <div>
                    <span className="font-noto text-sm text-[#767676]">实收金额</span>
                    {amountEdited && displayTotal !== total && (
                      <span className="font-sans-ui text-[9px] text-[#E51B23] ml-2 tracking-wide">
                        已调整（原 ${total}）
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-noto text-xl text-[#E51B23]">$</span>
                    <input
                      type="number"
                      min={0}
                      value={displayTotal}
                      onChange={(e) => { setFinalAmount(Number(e.target.value)); setAmountEdited(true); }}
                      className="w-20 text-right font-noto text-2xl text-[#E51B23] font-light bg-transparent border-b border-[#E5E5E5] focus:border-[#E51B23] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              {/* Send email toggle */}
              <div className="flex items-center justify-between py-1 border-t border-[#F0F0F0] pt-3">
                <div>
                  <p className="font-noto text-sm text-[#1A1A1A]">发送确认邮件给客人</p>
                  <p className="font-sans-ui text-[10px] text-[#999999] tracking-wide mt-0.5">包含预约详情和导游微信</p>
                </div>
                <button type="button" onClick={() => setConfirmSend((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${confirmSend ? "bg-green-600" : "bg-[#E5E5E5]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${confirmSend ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)}
                  className="flex-1 border border-[#E5E5E5] py-3 font-sans-ui text-[11px] tracking-widest uppercase text-[#767676] hover:border-[#999999] transition-colors">
                  取消
                </button>
                <button onClick={handleConfirm} disabled={isPending}
                  className="flex-1 bg-green-600 text-white py-3 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-green-700 transition-colors disabled:opacity-40">
                  {isPending ? "确认中…" : confirmSend ? `确认并发邮件 $${displayTotal}` : `确认 $${displayTotal}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel modal ── */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCancel(false); }}>
          <div className="bg-white border border-[#E5E5E5] w-full max-w-sm">
            <div className="bg-[#1A1A1A] px-5 py-4">
              <p className="font-sans-ui text-[11px] tracking-[0.2em] text-white/50 uppercase">取消预约</p>
              <p className="font-noto text-white mt-0.5">确认后无法撤销</p>
            </div>
            <div className="p-5 space-y-4">

              {/* Send email toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-noto text-sm text-[#1A1A1A]">通知客人</p>
                  <p className="font-sans-ui text-[10px] text-[#999999] tracking-wide mt-0.5">发送取消通知邮件给客人</p>
                </div>
                <button type="button" onClick={() => setCancelSend((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${cancelSend ? "bg-[#E51B23]" : "bg-[#E5E5E5]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${cancelSend ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              {/* Reason (only shown if sending email) */}
              {cancelSend && (
                <div>
                  <label className="block font-sans-ui text-[10px] tracking-widest uppercase text-[#999999] mb-2">
                    取消原因（选填，将发送给客人）
                  </label>
                  <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="如：时间冲突，建议重新预约另一日期…"
                    rows={3}
                    className="w-full border border-[#E5E5E5] px-4 py-3 font-noto text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#E51B23] transition-colors resize-none" />
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCancel(false)}
                  className="flex-1 border border-[#E5E5E5] py-3 font-sans-ui text-[11px] tracking-widest uppercase text-[#767676] hover:border-[#999999] transition-colors">
                  返回
                </button>
                <button onClick={handleCancel} disabled={isPending}
                  className="flex-1 bg-red-600 text-white py-3 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-red-700 transition-colors disabled:opacity-40">
                  {isPending ? "处理中…" : cancelSend ? "取消并发邮件" : "仅取消"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit date/time modal ── */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEdit(false); }}>
          <div className="bg-white border border-[#E5E5E5] w-full max-w-sm">
            <div className="bg-[#1A1A1A] px-5 py-4">
              <p className="font-sans-ui text-[11px] tracking-[0.2em] text-white/50 uppercase">修改导览时间</p>
              <p className="font-noto text-white mt-0.5">保存后自动发邮件通知客人</p>
            </div>
            <div className="p-5 space-y-4">

              {/* Date picker */}
              <div>
                <label className="block font-sans-ui text-[10px] tracking-widest uppercase text-[#999999] mb-2">
                  新参观日期
                </label>
                <div className="overflow-hidden border border-[#E5E5E5] focus-within:border-[#E51B23] transition-colors">
                  <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                    min="2026-05-09"
                    className="w-full bg-white px-4 py-3 font-noto text-[#1A1A1A] text-sm focus:outline-none" />
                </div>
              </div>

              {/* Time slot */}
              <div>
                <label className="block font-sans-ui text-[10px] tracking-widest uppercase text-[#999999] mb-2">
                  时间段（选填）
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {TIME_SLOTS.map((s) => (
                    <button key={s} type="button"
                      onClick={() => setNewSlot(s === "其他" ? "" : s)}
                      className={`py-2.5 px-3 border font-noto text-sm transition-colors ${newSlot === s ? "border-[#E51B23] bg-[#E51B23] text-white" : "border-[#E5E5E5] text-[#444444] hover:border-[#E51B23]"}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <input type="text" value={newSlot} onChange={(e) => setNewSlot(e.target.value)}
                  placeholder="或手动输入，如 下午 14:30"
                  className="w-full border border-[#E5E5E5] px-4 py-2.5 font-noto text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#E51B23] transition-colors" />
              </div>

              {editDone && (
                <p className="font-noto text-sm text-green-600 text-center">✓ 已更新，邮件已发送</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowEdit(false)}
                  className="flex-1 border border-[#E5E5E5] py-3 font-sans-ui text-[11px] tracking-widest uppercase text-[#767676] hover:border-[#999999] transition-colors">
                  取消
                </button>
                <button onClick={handleDateSave} disabled={isPending || !newDate}
                  className="flex-1 bg-[#E51B23] text-white py-3 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-[#C01018] transition-colors disabled:opacity-40">
                  {isPending ? "保存中…" : "保存并通知"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
