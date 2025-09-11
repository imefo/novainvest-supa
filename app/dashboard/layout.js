"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // عنوان مسیر جاری (برای تاپ‌بار)
  const pageTitle = useMemo(() => {
    if (!pathname) return "داشبورد";
    if (pathname.startsWith("/dashboard/wallet")) return "کیف پول";
    if (pathname.startsWith("/dashboard/plans")) return "پلن‌ها";
    if (pathname.startsWith("/dashboard/transactions")) return "تراکنش‌ها";
    if (pathname.startsWith("/dashboard/support")) return "پشتیبانی";
    if (pathname.startsWith("/dashboard/tickets")) return "تیکت‌ها";
    if (pathname.startsWith("/dashboard/refer")) return "دعوت دوستان";
    if (pathname.startsWith("/dashboard/settings")) return "تنظیمات";
    return "داشبورد";
  }, [pathname]);

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  // آیتم‌های منو (کناری)
  const navItems = [
    { href: "/dashboard", label: "نمای کلی" },
    { href: "/dashboard/wallet", label: "کیف پول" },
    { href: "/dashboard/plans", label: "پلن‌ها" },
    { href: "/dashboard/transactions", label: "تراکنش‌ها" },
    { href: "/dashboard/support", label: "پشتیبانی" },
    { href: "/dashboard/tickets", label: "تیکت‌ها" },
    { href: "/dashboard/refer", label: "دعوت دوستان" },
    { href: "/dashboard/settings", label: "تنظیمات" },
  ];

  return (
    <div className="nv-shell">
      {/* Sidebar */}
      <aside
        className="nv-sidebar"
        style={{
          display: open ? "block" : undefined, // برای موبایل: با دکمه باز/بسته می‌شود
        }}
      >
        <div className="nv-logo">
          <Link href="/"><span>🏠</span> NovaInvest</Link>
        </div>

        <nav className="nv-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nv-link ${isActive(item.href) ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span>{item.label}</span>
              {item.href === "/dashboard/tickets" && (
                <span className="nv-badge">جدید</span>
              )}
            </Link>
          ))}

          <div className="nv-spacer" />

          <Link href="/" className="nv-link" onClick={() => setOpen(false)}>
            ← بازگشت به سایت
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <div style={{ display: "grid", gridTemplateRows: "auto 1fr" }}>
        {/* Topbar */}
        <div className="nv-topbar">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="nv-btn"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle sidebar"
              style={{ display: "inline-flex" }}
            >
              ☰
            </button>
            <button className="nv-btn" onClick={() => router.back()}>↶ بازگشت</button>
          </div>

          <div style={{ fontWeight: 700 }}>{pageTitle}</div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/plans" className="nv-btn">پلن‌های عمومی</Link>
            <Link href="/logout" className="nv-btn">خروج</Link>
          </div>
        </div>

        {/* Main */}
        <main className="nv-main">
          {children}
        </main>
      </div>
    </div>
  );
}