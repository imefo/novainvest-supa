"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// اگر دوست داری از util خودت استفاده کنی می‌تونی بجاش از lib/role استفاده کنی.
// اینجا مستقیم RPC is_admin رو صدا می‌زنیم تا وابستگی کمتر باشه.

type SessionUser = { id: string; email?: string | null } | null;

export default function Header() {
  const [user, setUser] = useState<SessionUser>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // برای منوی موبایل

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;
      if (!ignore) setUser(u ? { id: u.id, email: u.email } : null);

      // چک ادمین فقط وقتی لاگین بود
      if (u) {
        const { data: isAdminResp } = await supabase.rpc("is_admin", { uid: u.id });
        if (!ignore) setIsAdmin(!!isAdminResp);
      } else {
        if (!ignore) setIsAdmin(false);
      }
      if (!ignore) setLoading(false);
    }

    load();

    // گوش دادن به تغییرات auth (لاگین/لاگ‌اوت)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      load();
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    // برگرد به صفحه اصلی
    window.location.href = "/";
  }

  return (
    <header className="site-header">
      <div className="container row between center">
        <div className="row center gap12">
          <Link href="/" className="brand">
            <span className="brand-logo">🏠</span>
            <span className="brand-text">NovaInvest</span>
          </Link>

          {/* لینک‌های سمت چپ (دسکتاپ) */}
          <nav className="nav-links hide-sm">
            <Link href="/plans">Plans</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            {/* همیشه Dashboard برای لاگین‌شده‌ها */}
            {user && <Link href="/dashboard">Dashboard</Link>}
            {/* فقط ادمین‌ها: لینک Admin همزمان با Dashboard */}
            {user && isAdmin && <Link href="/admin">Admin</Link>}
          </nav>
        </div>

        {/* اکشن‌های سمت راست */}
        <div className="row center gap8">
          {loading ? (
            <span className="muted">…</span>
          ) : user ? (
            <>
              <span className="muted hide-sm">{user.email ?? "User"}</span>
              <button className="btn" onClick={signOut}>خروج</button>
            </>
          ) : (
            <>
              <Link className="btn" href="/login">ورود</Link>
              <Link className="btn" href="/signup">ثبت‌نام</Link>
            </>
          )}

          {/* دکمه موبایل */}
          <button className="btn icon hide-md-up" onClick={() => setOpen(v => !v)} aria-label="menu">
            ☰
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      {open && (
        <div className="mobile-nav">
          <Link href="/plans" onClick={()=>setOpen(false)}>Plans</Link>
          <Link href="/about" onClick={()=>setOpen(false)}>About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)}>Contact</Link>
          {user && <Link href="/dashboard" onClick={()=>setOpen(false)}>Dashboard</Link>}
          {user && isAdmin && <Link href="/admin" onClick={()=>setOpen(false)}>Admin</Link>}
        </div>
      )}
    </header>
  );
}