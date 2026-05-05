"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MetLogo from "@/components/MetLogo";

const TOTAL_STEPS = 5;

const INTERESTS = [
  { id: "architecture",     label: "欧洲建筑与雕塑" },
  { id: "medieval",         label: "中世纪艺术" },
  { id: "renaissance",      label: "文艺复兴（达芬奇、拉斐尔、米开朗基罗）" },
  { id: "baroque",          label: "巴洛克 / 宫廷艺术" },
  { id: "neoclassicism",    label: "新古典主义" },
  { id: "impressionism",    label: "印象派" },
  { id: "europe-new-world", label: "欧洲与新世界" },
];

const KNOWLEDGE_LEVELS = [
  { id: "beginner",     label: "初次接触", desc: "对艺术史完全陌生" },
  { id: "some",         label: "略知一二", desc: "曾参观过博物馆" },
  { id: "familiar",     label: "有所了解", desc: "读过主要流派的相关内容" },
  { id: "professional", label: "专业背景", desc: "学术或专家级别" },
];

const EXPERIENCE_PREFS = [
  { id: "storytelling", label: "故事叙述", desc: "丰富的叙事与人物故事" },
  { id: "structured",   label: "系统知识", desc: "清晰的历史脉络框架" },
  { id: "academic",     label: "学术深度", desc: "详细的艺术史分析" },
  { id: "photo",        label: "轻松随性", desc: "节奏舒缓，可随时拍照" },
];

function PreSurveyForm() {
  const params     = useSearchParams();
  const bookingId  = params.get("bookingId") ?? "";
  const paramName  = params.get("name")      ?? "";

  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);
  const [profileTag, setProfileTag] = useState("");
  const [form, setForm] = useState({
    name: paramName,
    visitDate: "",
    gender: "",
    city: "",
    country: "",
    firstVisit: "",
    knowledgeLevel: "",
    interests: [] as string[],
    experiencePreference: "",
    openQuestion: "",
  });

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleInterest = (id: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter((i) => i !== id) : [...f.interests, id],
    }));

  const canProceed = () => {
    if (step === 1) return !!form.gender;
    if (step === 2) return !!form.knowledgeLevel;
    if (step === 3) return form.interests.length > 0;
    if (step === 4) return !!form.experiencePreference;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/surveys/pre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, bookingId }),
      });
      const data = await res.json();
      setProfileTag(data.profileTag ?? "");
      setDone(true);
    } catch {
      alert("提交失败，请重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const tagLabels: Record<string, string> = {
      academic:          "学术探索者",
      storytelling:      "故事追寻者",
      "photo-type":      "视觉漫游者",
      beginner:          "好奇的新访客",
      "curious-learner": "求知探索者",
    };

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-[#A6192E]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <Link href="/" className="text-white">
              <MetLogo className="h-8 w-auto text-white" />
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 bg-[#A6192E] flex items-center justify-center mx-auto mb-8">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex items-center gap-3 justify-center mb-4">
              <div className="w-6 h-px bg-[#C9A84C]" />
              <p className="font-sans-ui text-[10px] tracking-[0.25em] uppercase text-[#C9A84C]">参观前问卷</p>
              <div className="w-6 h-px bg-[#C9A84C]" />
            </div>
            <h2 className="font-noto text-3xl text-[#1A1A1A] font-[300] mb-4">个人画像已生成</h2>
            {profileTag && (
              <div className="inline-block bg-[#A6192E] px-8 py-4 mb-6">
                <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-white/60 mb-1">您的导览风格</p>
                <p className="font-noto text-white text-xl font-[300]">{tagLabels[profileTag] ?? profileTag}</p>
              </div>
            )}
            <p className="font-noto text-[#6B5E52] text-base leading-relaxed mb-8">
              我们已记录您的偏好。导览将根据您的兴趣量身定制。
            </p>
            <div className="w-10 h-px bg-[#C9A84C] mx-auto mb-8" />
            <Link href="/" className="font-sans-ui text-[11px] text-[#A6192E] tracking-wider hover:underline">
              ← 返回首页
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const stepTitles = ["欢迎来到大都会", "您的艺术知识背景", "您的兴趣方向", "您的理想体验方式", "最后一个问题"];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Red Met header */}
      <header className="bg-[#A6192E] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <MetLogo className="h-8 w-auto text-white" />
            <p className="font-noto text-[8px] tracking-[0.2em] uppercase text-white/60 pb-0.5 leading-tight hidden sm:block">欧洲艺术史导览</p>
          </Link>
          <span className="font-sans-ui text-[11px] text-white/70 tracking-wider">{step} / {TOTAL_STEPS}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-[#F8F5F0] border-b border-[#E0D5C8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <p className="font-sans-ui text-[10px] tracking-[0.2em] uppercase text-[#C9A84C] mb-2">参观前问卷</p>
          <div className="w-full bg-[#E0D5C8] h-1">
            <div className="bg-[#A6192E] h-1 transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 pb-32 md:pb-12">
        <div className="mb-8">
          <h1 className="font-noto text-3xl sm:text-4xl text-[#1A1A1A] font-[300]">{stepTitles[step - 1]}</h1>
        </div>

        <div key={step} className="step-transition">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block font-noto text-xs text-[#8B7D72] mb-3">您的姓名（选填）</label>
                <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
                  placeholder="例如：李雷"
                  className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
              </div>
              <div>
                <label className="block font-noto text-xs text-[#8B7D72] mb-3">参观日期（选填）</label>
                <input type="date" value={form.visitDate} onChange={(e) => setField("visitDate", e.target.value)}
                  className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors" />
              </div>
              <div>
                <p className="font-noto text-xs text-[#8B7D72] mb-3">性别 <span className="text-[#A6192E]">*</span></p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[{ id: "male", label: "男" }, { id: "female", label: "女" }].map((opt) => (
                    <button key={opt.id} onClick={() => setField("gender", opt.id)}
                      className={`py-3 border rounded-sm font-noto text-sm transition-all duration-200 ${form.gender === opt.id ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"}`}>
                      {opt.label}
                    </button>
                  ))}
                  <button onClick={() => setField("gender", "undisclosed")}
                    className={`col-span-2 sm:col-span-1 py-3 border rounded-sm font-noto text-sm transition-all duration-200 ${form.gender === "undisclosed" ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"}`}>
                    不便透露
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-noto text-xs text-[#8B7D72] mb-3">来自城市（选填）</label>
                  <input type="text" value={form.city} onChange={(e) => setField("city", e.target.value)}
                    placeholder="例如：上海"
                    className="w-full bg-white border border-[#E0D5C8] rounded-sm px-4 py-3 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
                </div>
                <div>
                  <label className="block font-noto text-xs text-[#8B7D72] mb-3">来自国家（选填）</label>
                  <input type="text" value={form.country} onChange={(e) => setField("country", e.target.value)}
                    placeholder="例如：中国"
                    className="w-full bg-white border border-[#E0D5C8] rounded-sm px-4 py-3 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors" />
                </div>
              </div>
              <div>
                <p className="font-noto text-xs text-[#8B7D72] mb-5">这是您第一次参观大都会艺术博物馆吗？</p>
                <div className="grid grid-cols-2 gap-4">
                  {[{ id: "yes", label: "是，第一次" }, { id: "no", label: "来过" }].map((opt) => (
                    <button key={opt.id} onClick={() => setField("firstVisit", opt.id)}
                      className={`py-5 px-6 border rounded-sm font-noto text-base transition-all duration-200 ${form.firstVisit === opt.id ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="font-sans-ui text-[10px] text-[#B0A49A] leading-relaxed tracking-wide border-t border-[#E0D5C8] pt-4">
                本次问卷调查所收集的信息仅用于提升导览体验质量及学术研究用途，所有数据严格保密，不作任何商业用途。
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[#8B7D72] font-noto mb-6 leading-relaxed text-sm">没有对错之分，这有助于我们调整导览的深度与重点。</p>
              {KNOWLEDGE_LEVELS.map((opt) => (
                <button key={opt.id} onClick={() => setField("knowledgeLevel", opt.id)}
                  className={`w-full text-left border rounded-sm p-6 transition-all duration-200 ${form.knowledgeLevel === opt.id ? "border-[#A6192E] bg-white shadow-sm" : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" className="met-radio" readOnly checked={form.knowledgeLevel === opt.id} />
                    <div>
                      <div className="font-noto text-[#1A1A1A]">{opt.label}</div>
                      <div className="text-sm text-[#8B7D72] font-noto mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-[#8B7D72] font-noto mb-6 leading-relaxed text-sm">可多选。导览将重点介绍您感兴趣的领域。</p>
              <div className="space-y-3">
                {INTERESTS.map((opt) => (
                  <button key={opt.id} onClick={() => toggleInterest(opt.id)}
                    className={`w-full text-left border rounded-sm p-5 transition-all duration-200 ${form.interests.includes(opt.id) ? "border-[#A6192E] bg-white shadow-sm" : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"}`}>
                    <div className="flex items-center gap-4">
                      <input type="checkbox" className="met-checkbox" readOnly checked={form.interests.includes(opt.id)} />
                      <span className="font-noto text-[#1A1A1A]">{opt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-[#8B7D72] font-noto mb-6 leading-relaxed text-sm">您希望以何种方式体验艺术？</p>
              {EXPERIENCE_PREFS.map((opt) => (
                <button key={opt.id} onClick={() => setField("experiencePreference", opt.id)}
                  className={`w-full text-left border rounded-sm p-6 transition-all duration-200 ${form.experiencePreference === opt.id ? "border-[#A6192E] bg-white shadow-sm" : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" className="met-radio" readOnly checked={form.experiencePreference === opt.id} />
                    <div>
                      <div className="font-noto text-[#1A1A1A]">{opt.label}</div>
                      <div className="text-sm text-[#8B7D72] font-noto mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div>
              <p className="text-[#8B7D72] font-noto mb-6 leading-relaxed">
                今天您最希望看到或理解什么？
              </p>
              <textarea value={form.openQuestion} onChange={(e) => setField("openQuestion", e.target.value)}
                placeholder="某件特定的作品、与艺术的个人情缘、某段历史时期……"
                rows={6}
                className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-noto text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none leading-relaxed" />
              <p className="text-xs text-[#8B7D72] font-noto mt-3">选填——但我们非常感谢您的分享。</p>
            </div>
          )}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center justify-between mt-12 pt-8 border-t border-[#E0D5C8]">
          {step > 1 ? (
            <button onClick={() => setStep((s) => s - 1)}
              className="font-sans-ui text-sm text-[#8B7D72] hover:text-[#1A1A1A] transition-colors tracking-wide flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              上一步
            </button>
          ) : <div />}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
              className={`px-10 py-4 font-sans-ui text-sm tracking-widest uppercase transition-all ${canProceed() ? "bg-[#A6192E] text-white hover:bg-[#8B1525]" : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"}`}>
              下一步 →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-10 py-4 bg-[#A6192E] text-white font-sans-ui text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-colors disabled:opacity-60">
              {submitting ? "保存中..." : "提交问卷"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E0D5C8] p-4">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)}
              className="flex-shrink-0 w-12 h-12 border border-[#E0D5C8] flex items-center justify-center text-[#8B7D72]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
              className={`flex-1 h-12 font-sans-ui text-sm tracking-widest uppercase transition-all ${canProceed() ? "bg-[#A6192E] text-white" : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"}`}>
              下一步 →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 h-12 bg-[#A6192E] text-white font-sans-ui text-sm tracking-widest uppercase disabled:opacity-60">
              {submitting ? "保存中..." : "提交问卷"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PreSurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#A6192E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-sans-ui text-[11px] tracking-widest text-[#8B7D72] uppercase">加载中</p>
        </div>
      </div>
    }>
      <PreSurveyForm />
    </Suspense>
  );
}
