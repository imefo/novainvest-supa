"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type U = { id: string; email?: string } | null;

export default function Header() {
  const [user, setUser] = useState<U>(null);

  // فقط وضعیت لاگین را می‌خوانیم؛ هیچ چک دیگری نمی‌کنیم تا گیر نکند
  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ? { id: data.user.id, email: data.user.email ?? undefined } : null);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null);
      });
      unsub = sub?.subscription?.unsubscribe ?? null;
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    // اختیاری: رفرش سریع
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <header className="nv-header">
      <div className="nv-header-inner">
        {/* چپ */}
        <nav className="nv-nav-left">
          <Link href="/" className="nv-link">خانه</Link>
          <Link href="/about" className="nv-link">درباره</Link>
          <Link href="/plans" className="nv-link">پلن‌ها</Link>
          <Link href="/contact" className="nv-link">تماس</Link>
        </nav>

        {/* برند */}
        <div className="nv-brand">
          <Link href="/" className="nv-brand-link">
            <span className="nv-brand-home">🏠</span>
            <span className="nv-brand-title">NovaInvest</span>
          </Link>
        </div>

        {/* راست */}
        <nav className="nv-nav-right">
          {!user && (
            <>
              <Link href="/login" className="nv-btn">ورود</Link>
              <Link href="/signup" className="nv-btn nv-btn-primary">ثبت‌نام</Link>
            </>
          )}

          {user && (
            <>
              {/* Dashboard برای همه‌ی لاگین‌شده‌ها */}
              <Link href="/dashboard" className="nv-link">داشبورد</Link>
              {/* لینک Admin صرفاً برای دسترسی سریع؛ خود /admin گِیت دارد */}
              <Link href="/admin" className="nv-link">ادمین</Link>
              {/* واریز دستی */}
              <Link href="/deposit" className="nv-link">واریز</Link>

              <button onClick={signOut} className="nv-btn" style={{ marginInlineStart: 8 }}>
                خروج
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}