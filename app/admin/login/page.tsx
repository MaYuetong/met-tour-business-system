"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MetLogo from "@/components/MetLogo";

function LoginForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const from        = params.get("from") ?? "/admin";

  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(from);
      } else {
        setError(data.error ?? "用户名或密码错误");
        setLoading(false);
      }
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <MetLogo className="h-12 w-auto text-[#A6192E]" />
        </div>
        <div className="bg-white border border-[#E0D5C8]">
          <div className="bg-[#1A1A1A] px-6 py-4">
            <p className="font-noto text-[11px] tracking-[0.2em] text-[#C9A84C] uppercase">后台管理</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-2">用户名</label>
              <input
                type="text" required autoComplete="username"
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-[#E0D5C8] px-4 py-3 font-noto text-base text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors" />
            </div>
            <div>
              <label className="block font-sans-ui text-[11px] tracking-wider text-[#8B7D72] uppercase mb-2">密码</label>
              <input
                type="password" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#E0D5C8] px-4 py-3 font-noto text-base text-[#1A1A1A] focus:outline-none focus:border-[#A6192E] transition-colors" />
            </div>
            {error && <p className="font-noto text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#A6192E] text-white py-3 font-sans-ui text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-colors disabled:opacity-50">
              {loading ? "验证中..." : "登录"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F5F0]" />}>
      <LoginForm />
    </Suspense>
  );
}
