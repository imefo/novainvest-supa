"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SessionUser = { id: string; email?: string | null };
async function fetchIsAdmin(userId: string) {
  // به جدول profiles نگاه می‌کنیم: ستون is_admin:boolean
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return !!data?.is_admin;
}

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // نکته‌ی مهم: هدر هرگز «در حال بارگذاری…» نشان نمی‌دهد.
  // ابتدا حالت مهمان را نمایش می‌دهیم، بعد از دریافت سشن، دکمه‌ها آپدیت می‌شوند.
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!mounted) return;

      const u = s.session?.user ?? null;
      setUser(u ? { id: u.id, email: u.email } : null);

      if (u?.id) {
        const admin = await fetchIsAdmin(u.id);
        if (mounted) setIsAdmin(admin);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, sess) => {
      const u = sess?.user ?? null;
      setUser(u ? { id: u.id, email: u.email } : null);
      if (u?.id) {
        const admin = await fetchIsAdmin(u.id);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const active = (p: string) => (pathname === p ? "nv-link nv-link-active" : "nv-link");

  return (
    <header className="nv-header">
      <div className="nv-header-inner" dir="rtl">
        {/* چپ: ناوبری عمومی */}
        <nav className="nv-nav-left">
          <Link className={active("/about")} href="/about">درباره</Link>
          <Link className={active("/plans")} href="/plans">پلن‌ها</Link>
          <Link className={active("/contact")} href="/contact">تماس</Link>
        </nav>

        {/* وسط: برند */}
        <div className="nv-brand">
          <Link href="/" className="nv-brand-link">
            <span className="nv-brand-title">NovaInvest</span>
            <span className="nv-brand-home" aria-hidden>🏠</span>
          </Link>
        </div>

        {/* راست: اکشن‌ها بر اساس وضعیت کاربر */}
        <div className="nv-nav-right">
          {!user && (
            <Link href="/login" className="nv-btn nv-btn-primary">ورود / ثبت‌نام</Link>
          )}

          {user && (
            <>
              {/* وقتی داخل داشبورد هستیم، دکمه‌ی «ادمین» را هم نشان بده اگر ادمین است. */}
              <Link href="/dashboard" className="nv-btn">داشبورد</Link>
              {isAdmin && <Link href="/admin" className="nv-btn">ادمین</Link>}

              <button
                className="nv-btn"
                onClick={async () => {
                  await supabase.auth.signOut();
                  // بلافاصله UI به حالت مهمان برمی‌گردد
                }}
              >
                خروج
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}