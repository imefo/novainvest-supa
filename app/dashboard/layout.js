// app/dashboard/layout.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// آیتم‌های سایدبار؛ «مسابقه» اضافه شد
const NAV = [
  { href: "/dashboard", label: "مرور کلی" },
  { href: "/dashboard/transactions", label: "تراکنش‌ها" },
  { href: "/dashboard/plans", label: "پلن‌ها" },
  { href: "/dashboard/wallet", label: "کیف پول" },
  { href: "/dashboard/competition", label: "مسابقه 🎯" }, // ← جدید
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;
      if (error) return;
      setUser(data?.user ?? null);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="dash-wrap">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-inner">
          <div className="dash-brand">
            <Link href="/" className="nv-brand-link">
              <span className="nv-brand-title">NovaInvest</span>
            </Link>
          </div>

          <nav className="dash-nav">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`dash-nav-link ${active ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="dash-user-box">
            {user ? (
              <div className="dash-user">
                <div className="name">{user.email ?? "کاربر"}</div>
                <form
                  action="#"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                >
                  <button className="nv-btn" type="submit">خروج</button>
                </form>
              </div>
            ) : (
              <Link className="nv-btn nv-btn-primary" href="/login">ورود / ثبت‌نام</Link>
            )}
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <div className="nv-container">
          {children}
        </div>
      </main>
    </div>
  );
}