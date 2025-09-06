"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type SessionUser = { id: string; email?: string | null } | null;

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // mobile menu

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;
      if (!ignore) setUser(u ? { id: u.id, email: u.email } : null);

      if (u) {
        const { data: isAdminResp } = await supabase.rpc("is_admin", { uid: u.id });
        if (!ignore) setIsAdmin(!!isAdminResp);
      } else {
        if (!ignore) setIsAdmin(false);
      }
      if (!ignore) setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      sub.subscription.unsubscribe();
      ignore = true;
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // منطق نمایش لینک‌های Admin/Dashboard
  const onAdmin = pathname?.startsWith("/admin");
  const onDashboard = pathname === "/dashboard";

  const showDashboardLink =
    !!user && ( !onDashboard && (!isAdmin || (isAdmin && onAdmin)) );
  // اگر ادمین هست و الان داخل admin است، Dashboard رو نشان بده
  // اگر ادمین نیست ولی لاگین است و روی صفحه دیگری است، Dashboard رو نشان بده

  const showAdminLink =
    !!user && isAdmin && !onAdmin; // ادمین‌ها وقتی خارج از /admin هستند، Admin دیده شود

  return (
    <header className="site-header">
      <div className="container row between center">
        <div className="row center gap12">
          <Link href="/" className="brand">
            <span className="brand-logo">🏠</span>
            <span className="brand-text">NovaInvest</span>
          </Link>

          {/* لینک‌های دسکتاپ */}
          <nav className="nav-links hide-sm">
            <Link href="/plans">Plans</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>

            {/* ورود کرده‌ها */}
            {user && showDashboardLink && <Link href="/dashboard">Dashboard</Link>}
            {user && showAdminLink && <Link href="/admin">Admin</Link>}
          </nav>
        </div>

        {/* اکشن‌های راست */}
        <div className="row center gap8">
          {loading ? (
            <span className="muted">…</span>
          ) : user ? (
            <>
              <span className="muted hide-sm">{user.email ?? "User"}</span>
              <button className="btn" onClick={signOut}>خروج</button>
            </>
          ) : (
            // اگر وارد نیست، ورود/ثبت‌نام
            <>
              <Link className="btn" href="/login">ورود</Link>
              <Link className="btn" href="/signup">ثبت‌نام</Link>
            </>
          )}

          {/* دکمه موبایل */}
          <button
            className="btn icon hide-md-up"
            onClick={() => setOpen(v => !v)}
            aria-label="menu"
          >
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
          {user && showDashboardLink && (
            <Link href="/dashboard" onClick={()=>setOpen(false)}>Dashboard</Link>
          )}
          {user && showAdminLink && (
            <Link href="/admin" onClick={()=>setOpen(false)}>Admin</Link>
          )}
          {user ? (
            <button className="btn" onClick={()=>{ setOpen(false); signOut(); }}>خروج</button>
          ) : (
            <>
              <Link className="btn" href="/login" onClick={()=>setOpen(false)}>ورود</Link>
              <Link className="btn" href="/signup" onClick={()=>setOpen(false)}>ثبت‌نام</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}