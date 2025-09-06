"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

type U = { id: string; email?: string } | null;

export default function Header() {
  const r = useRouter();
  const path = usePathname();
  const [user, setUser] = useState<U>(null);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const u = data?.session?.user ?? null;
      if (alive) {
        setUser(u);
        if (u?.id) {
          const a = await isAdminFast(u.id);
          if (alive) setAdmin(a);
        }
        setReady(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      const u = sess?.user ?? null;
      setUser(u);
      if (!u) {
        setAdmin(false);
      }
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    r.push("/?v=now");
    r.refresh();
  };

  // تا آماده نشه، هیچ «متن لودینگ» نشان نده
  if (!ready) return <div className="nv-header" />;

  return (
    <header className="nv-header" dir="rtl">
      <div className="nv-header-inner">
        {/* چپ */}
        <nav className="nv-nav-left">
          <Link href="/contact" className="nv-link">تماس</Link>
          <Link href="/plans" className="nv-link">پلن‌ها</Link>
          <Link href="/about" className="nv-link">درباره</Link>
        </nav>

        {/* وسط (لوگو/خانه) */}
        <div className="nv-brand">
          <Link href="/" className="nv-brand-link">
            <span className="nv-brand-home">🏠</span>
            <strong className="nv-brand-title">NovaInvest</strong>
          </Link>
        </div>

        {/* راست */}
        <div className="nv-nav-right">
          {user ? (
            <>
              {/* وقتی در /admin هستیم، دکمه‌ی “داشبورد” را نشان بده و بالعکس */}
              {path?.startsWith("/admin") ? (
                <Link href="/dashboard" className="nv-btn">داشبورد</Link>
              ) : admin ? (
                <Link href="/admin" className="nv-btn">ادمین</Link>
              ) : (
                <Link href="/dashboard" className="nv-btn">داشبورد</Link>
              )}
              <button onClick={signOut} className="nv-btn">خروج</button>
            </>
          ) : (
            <Link href="/login" className="nv-btn nv-btn-primary">ورود / ثبت‌نام</Link>
          )}
        </div>
      </div>
    </header>
  );
}