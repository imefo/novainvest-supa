"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser, checkIsAdmin } from "@/lib/role";

const NAV = [
  { href: "/admin", label: "نمای کلی" },
  { href: "/admin/users", label: "کاربران" },
  { href: "/admin/plans", label: "پلن‌ها" },
  { href: "/admin/transactions", label: "تراکنش‌ها" },
  { href: "/admin/kyc", label: "احراز هویت" },
  { href: "/dashboard", label: "خروج از ادمین" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { user } = await getCurrentUser();
      if (!user) {
        router.replace("/login?next=/admin");
        return;
      }
      const { isAdmin } = await checkIsAdmin(user.id);
      if (!isAdmin) {
        router.replace("/dashboard");
        return;
      }
      setOk(true);
    })();
  }, [router]);

  if (!ok) {
    return (
      <div className="admin-shell">
        <div className="admin-content">
          <div className="glass card">در حال بررسی دسترسی…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar glass">
        <Link href="/" className="brand-home">🏠 NovaInvest</Link>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}