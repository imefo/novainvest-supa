// components/Header.tsx
import Link from "next/link";

export default function Header() {
  // تست کاملاً قابل‌دیدن در پروداکشن
  return (
    <header
      className="site-header"
      style={{ background: "hotpink", padding: 12 }}
    >
      <nav>
        <Link href="/">HEADER TEST</Link> {" | "}
        <Link href="/about">About</Link> {" | "}
        <Link href="/plans">Plans</Link> {" | "}
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}