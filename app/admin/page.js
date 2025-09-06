// app/admin/page.js
"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminHome() {
  const [users, setUsers] = useState<number | null>(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const { count } = await supabase.from("profiles").select("id", { head: true, count: "exact" });
        if (!dead) setUsers(count ?? 0);
      } catch {
        if (!dead) setUsers(0);
      }
    })();
    return () => { dead = true; };
  }, []);

  return (
    <div className="card-glass" style={{ marginTop: 16 }}>
      <h1 style={{ margin: "0 0 8px" }}>پنل مدیریت</h1>
      <p className="muted" style={{ margin: "0 0 16px" }}>کنترل کاربران، پلن‌ها، تراکنش‌ها و احراز هویت</p>

      <div className="admin-grid">
        <Link href="/admin/users" className="card">
          <strong>کاربران</strong>
          <span className="muted">{users === null ? "…" : `${users} کاربر`}</span>
        </Link>
        <Link href="/admin/plans" className="card">
          <strong>پلن‌ها</strong>
          <span className="muted">ایجاد / ویرایش / فعال‌سازی</span>
        </Link>
        <Link href="/admin/transactions" className="card">
          <strong>تراکنش‌ها</strong>
          <span className="muted">واریز/برداشت و وضعیت</span>
        </Link>
        <Link href="/admin/kyc" className="card">
          <strong>احراز هویت</strong>
          <span className="muted">تأیید/رد مدارک</span>
        </Link>
      </div>
    </div>
  );
}