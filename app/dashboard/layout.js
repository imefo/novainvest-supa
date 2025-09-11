"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!alive) return;
      if (!user) {
        router.replace("/login");
      } else {
        setEmail(user.email || "");
      }
    })();
    return () => { alive = false; };
  }, [router]);

  const links = [
    { href: "/dashboard/profile", label: "پروفایل" },
    { href: "/dashboard", label: "داشبورد" },
    { href: "/dashboard/transactions", label: "تراکنش‌ها" },
    { href: "/plans", label: "پلن‌ها" },
    { href: "/dashboard/wallet", label: "واریز/برداشت" },
    { href: "/dashboard/contest", label: "مسابقه" },
    { href: "/dashboard/tickets", label: "تیکت‌ها / پشتیبانی" },
  ];

  const isActive = (href) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <div className="nv-shell">
      {/* Topbar */}
      <div className="nv-topbar">
        <div className="nv-top-left">
          <Link href="/" className="nv-brand">
            <span className="nv-emoji">🏠</span>
            <span className="nv-title">NovalInvest</span>
          </Link>
          <Link href="/admin" className="nv-top-btn">ادمین</Link>
          <Link href="/dashboard" className="nv-top-btn">داشبورد</Link>
        </div>
        <div className="nv-top-right">
          <span className="nv-user">{email}</span>
          <button className="nv-top-btn danger" onClick={signOut}>خروج</button>
        </div>
      </div>

      {/* Body */}
      <div className="nv-body">
        {/* Sidebar */}
        <aside className="nv-sidebar">
          <div className="nv-side-card">
            <div className="nv-side-brand">NovalInvest</div>
            <div className="nv-side-email">{email}</div>
          </div>

          <nav className="nv-side-nav">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nv-side-link ${isActive(l.href) ? "active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <button className="nv-side-exit" onClick={signOut}>خروج</button>
        </aside>

        {/* Main content */}
        <main className="nv-main">{children}</main>
      </div>
    </div>
  );
}