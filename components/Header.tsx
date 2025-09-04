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
        {/* برند */}
        <div className="brand">
          <Link href="/">NovaInvest</Link>
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

        {/* دکمهٔ منوی موبایل */}
        <button
          className="menu-btn btn"
          aria-label="menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          ☰
        </button>
      </div>

      {/* منوی موبایل */}
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