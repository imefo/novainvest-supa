// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/role";

type U = { id: string; email?: string | null } | null;

export default function Header() {
  const [user, setUser] = useState<U>(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;

        setUser(user ?? null);

        if (user?.id) {
          const ok = await isAdmin(user.id);
          if (!mounted) return;
          setAdmin(ok);
        } else {
          setAdmin(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u?.id) {
        isAdmin(u.id).then(setAdmin).catch(() => setAdmin(false));
      } else {
        setAdmin(false);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // کوچک، شیشه‌ای
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="brand">
          <Link href="/">NovaInvest</Link>
          <Link href="/" aria-label="خانه" className="home-ico">🏠</Link>
        </div>

        <nav className="nav">
          <Link href="/about">درباره</Link>
          <Link href="/plans">پلن‌ها</Link>
          <Link href="/contact">تماس</Link>
          {loading ? null : (
            <>
              {user ? (
                <>
                  {/* اگر در صفحه داشبورد هستیم، لینک Admin را نشان بده و برعکس */}
                  <Link href="/dashboard">داشبورد</Link>
                  {admin && <Link href="/admin">ادمین</Link>}
                  <button
                    className="btn btn-glass"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      // برگشت به خانه بعد از خروج
                      window.location.href = "/";
                    }}
                  >
                    خروج
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-primary">ورود / ثبت‌نام</Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}