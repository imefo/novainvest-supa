"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: اینجا لاگین Supabase
    setTimeout(() => setLoading(false), 800);
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
      <div className="card" style={{ width: "100%", maxWidth: 520, padding: 24, borderRadius: 20 }}>
        <h1 style={{ margin: 0, marginBottom: 6, fontSize: 24 }}>ورود به حساب</h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
          ایمیل و رمز عبور خود را وارد کنید.
        </p>

        <form onSubmit={onSubmit}>
          <label className="tiny" htmlFor="email">ایمیل</label>
          <input id="email" type="email" placeholder="example@email.com" />

          <label className="tiny" htmlFor="pass" style={{ marginTop: 10 }}>رمز عبور</label>
          <input id="pass" type="password" placeholder="••••••••" />

          <button className="btn btn-gold btn-block" type="submit" style={{ marginTop: 12 }}>
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="tiny" style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <span>
            حساب ندارید؟ <Link href="/signup">ثبت‌نام</Link>
          </span>
          <Link href="/forgot">فراموشی رمز؟</Link>
        </div>
      </div>
    </section>
  );
}