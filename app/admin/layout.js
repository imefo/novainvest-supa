"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      // اگر پاسخ دیر شد، از گیرکردن جلوگیری کن
      if (alive && loading) {
        setErr("بررسی دسترسی طولانی شد. لطفاً دوباره تلاش کنید.");
        setLoading(false);
      }
    }, 6000);

    (async () => {
      try {
        setErr("");
        // 1) گرفتن سشن
        const { data: { user }, error: sErr } = await supabase.auth.getUser();
        if (sErr) throw sErr;
        if (!user?.id) {
          if (!alive) return;
          // لاگین نیست → بفرست صفحه ورود
          window.location.replace("/login");
          return;
        }

        // 2) چک سریع ادمین (بدون آرگومان اضافه)
        const ok = await isAdminFast(user.id);
        if (!alive) return;
        if (ok) {
          setAllowed(true);
        } else {
          // دسترسی ادمین ندارد → بفرست داشبورد
          window.location.replace("/dashboard?na=1");
          return;
        }
      } catch (e) {
        if (!alive) return;
        setErr("خطا در بررسی دسترسی ادمین.");
      } finally {
        if (alive) setLoading(false);
        clearTimeout(timer);
      }
    })();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <main dir="rtl" className="nv-container" style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        <div className="glass-card" style={{ padding: 16, minWidth: 260, textAlign: "center" }}>
          در حال بررسی دسترسی ادمین…
        </div>
      </main>
    );
  }

  if (err && !allowed) {
    return (
      <main dir="rtl" className="nv-container" style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        <div className="glass-card" style={{ padding: 16, minWidth: 280 }}>
          <strong>خطا</strong>
          <div style={{ marginTop: 8 }}>{err}</div>
          <button
            className="nv-btn"
            style={{ marginTop: 12, width: "100%" }}
            onClick={() => window.location.reload()}
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  // ادمین تایید شد
  return <>{children}</>;
}