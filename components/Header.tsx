// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type UserState =
  | { loading: false; user: null; isAdmin: false }
  | { loading: false; user: { id: string; email: string | null }; isAdmin: boolean }
  | { loading: true };

export default function Header() {
  const [state, setState] = useState<UserState>({ loading: true });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1) سشن فعلی
        const { data: sess } = await supabase.auth.getSession();
        const session = sess?.session;
        if (!session) {
          if (!cancelled) setState({ loading: false, user: null, isAdmin: false });
          return;
        }

        const uid = session.user.id;
        // 2) نقش ادمین از جدول profiles
        const { data: prof } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("user_id", uid)
          .maybeSingle();

        if (!cancelled) {
          setState({
            loading: false,
            user: { id: uid, email: session.user.email ?? null },
            isAdmin: prof?.is_admin === true,
          });
        }
      } catch (e) {
        // در خطای لحظه‌ای هم اجازه بده منوی مهمان دیده شود
        if (!cancelled) setState({ loading: false, user: null, isAdmin: false });
      }
    }

    load();

    // اگر کاربر لاگین/لاگ‌اوت کند، هدر آپدیت شود
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  // ————————————————— UI —————————————————
  // نکته: موقع loading، به‌جای متن «در حال بارگذاری…»، منوی مهمان را نشان می‌دهیم.
  const isLoggedIn = !state.loading && !!("user" in state && state.user);
  const isAdmin = !state.loading && "isAdmin" in state && state.isAdmin === true;

  return (
    <header className="nv-header">
      <div className="nv-header-inner">
        <nav className="nv-nav-left">
          <Link href="/contact" className="nv-link">تماس</Link>
          <Link href="/plans" className="nv-link">پلن‌ها</Link>
          <Link href="/about" className="nv-link">درباره</Link>
        </nav>

        <div className="nv-brand">
          <Link href="/" className="nv-brand-link">
            <span className="nv-brand-title">NovaInvest</span>
            <span className="nv-brand-home" aria-hidden>🏠</span>
          </Link>
        </div>

        <nav className="nv-nav-right">
          {/* وقتی لاگین است: دکمه‌های داشبورد/ادمین + خروج */}
          {isLoggedIn ? (
            <>
              {/* اگر داخل /admin هستیم، لینک داشبورد را نشان بده؛
                  اگر داخل /dashboard هستیم، لینک ادمین (وقتی isAdmin=true) را نشان بده.
                  ساده: هر دو را نمایش می‌دهیم تا همیشه در دسترس باشد. */}
              <Link href="/dashboard" className="nv-btn">داشبورد</Link>
              {isAdmin && <Link href="/admin" className="nv-btn nv-btn-primary">ادمین</Link>}
              <button
                className="nv-btn"
                onClick={async () => {
                  await supabase.auth.signOut();
                  // ریفرش نرم
                  window.location.href = "/";
                }}
              >
                خروج
              </button>
            </>
          ) : (
            // وقتی لاگین نیست یا هنوز در حال لود است: دکمه ورود/ثبت‌نام
            <Link href="/login" className="nv-btn nv-btn-primary">ورود / ثبت‌نام</Link>
          )}
        </nav>
      </div>
    </header>
  );
}