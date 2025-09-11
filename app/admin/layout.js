"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const pageTitle = useMemo(() => {
    if (!pathname) return "پنل ادمین";
    if (pathname.startsWith("/admin/users")) return "کاربران";
    if (pathname.startsWith("/admin/plans")) return "پلن‌ها";
    if (pathname.startsWith("/admin/transactions")) return "تراکنش‌ها";
    if (pathname.startsWith("/admin/deposit")) return "واریز/برداشت";
    if (pathname.startsWith("/admin/kyc")) return "احراز هویت (KYC)";
    if (pathname.startsWith("/admin/tickets")) return "تیکت‌ها";
    return "پنل ادمین";
  }, [pathname]);

  const items = [
    { href: "/admin", label: "نمای کلی" },
    { href: "/admin/users", label: "کاربران" },
    { href: "/admin/plans", label: "پلن‌ها" },
    { href: "/admin/transactions", label: "تراکنش‌ها" },
    { href: "/admin/deposit", label: "واریز/برداشت" },
    { href: "/admin/kyc", label: "KYC" },
    { href: "/admin/tickets", label: "تیکت‌ها" },
  ];
  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="ad-shell">
      <aside className={`ad-sidebar ${open ? "open" : ""}`}>
        <div className="ad-logo">
          <Link href="/"><span>🏠</span><strong>NovaInvest</strong></Link>
          <small>Admin</small>
        </div>
        <nav className="ad-nav">
          {items.map(it => (
            <Link
              key={it.href}
              href={it.href}
              className={`ad-link ${isActive(it.href) ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {it.label}
            </Link>
          ))}
          <div className="ad-spacer" />
          <Link href="/dashboard" className="ad-link" onClick={() => setOpen(false)}>↺ رفتن به داشبورد کاربر</Link>
          <Link href="/" className="ad-link" onClick={() => setOpen(false)}>← بازگشت به سایت</Link>
        </nav>
      </aside>

      <div className="ad-right">
        <header className="ad-topbar">
          <div className="ad-left-tools">
            <button className="ad-btn" onClick={() => setOpen(v => !v)}>☰</button>
            <button className="ad-btn" onClick={() => router.back()}>↶ بازگشت</button>
          </div>
          <div className="ad-title">{pageTitle}</div>
          <div className="ad-actions">
            <Link href="/admin/tickets" className="ad-btn">تیکت‌های جدید</Link>
            <Link href="/logout" className="ad-btn">خروج</Link>
          </div>
        </header>

        <main className="ad-main">{children}</main>
      </div>
    </div>
  );
}