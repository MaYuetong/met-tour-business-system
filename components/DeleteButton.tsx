"use client";

import { useState } from "react";

type Props = {
  id: string;
  type: "pre-survey" | "post-survey" | "review" | "booking";
  label?: string;
};

export default function DeleteButton({ id, type, label = "删除" }: Props) {
  const [open, setOpen]       = useState(false);
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, code }),
      });
      const data = await res.json();
      if (data.ok) {
        setOpen(false);
        window.location.reload();
      } else {
        setError(data.error ?? "删除失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setCode(""); setError(""); }}
        className="font-sans-ui text-[10px] tracking-widest uppercase text-[#8B7D72] hover:text-red-600 transition-colors px-2 py-1 border border-transparent hover:border-red-200 rounded-sm">
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="bg-white border border-[#E0D5C8] w-full max-w-sm shadow-xl">
            <div className="bg-[#1A1A1A] px-5 py-4">
              <p className="font-sans-ui text-[11px] tracking-[0.2em] text-[#C9A84C] uppercase">确认删除</p>
            </div>
            <div className="p-5 space-y-4">
              <p className="font-noto text-sm text-[#6B5E52] leading-relaxed">
                此操作不可撤销。请输入管理员安全码以继续：
              </p>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                placeholder="安全码"
                autoFocus
                className="w-full border border-[#E0D5C8] px-4 py-3 font-noto text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors"
              />
              {error && <p className="font-noto text-xs text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-[#E0D5C8] py-2.5 font-sans-ui text-[11px] tracking-widest uppercase text-[#8B7D72] hover:border-[#A6192E] transition-colors">
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading || !code}
                  className="flex-1 bg-red-600 text-white py-2.5 font-sans-ui text-[11px] tracking-widest uppercase hover:bg-red-700 transition-colors disabled:opacity-40">
                  {loading ? "删除中..." : "确认删除"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
