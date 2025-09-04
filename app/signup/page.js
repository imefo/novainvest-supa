"use client";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: اینجا ثبت‌نام واقعی با Supabase انجام بده
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <section
      className="section"
      style={{
        minHeight: "calc(100dvh - 64px - 80px)",
        display: "grid",
        placeItems: "center",
        paddingTop: 32,
        paddingBottom: 32,
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 560, padding: 24, borderRadius: 20 }}>
        <h1 style={{ margin: 0, marginBottom: 6, fontSize: 24 }}>ثبت‌نام</h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
          اطلاعات خود را وارد کنید تا حساب ایجاد شود.
        </p>

        <form onSubmit={onSubmit}>
          <label className="tiny" htmlFor="name">نام و نام خانوادگی</label>
          <input id="name" type="text" placeholder="مثال: علی رضایی" />

          <label className="tiny" htmlFor="email" style={{ marginTop: 10 }}>ایمیل</label>
          <input id="email" type="email" placeholder="example@email.com" />

          <label className="tiny" htmlFor="pass" style={{ marginTop: 10 }}>رمز عبور</label>
          <input id="pass" type="password" placeholder="حداقل ۸ کاراکتر" />

          <button className="btn btn-gold btn-block" type="submit" style={{ marginTop: 12 }}>
            {loading ? "در حال ساخت حساب..." : "ایجاد حساب"}
          </button>
        </form>

        <p className="tiny" style={{ textAlign: "center", marginTop: 12 }}>
          حساب دارید؟ <Link href="/login">ورود</Link>
        </p>
      </div>
    </section>
  );
}