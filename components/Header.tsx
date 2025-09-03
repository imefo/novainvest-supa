// components/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* برند/لوگو */}
        <Link href="/" className="brand">NovaInvest</Link>

        {/* دکمه منوی موبایل */}
        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        {/* ناوبری اصلی */}
        <nav className={`nav ${open ? "open" : ""}`}>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/plans" onClick={() => setOpen(false)}>Plans</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        </nav>
      </div>
    </header>
  );
}