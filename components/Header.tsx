// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSessionUser, isAdminFast } from "@/lib/role";

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<null | { id: string; email?: string }>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const u = await getSessionUser();
        if (!alive) return;
        setUser(u ? { id: u.id, email: u.email || undefined } : null);
        if (u?.id) {
          const ok = await isAdminFast(u.id, 3000);
          if (alive) setAdmin(!!ok);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      const u = sess?.user ?? null;
      setUser(u ? { id: u.id, email: u.email || undefined } : null);
      if (!u) setAdmin(false);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    location.href = "/?v=now";
  };

  return (
    <header className="nv-header" dir="rtl">
      <div className="nv-header-inner">
        <nav className="nv-nav-left">
          <Link className="nv-link" href="/contact">تماس</Link>
          <Link className="nv-link" href="/plans">پلن‌ها</Link>
          <Link className="nv-link" href="/about">درباره</Link>
        </nav>

        <div className="nv-brand">
          <Link className="nv-brand-link" href="/">
            <span className="nv-brand-home" aria-hidden>🏠</span>
            <strong className="nv-brand-title">NovaInvest</strong>
          </Link>
        </div>

        <nav className="nv-nav-right">
          {loading ? null : user ? (
            <>
              <Link className="nv-btn" href="/dashboard">داشبورد</Link>
              {admin && <Link className="nv-btn" href="/admin">ادمین</Link>}
              <button className="nv-btn" onClick={signOut}>خروج</button>
            </>
          ) : (
            <Link className="nv-btn nv-btn-primary" href="/login">ورود / ثبت‌نام</Link>
          )}
        </nav>
      </div>
    </header>
  );
}