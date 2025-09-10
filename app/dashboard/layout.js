"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      setEmail(data?.user?.email || "");
    })();
    return () => (alive = false);
  }, []);

  const Item = ({ href, label }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`
          lux-btn w-full ${active ? "is-active" : ""}
        `}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="lux-shell">
      {/* sidebar */}
      <aside className="lux-aside">
        <div className="lux-brand">
          <span className="lux-dot" /> NovaInvest
        </div>
        <div className="lux-email">{email}</div>
        <nav className="lux-nav">
          <Item href="/dashboard" label="داشبورد" />
          <Item href="/dashboard/transactions" label="تراکنش‌ها" />
          <Item href="/plans" label="پلن‌ها" />
          <Item href="/deposit" label="واریز" />
          <Link href="/logout" className="lux-btn w-full danger">خروج</Link>
        </nav>
      </aside>

      {/* main */}
      <main className="lux-main">{children}</main>
    </div>
  );
}