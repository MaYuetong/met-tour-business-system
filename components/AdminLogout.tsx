"use client";

import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <button onClick={handleLogout}
      className="text-xs text-white/40 hover:text-white/70 transition-colors font-noto">
      退出登录
    </button>
  );
}
