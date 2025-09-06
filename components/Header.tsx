"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type TUser = {
  id: string;
  email?: string;
} | null;

export default function Header() {
  const [user, setUser] = useState<TUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser((data?.session?.user as TUser) ?? null);
      setLoading(false);
    };

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__text">NovaInvest</span>
          <span className="brand__home" aria-label="خانه">🏠</span>
        </Link>

        <nav className="nav">
          <Link href="/about">درباره</Link>
          <Link href="/plans">پلن‌ها</Link>
          <Link href="/contact">تماس</Link>

          {loading ? (
            <span className="nav__loading" aria-live="polite">…</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="btn btn-soft">داشبورد</Link>
              <Link href="/admin" className="btn btn-soft">ادمین</Link>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await supabase.auth.signOut();
                  if (typeof window !== "undefined") window.location.href = "/";
                }}
              >
                خروج
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              ورود / ثبت‌نام
            </Link>
          )}
        </nav>
      </div>
      <div className="site-header__bar" />
      {/* همان استایل این‌لاین بالا – می‌تونی اگر خواستی برداری به globals.css منتقل کنی */}
      <style jsx>{`
        .site-header {
          position: sticky; top: 0; z-index: 50;
          backdrop-filter: blur(10px) saturate(140%);
          background: rgba(10, 12, 22, 0.5);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .site-header__inner {
          max-width: 1100px; margin: 0 auto; padding: 10px 16px;
          display: flex; align-items: center; justify-content: space-between;
          color: #e5e7eb;
        }
        .brand { display:flex; gap:8px; align-items:center; text-decoration:none; }
        .brand__text { font-weight:800; letter-spacing:.3px; color:#e5e7eb; }
        .brand__home { opacity:.9 }
        .nav { display:flex; align-items:center; gap:14px; }
        .nav a { color:#cbd5e1; text-decoration:none; }
        .nav a:hover { color:#fff; }
        .nav__loading { opacity:.6; }
        .btn {
          padding:8px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.14);
          text-decoration:none;
        }
        .btn-soft { background: rgba(255,255,255,.06); color:#e5e7eb; }
        .btn-soft:hover { background: rgba(255,255,255,.12); }
        .btn-primary {
          background: linear-gradient(135deg,#8b5cf6,#3b82f6); border:none; color:white; font-weight:600;
        }
        .btn-danger { background:#ef4444; border:none; color:white; }
        .site-header__bar {
          height: 2px;
          background: linear-gradient(90deg,#8b5cf6 0%, #0ea5e9 60%, #f59e0b 100%);
          opacity:.7;
        }
        @media (max-width: 720px) {
          .nav { gap:10px; }
          .btn { padding:7px 10px; }
        }
      `}</style>
    </header>
  );
}