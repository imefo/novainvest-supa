"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

type UserLite = { id: string; email?: string } | null;

export default function Header() {
  const [user, setUser] = useState<UserLite>(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      // کاربر فعلی
      const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } as any }));
      const u = data?.user ?? null;
      if (!alive) return;

      setUser(u ? { id: u.id, email: u.email || undefined } : null);

      if (u?.id) {
        const ok = await isAdminFast(u.id).catch(() => false);
        if (alive) setAdmin(!!ok);
      } else {
        if (alive) setAdmin(false);
      }

      if (alive) setLoading(false);
    })();

    // گوش دادن به تغییرات سشن
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      const u = session?.user || null;
      setUser(u ? { id: u.id, email: u.email || undefined } : null);

      if (u?.id) {
        const ok = await isAdminFast(u.id).catch(() => false);
        setAdmin(!!ok);
      } else {
        setAdmin(false);
      }
    });

    return () => {
      // @ts-ignore: API انواع مختلف دارد
      sub?.subscription?.unsubscribe?.();
      alive = false;
    };
  }, []);

  return (
    <header className="nv-header">
      <div className="nv-header-inner">
        {/* سمت چپ */}
        <nav className="nv-nav-left">
          <Link className="nv-link" href="/contact">تماس</Link>
          <Link className="nv-link" href="/about">درباره</Link>
          <Link className="nv-link" href="/plans">پلن‌ها</Link>
        </nav>

        {/* برند وسط */}
        <div className="nv-brand">
          <Link href="/" className="nv-brand-link">
            <span className="nv-home-icon">🏠</span>
            <span className="nv-brand-title">NovaInvest</span>
          </Link>
        </div>

        {/* سمت راست */}
        <nav className="nv-nav-right">
          {loading ? (
            <span className="muted">در حال بررسی…</span>
          ) : user ? (
            <>
              {admin && <Link className="nv-link" href="/admin">ادمین</Link>}
              <Link className="nv-link" href="/dashboard">داشبورد</Link>
              <button
                className="nv-btn"
                onClick={async () => {
                  try { await supabase.auth.signOut(); } catch {}
                  location.href = "/";
                }}
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link className="nv-btn" href="/login">ورود</Link>
              <Link className="nv-btn nv-btn-primary" href="/signup">ثبت‌نام</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
<Link href="/deposit" className="nv-link">واریز</Link>