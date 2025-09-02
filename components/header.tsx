// components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">NovaInvest</Link>
        <nav className="nav">
          <Link href="/about">About</Link>
          <Link href="/plans">Plans</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}