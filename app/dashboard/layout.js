"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      setEmail(data?.user?.email || "");
    })();
    return () => (alive = false);
  }, []);

  return (
    <div
      className="nv-container"
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: 16,
        alignItems: "start",
      }}
    >
      {/* تنها سایدبار چپ */}
      <aside
        className="nv-card"
        style={{ position: "sticky", top: 84, alignSelf: "start" }}
      >
        <div className="nv-card-title">NovaInvest</div>
        <div className="nv-muted" style={{ marginBottom: 12 }}>
          {email}
        </div>

        <nav className="nv-stack" style={{ display: "grid", gap: 10 }}>
          <Link className="nv-btn w-full" href="/dashboard">داشبورد</Link>
          <Link className="nv-btn w-full" href="/dashboard/transactions">تراکنش‌ها</Link>
          <Link className="nv-btn w-full" href="/plans">پلن‌ها</Link>
          <Link className="nv-btn w-full" href="/deposit">واریز</Link>
          <Link className="nv-btn w-full" href="/logout">خروج</Link>
        </nav>
      </aside>

      {/* محتوای اصلی */}
      <main>{children}</main>
    </div>
  );
}