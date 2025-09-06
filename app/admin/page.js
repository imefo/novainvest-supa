"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSessionUser, isAdminFast } from "@/lib/role";

export default function AdminHome() {
  const router = useRouter();
  const [state, setState] = useState({ phase: "checking", err: "" }); // checking | ok | denied

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await getSessionUser();
        if (!alive) return;

        if (!user) {
          // لاگین نیست → بفرست به /login
          router.replace("/login?next=/admin");
          return;
        }
        const ok = await isAdminFast(user.id);
        if (!alive) return;

        setState({ phase: ok ? "ok" : "denied", err: "" });
      } catch (e) {
        console.error("admin gate error:", e);
        if (alive) setState({ phase: "denied", err: "خطا در بررسی دسترسی" });
      }
    })();
    return () => { alive = false; };
  }, [router]);

  if (state.phase === "checking") {
    return (
      <div className="nv-container" dir="rtl" style={{ paddingTop: 24 }}>
        <div className="card">در حال بررسی دسترسی ادمین…</div>
      </div>
    );
  }

  if (state.phase === "denied") {
    return (
      <div className="nv-container" dir="rtl" style={{ paddingTop: 24 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>دسترسی غیرمجاز</h3>
          <p className="muted">{state.err || "شما دسترسی ادمین ندارید."}</p>
          <Link href="/" className="nv-btn">بازگشت به خانه</Link>
        </div>
      </div>
    );
  }

  // phase === 'ok'
  return (
    <div className="nv-container" dir="rtl" style={{ paddingTop: 24 }}>
      <h2 className="section-title">مدیریت NovaInvest</h2>

      <div className="card" style={{ display:"grid", gap:12 }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          <Link href="/admin/users" className="nv-btn">کاربران</Link>
          <Link href="/admin/plans" className="nv-btn">پلن‌ها</Link>
          <Link href="/admin/transactions" className="nv-btn">تراکنش‌ها</Link>
          <Link href="/admin/kyc" className="nv-btn">احراز هویت</Link>
          <Link href="/dashboard" className="nv-btn">داشبورد کاربر</Link>
        </div>
        <p className="muted" style={{ margin:0 }}>
          از منوهای بالا وارد هر بخش شوید. این صفحه فقط گِیت ادمین است و سعی می‌کند هیچ‌وقت کرش نکند.
        </p>
      </div>
    </div>
  );
}