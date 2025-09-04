"use client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: اینجا با Supabase: sendPasswordResetEmail(email)
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
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
        <h1 style={{ margin: 0, marginBottom: 6, fontSize: 24 }}>فراموشی رمز عبور</h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 14 }}>
          ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
        </p>

        {sent ? (
          <div className="card" style={{ background: "rgba(34,197,94,.12)", borderColor: "rgba(34,197,94,.35)" }}>
            لینک بازیابی (نمایشی) ارسال شد. لطفاً ایمیل خود را بررسی کنید.
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <label className="tiny" htmlFor="email">ایمیل</label>
            <input id="email" type="email" placeholder="example@email.com" />
            <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: 12 }}>
              {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
            </button>
          </form>
        )}

        <p className="tiny" style={{ textAlign: "center", marginTop: 12 }}>
          به یاد آوردید؟ <Link href="/login">بازگشت به ورود</Link>
        </p>
      </div>
    </section>
  );
}