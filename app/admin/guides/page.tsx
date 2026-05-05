"use client";

import { useState, useEffect, useCallback } from "react";

type Guide = {
  id: string;
  name: string;
  wechatId: string;
  email?: string;
  isActive: boolean;
  availableDates: string[];
  createdAt: string;
};

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newGuide, setNewGuide] = useState({ name: "", wechatId: "", email: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/guides");
    const data = await res.json();
    setGuides(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = useCallback(async (id: string, body: object) => {
    await fetch(`/api/guides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
  }, [load]);

  const addDate = async (guide: Guide) => {
    const date = dateInputs[guide.id];
    if (!date || guide.availableDates.includes(date)) return;
    await patch(guide.id, { availableDates: [...guide.availableDates, date].sort() });
    setDateInputs((p) => ({ ...p, [guide.id]: "" }));
  };

  const removeDate = async (guide: Guide, date: string) => {
    await patch(guide.id, { availableDates: guide.availableDates.filter((d) => d !== date) });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除该讲解员？")) return;
    await fetch(`/api/guides/${id}`, { method: "DELETE" });
    await load();
  };

  const handleAddGuide = async () => {
    if (!newGuide.name || !newGuide.wechatId) return;
    setSaving(true);
    await fetch("/api/guides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newGuide, isActive: true, availableDates: [] }),
    });
    setNewGuide({ name: "", wechatId: "", email: "" });
    setShowAdd(false);
    setSaving(false);
    await load();
  };

  if (loading) return <p className="font-noto text-[#8B7D72]">加载中…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-noto text-2xl text-[#1A1A1A] font-light">讲解员管理</h1>
          <p className="font-noto text-sm text-[#8B7D72] mt-1">
            管理讲解员信息及可兼职日期。预约日期匹配时自动分配对应讲解员，无匹配则默认分配第一位在岗讲解员。
          </p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)}
          className="bg-[#A6192E] text-white px-5 py-2.5 font-noto text-sm hover:bg-[#8B1525] transition-colors flex-shrink-0">
          + 添加讲解员
        </button>
      </div>

      {/* Add guide form */}
      {showAdd && (
        <div className="bg-white border border-[#A6192E]/30 p-6 mb-6">
          <h3 className="font-noto text-[#1A1A1A] mb-5">新讲解员信息</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block font-noto text-xs text-[#8B7D72] mb-2">姓名 *</label>
              <input value={newGuide.name}
                onChange={(e) => setNewGuide((p) => ({ ...p, name: e.target.value }))}
                placeholder="例如：小明"
                className="w-full border border-[#E0D5C8] px-3 py-2.5 font-noto text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors" />
            </div>
            <div>
              <label className="block font-noto text-xs text-[#8B7D72] mb-2">微信号 *</label>
              <input value={newGuide.wechatId}
                onChange={(e) => setNewGuide((p) => ({ ...p, wechatId: e.target.value }))}
                placeholder="例如：wechat_id_123"
                className="w-full border border-[#E0D5C8] px-3 py-2.5 font-noto text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors" />
            </div>
            <div>
              <label className="block font-noto text-xs text-[#8B7D72] mb-2">邮箱（选填）</label>
              <input value={newGuide.email}
                onChange={(e) => setNewGuide((p) => ({ ...p, email: e.target.value }))}
                placeholder="guide@example.com"
                className="w-full border border-[#E0D5C8] px-3 py-2.5 font-noto text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddGuide} disabled={saving || !newGuide.name || !newGuide.wechatId}
              className="bg-[#A6192E] text-white px-6 py-2 font-noto text-sm hover:bg-[#8B1525] transition-colors disabled:opacity-50">
              {saving ? "保存中…" : "保存"}
            </button>
            <button onClick={() => { setShowAdd(false); setNewGuide({ name: "", wechatId: "", email: "" }); }}
              className="border border-[#E0D5C8] px-6 py-2 font-noto text-sm text-[#8B7D72] hover:border-[#A6192E] transition-colors">
              取消
            </button>
          </div>
        </div>
      )}

      {/* Guide list */}
      {guides.length === 0 ? (
        <div className="bg-white border border-[#E0D5C8] p-8 text-center">
          <p className="font-noto text-[#8B7D72]">暂无讲解员。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-white border border-[#E0D5C8]">
              {/* Guide row */}
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 bg-[#A6192E] flex items-center justify-center flex-shrink-0">
                  <span className="font-noto text-white text-sm font-medium">{guide.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-noto text-[#1A1A1A]">{guide.name}</p>
                  <p className="font-noto text-sm text-[#8B7D72]">
                    微信：{guide.wechatId}
                    {guide.email && <span> · {guide.email}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <span className={`text-xs px-2 py-1 font-noto border ${guide.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-[#F8F5F0] text-[#8B7D72] border-[#E0D5C8]"}`}>
                    {guide.isActive ? "在岗" : "暂停"}
                  </span>
                  <span className="text-xs font-noto text-[#8B7D72] border border-[#E0D5C8] px-2 py-1">
                    {guide.availableDates.length} 个日期
                  </span>
                  <button onClick={() => setExpandedId(expandedId === guide.id ? null : guide.id)}
                    className="font-noto text-xs text-[#A6192E] border border-[#A6192E]/30 px-3 py-1 hover:bg-[#A6192E]/5 transition-colors">
                    {expandedId === guide.id ? "收起 ↑" : "管理日期 ↓"}
                  </button>
                  <button onClick={() => patch(guide.id, { isActive: !guide.isActive })}
                    className="font-noto text-xs text-[#8B7D72] border border-[#E0D5C8] px-3 py-1 hover:border-[#A6192E] hover:text-[#A6192E] transition-colors">
                    {guide.isActive ? "暂停" : "启用"}
                  </button>
                  {guides.length > 1 && (
                    <button onClick={() => handleDelete(guide.id)}
                      className="font-noto text-xs text-red-500 border border-red-200 px-3 py-1 hover:bg-red-50 transition-colors">
                      删除
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded date panel */}
              {expandedId === guide.id && (
                <div className="border-t border-[#E0D5C8] p-5 bg-[#F8F5F0]">
                  <p className="font-noto text-xs text-[#8B7D72] mb-4">
                    设置可兼职日期。预约日期与此列表匹配时，客户邮件将显示该讲解员的微信号。
                    未设置日期的讲解员将作为默认兜底。
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="overflow-hidden border border-[#E0D5C8] bg-white focus-within:border-[#A6192E] transition-colors">
                      <input type="date"
                        value={dateInputs[guide.id] ?? ""}
                        onChange={(e) => setDateInputs((p) => ({ ...p, [guide.id]: e.target.value }))}
                        className="bg-transparent px-3 py-2.5 font-noto text-sm text-[#1A1A1A] focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
                    </div>
                    <button onClick={() => addDate(guide)} disabled={!dateInputs[guide.id]}
                      className="bg-[#A6192E] text-white px-4 py-2.5 font-noto text-xs hover:bg-[#8B1525] transition-colors disabled:opacity-40">
                      添加日期
                    </button>
                  </div>
                  {guide.availableDates.length === 0 ? (
                    <p className="font-noto text-xs text-[#B0A49A] italic">暂未设置日期——该讲解员将匹配所有未指定日期的预约。</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {guide.availableDates.map((d) => (
                        <div key={d} className="flex items-center gap-1.5 bg-white border border-[#E0D5C8] px-3 py-1.5">
                          <span className="font-noto text-sm text-[#1A1A1A]">{d}</span>
                          <button onClick={() => removeDate(guide, d)}
                            className="text-[#8B7D72] hover:text-[#A6192E] transition-colors text-xl leading-none ml-1">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-[#F8F5F0] border border-[#E0D5C8] p-5">
        <p className="font-noto text-xs text-[#8B7D72] leading-relaxed">
          <strong className="text-[#1A1A1A]">匹配规则：</strong>
          客户预约时，系统优先匹配可用日期中含预约日期的讲解员。若无匹配，则自动分配第一位在岗讲解员（当前为 {guides.find((g) => g.isActive)?.name ?? "—"}）。
        </p>
      </div>
    </div>
  );
}
