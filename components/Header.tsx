// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdmin as checkIsAdmin } from "@/lib/role";

type U = { id: string; email?: string | null } | null;

export default function Header() {
  const [user, setUser] = useState<U>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let sub: ReturnType<typeof supabase.auth.onAuthStateChange> | null = null;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;
      setUser(u ? { id: u.id, email: u.email } : null);
      if (u) setAdmin(await checkIsAdmin(u.id));
    };
    init();

    sub = supabase.auth.onAuthStateChange((_e, s) => {
      const u = s?.user ?? null;
      setUser(u ? { id: u.id, email: u.email } : null);
      if (u) checkIsAdmin(u.id).then(setAdmin).catch(() => setAdmin(false));
      else setAdmin(false);
    });

    return () => {
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // رفرش سبک
    if (typeof window !== "undefined") window.location.href = "/";
  };

  return (
    <header className="nv-header">
      <nav className="nv-nav">
        <div className="nv-left">
          <Link href="/contact" className="nv-link">تماس</Link>
          <Link href="/plans" className="nv-link">پلن‌ها</Link>
          <Link href="/about" className="nv-link">درباره</Link>
        </div>

        <div className="nv-brand">
          <Link href="/" className="nv-logo">
            <span className="home-emoji">🏠</span> NovaInvest
          </Link>
        </div>

        <div className="nv-right">
          {user ? (
            <>
              <Link href="/dashboard" className="nv-btn">داشبورد</Link>
              {admin && <Link href="/admin" className="nv-btn">ادمین</Link>}
              <button className="nv-btn ghost" onClick={signOut}>خروج</button>
            </>
          ) : (
            <Link href="/login" className="nv-btn primary">ورود / ثبت‌نام</Link>
          )}
        </div>
      </nav>
    </header>
  );
}