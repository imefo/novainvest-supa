"use client";

import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="admin-wrap">
      <div className="admin-top">
        <div className="admin-breadcrumb">
          <Link href="/" className="btn-ghost">بازگشت به سایت</Link>
        </div>
        <div>
          <h1 className="admin-title">داشبورد</h1>
          <p className="admin-sub">وضعیت کل حساب، کیف‌پول و سرمایه‌گذاری‌ها</p>
        </div>
      </div>

      <div className="admin-body">
        {children}
      </div>
    </div>
  );
}