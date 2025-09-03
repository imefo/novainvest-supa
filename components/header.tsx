// components/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* لوگو */}
        <Link href="/" className="brand">NovaInvest</Link>

        {/* دکمه منوی موبایل */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* منوی اصلی */}
        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/plans" onClick={() => setMenuOpen(false)}>Plans</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        </nav>
      </div>
    </header>
  );
}