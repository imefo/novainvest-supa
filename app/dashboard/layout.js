// app/dashboard/layout.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const NAV = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/dashboard/transactions", label: "تراکنش‌ها" },
  { href: "/dashboard/plans", label: "پلن‌ها" },
  { href: "/dashboard/wallet", label: "واریز" },
  { href: "/dashboard/competition", label: "مسابقه 🎯" },
];

export default function Layout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (alive) setUser(data?.user ?? null);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="dash-wrap">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-inner">
          <Link href="/" className="dash-brand">NovaInvest</Link>

          <nav className="dash-nav">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                      className={`dash-nav-link ${active ? "active" : ""}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="dash-user-box">
            {user ? (
              <>
                <div className="dash-user-email">{user.email}</div>
                <button className="nv-btn" onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}>خروج</button>
              </>
            ) : (
              <Link href="/login" className="nv-btn nv-btn-primary">ورود / ثبت‌نام</Link>
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