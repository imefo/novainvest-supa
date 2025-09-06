"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser, isAdminFast, signOut } from "@/lib/role";

type MiniUser = { id: string; email?: string };

export default function Header() {
  const [user, setUser] = useState<MiniUser | null>(null);
  const [admin, setAdmin] = useState(false);

  // بدون اینکه رندر اصلی را بلوکه کند
  useEffect(() => {
    let alive = true;
    (async () => {
      const u = await getSessionUser();
      if (!alive) return;
      setUser(u ? { id: u.id, email: u.email ?? undefined } : null);
      if (u?.id) {
        // چک ادمین جداگانه و بدون اثر روی رندر
        isAdminFast(u.id).then((ok) => {
          if (alive) setAdmin(!!ok);
        });
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <header className="nv-header">
      <div className="nv-header-inner" dir="rtl">
        <nav className="nv-nav-left">
          <Link className="nv-link" href="/contact">تماس</Link>
          <Link className="nv-link" href="/plans">پلن‌ها</Link>
          <Link className="nv-link" href="/about">درباره</Link>
        </nav>

        <div className="nv-brand">
          <Link href="/" className="nv-brand-link">
            <span className="nv-brand-title">NovaInvest</span>
            <span className="nv-brand-home">🏠</span>
          </Link>
        </div>

        <div className="nv-nav-right">
          {user ? (
            <>
              <Link className="nv-btn" href="/dashboard">داشبورد</Link>
              {admin && <Link className="nv-btn" href="/admin">ادمین</Link>}
              <button
                className="nv-btn"
                onClick={async () => { await signOut(); window.location.replace("/"); }}
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link className="nv-btn nv-btn-primary" href="/login">ورود</Link>
              <Link className="nv-btn" href="/signup">ثبت‌نام</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}