"use client";

import Link from "next/link";

export default function AdminHome() {
  return (
    <main dir="rtl" className="nv-container">
      <h1 style={{ margin: "8px 0 16px" }}>مدیریت</h1>
      <div className="features-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="card">
          <h3>کاربران</h3>
          <p className="muted">مشاهده و مدیریت کاربران.</p>
          <Link href="/admin/users" className="nv-btn" style={{ marginTop: 8 }}>ورود</Link>
        </div>
        <div className="card">
          <h3>پلن‌ها</h3>
          <p className="muted">ایجاد/ویرایش/حذف پلن‌ها و فعال/غیرفعال.</p>
          <Link href="/admin/plans" className="nv-btn" style={{ marginTop: 8 }}>ورود</Link>
        </div>
        <div className="card">
          <h3>تراکنش‌ها</h3>
          <p className="muted">واریز/برداشت‌ها و وضعیت‌ها.</p>
          <Link href="/admin/transactions" className="nv-btn" style={{ marginTop: 8 }}>ورود</Link>
        </div>
        <div className="card">
          <h3>احراز هویت</h3>
          <p className="muted">تأیید/رد KYC کاربران.</p>
          <Link href="/admin/kyc" className="nv-btn" style={{ marginTop: 8 }}>ورود</Link>
        </div>
        <div className="card">
          <h3>درخواست واریز دستی</h3>
          <p className="muted">تأیید اسکرین‌شات/TxHash و شارژ حساب.</p>
          <Link href="/admin/deposit" className="nv-btn" style={{ marginTop: 8 }}>ورود</Link>
        </div>
      </div>
    </main>
  );
}