"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionUser } from "@/lib/role";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [u, setU] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const user = await getSessionUser();
      if (!alive) return;
      if (!user?.id) {
        window.location.replace("/login?next=/dashboard");
        return;
      }
      setU(user);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <main dir="rtl" className="nv-container" style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        <div className="glass-card" style={{ padding: 16 }}>در حال بارگذاری داشبورد…</div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="nv-container">
      <h1 style={{ margin: "8px 0 16px" }}>داشبورد</h1>
      <div className="features-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="card">
          <h3>کاربران</h3>
          <p className="muted">مدیریت کاربران و وضعیت‌ها.</p>
          <Link href="/dashboard/users" className="nv-btn" style={{ marginTop: 8 }}>مشاهده</Link>
        </div>
        <div className="card">
          <h3>تراکنش‌ها</h3>
          <p className="muted">واریز و برداشت‌های شما.</p>
          <Link href="/dashboard/transactions" className="nv-btn" style={{ marginTop: 8 }}>مشاهده</Link>
        </div>
        <div className="card">
          <h3>پلن‌ها</h3>
          <p className="muted">پلن‌های فعال و خرید پلن.</p>
          <Link href="/plans/" className="nv-btn" style={{ marginTop: 8 }}>رفتن به پلن‌ها</Link>
        </div>
      </div>
    </main>
  );
}