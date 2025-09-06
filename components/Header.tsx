"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isAdmin as isAdminFn } from "@/lib/role";

type UserLite = { id: string; email?: string | null } | null;

export default function Header() {
  const [user, setUser] = useState<UserLite>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // خواندن وضعیت کاربر
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;
      setUser(u ? { id: u.id, email: u.email } : null);
      setIsAdmin(u ? await isAdminFn(u.id) : false);
    })();
  }, []);

  // خروج
  async function doSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // لینک‌های ثابت
  const leftLinks = [
    { href: "/about", label: "درباره" },
    { href: "/plans", label: "پلن‌ها" },
    { href: "/contact", label: "تماس" },
  ];

  // لینک‌های حساب
  const accountLinks = user
    ? [
        { href: "/dashboard", label: "داشبورد" },
        ...(isAdmin ? [{ href: "/admin", label: "ادمین" }] : []),
      ]
    : [];

  const showAuth = !user; // اگر لاگین نیست دکمه ورود/ثبت‌نام را نشان بده

  // کمک برای هایلایت لینک فعال
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="site-header" dir="rtl">
      <div className="site-header__inner container">
        {/* برند (راست) */}
        <Link href="/" className="brand">
          <span className="home-icon" aria-hidden>🏠</span>
          <span className="brand-text">NovaInvest</span>
        </Link>

        {/* ناوبری دسکتاپ */}
        <nav className="nav hide-on-mobile">
          <ul className="nav-list">
            {leftLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={isActive(l.href) ? "nav-link active" : "nav-link"}
                >
                  {l.label}
                </Link>
              </li>
            ))}

            {accountLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={isActive(l.href) ? "nav-link active" : "nav-link"}
                >
                  {l.label}
                </Link>
              </li>
            ))}

            {showAuth ? (
              <li>
                <Link href="/login" className="btn-primary small">
                  ورود / ثبت‌نام
                </Link>
              </li>
            ) : (
              <li>
                <button onClick={doSignOut} className="btn ghost small">
                  خروج
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* منوی موبایل */}
        <button
          className="hamburger show-on-mobile"
          aria-label="منو"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>
      </div>

      {/* دراپ‌داون موبایل */}
      {open && (
        <div className="mobile-nav show-on-mobile container">
          {[...leftLinks, ...accountLinks].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "mnav-link active" : "mnav-link"}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {showAuth ? (
            <Link href="/login" className="btn-primary block" onClick={() => setOpen(false)}>
              ورود / ثبت‌نام
            </Link>
          ) : (
            <button onClick={doSignOut} className="btn ghost block">
              خروج
            </button>
          )}
        </div>
      )}
    </header>
  );
}