"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} onClick={() => setOpen(false)}>
      {children}
    </Link>
  );

  return (
    <header className="site-header" dir="rtl">
      <div className="container header-inner">
        {/* برند + خانه */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="brand">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* آیکن خانه */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 11.5 12 4l9 7.5V20a2 2 0 0 1-2 2h-4.5v-6h-5v6H5a2 2 0 0 1-2-2v-8.5Z"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>NovaInvest</span>
          </Link>
        </div>

        {/* ناوبری دسکتاپ */}
        <nav className="nav" aria-label="main">
          <NavLink href="/about">درباره</NavLink>
          <NavLink href="/plans">پلن‌ها</NavLink>
          <NavLink href="/contact">تماس</NavLink>
          <NavLink href="/dashboard">داشبورد</NavLink>
          <Link href="/login" className="btn btn-gold" style={{ marginInlineStart: 6 }}>
            ورود / ثبت‌نام
          </Link>
        </nav>

        {/* منوی موبایل */}
        <button
          className="menu-btn btn"
          aria-label="menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="container mobile" role="menu">
          <NavLink href="/about">درباره</NavLink>
          <NavLink href="/plans">پلن‌ها</NavLink>
          <NavLink href="/contact">تماس</NavLink>
          <NavLink href="/dashboard">داشبورد</NavLink>
          <Link href="/login" className="btn btn-gold btn-block">ورود / ثبت‌نام</Link>
        </div>
      )}
    </header>
  );
}