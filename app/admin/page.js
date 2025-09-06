// app/admin/page.js
"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminHome() {
  const [stats, setStats] = useState({ users: 0, deposits: 0, withdrawals: 0 });

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        // نمونه آمار سبک (در صورت داشتن جداول)
        const [{ count: users = 0 } = {}] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true })
        ]);
        if (!dead) setStats((s) => ({ ...s, users: users || 0 }));
      } catch (_) {}
    })();
    return () => { dead = true; };
  }, []);

  return (
    <div dir="rtl" className="card-glass" style={{ marginTop: 16 }}>
      <h1 style={{ marginBottom: 10 }}>پنل مدیریت</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        مدیریت کاربران، پلن‌ها، تراکنش‌ها و احراز هویت
      </p>

      <div className="admin-grid">
        <Link href="/admin/users" className="card">
          <strong>کاربران</strong>
          <span className="muted">{stats.users.toLocaleString()} کاربر</span>
        </Link>
        <Link href="/admin/plans" className="card">
          <strong>پلن‌ها</strong>
          <span className="muted">مدیریت ایجاد/ویرایش/فعال‌سازی</span>
        </Link>
        <Link href="/admin/transactions" className="card">
          <strong>تراکنش‌ها</strong>
          <span className="muted">واریز/برداشت‌ها، فیلتر و وضعیت</span>
        </Link>
        <Link href="/admin/kyc" className="card">
          <strong>احراز هویت</strong>
          <span className="muted">تأیید/رد مدارک</span>
        </Link>
      </div>
    </div>
  );
}