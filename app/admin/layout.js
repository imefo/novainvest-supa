"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionUser, isAdminFast } from "@/lib/role";

export default function AdminLayout({ children }) {
  const [state, setState] = useState({ checking: true, allowed: false });

  useEffect(() => {
    let alive = true;
    const guard = async () => {
      // حداکثر 5 ثانیه صبر؛ بعد از اون هم از حالت لود خارج شو
      const safety = setTimeout(() => {
        if (alive) setState((s) => ({ ...s, checking: false }));
      }, 5000);

      const u = await getSessionUser();
      if (!alive) return;

      if (!u?.id) {
        clearTimeout(safety);
        // کاربر لاگین نیست
        window.location.replace("/login?next=/admin");
        return;
      }
      const ok = await isAdminFast(u.id);
      if (!alive) return;

      clearTimeout(safety);
      if (ok) setState({ checking: false, allowed: true });
      else {
        // لاگین هست ولی ادمین نیست
        window.location.replace("/dashboard");
      }
    };

    guard();
    return () => { alive = false; };
  }, []);

  if (state.checking) {
    return (
      <main dir="rtl" className="nv-container" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div className="glass-card" style={{ padding: 16 }}>در حال بررسی دسترسی ادمین…</div>
      </main>
    );
  }

  if (!state.allowed) {
    // اگر به هر دلیل ریدایرکت نشد، پیام می‌ده که کاربر گیر نکند
    return (
      <main dir="rtl" className="nv-container" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ marginBottom: 8 }}>اجازهٔ دسترسی به بخش ادمین ندارید.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/dashboard" className="nv-btn">داشبورد</Link>
            <Link href="/" className="nv-btn">صفحهٔ اصلی</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div dir="rtl" className="nv-container">
      {children}
    </div>
  );
}