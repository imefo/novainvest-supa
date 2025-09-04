"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const LinkItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} onClick={() => setOpen(false)}>
      {children}
    </Link>
  );

  return (
    <header className="site-header" dir="rtl">
      <div className="container header-inner">
        <div className="brand">
          <Link href="/">NovaInvest</Link>
        </div>

        <nav className="nav">
          <LinkItem href="/about">درباره</LinkItem>
          <LinkItem href="/plans">پلن‌ها</LinkItem>
          <LinkItem href="/contact">تماس</LinkItem>
          <LinkItem href="/dashboard">داشبورد</LinkItem>
          <Link href="/login" className="btn btn-primary">ورود / ثبت‌نام</Link>
        </nav>

        <button className="menu-btn btn" aria-label="menu" onClick={() => setOpen(v => !v)}>
          ☰
        </button>
      </div>

      {open && (
        <div className="container mobile">
          <LinkItem href="/about">درباره</LinkItem>
          <LinkItem href="/plans">پلن‌ها</LinkItem>
          <LinkItem href="/contact">تماس</LinkItem>
          <LinkItem href="/dashboard">داشبورد</LinkItem>
          <Link href="/login" className="btn btn-primary btn-block">ورود / ثبت‌نام</Link>
        </div>
      )}
    </header>
  );
}