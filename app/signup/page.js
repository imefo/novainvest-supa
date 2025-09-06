"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!fullName.trim() || !email.trim() || !pwd) {
      setErr("همه فیلدها را کامل کنید.");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: {
          data: { full_name: fullName },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${location.origin}/login`
              : undefined,
        },
      });
      if (error) throw error;

      setOk(
        "ثبت‌نام انجام شد! ایمیل خود را برای تأیید بررسی کنید، سپس وارد شوید."
      );
      // بعد از چند ثانیه کاربر را به لاگین ببریم
      setTimeout(() => router.push("/login"), 2200);
    } catch (e) {
      setErr(e.message ?? "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="nv-container auth-page">
      <div className="auth-card glass-xl">
        <div className="auth-head">
          <h1>ثبت‌نام</h1>
          <p className="muted">حساب جدید بسازید.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label className="fld">
            <span>نام و نام خانوادگی</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثلاً علی رضایی"
              dir="rtl"
            />
          </label>

          <label className="fld">
            <span>ایمیل</span>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              dir="ltr"
            />
          </label>

          <label className="fld">
            <span>رمز عبور</span>
            <div className="pwd-wrap">
              <input
                type={showPwd ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
              />
              <button
                type="button"
                className="nv-btn nv-btn-ghost pwd-toggle"
                onClick={() => setShowPwd((s) => !s)}
                aria-label="نمایش/مخفی کردن رمز"
              >
                {showPwd ? "مخفی" : "نمایش"}
              </button>
            </div>
          </label>

          {err ? <p className="alert error">{err}</p> : null}
          {ok ? <p className="alert ok">{ok}</p> : null}

          <button className="nv-btn nv-btn-primary nv-btn-block" disabled={loading}>
            {loading ? "در حال ایجاد حساب..." : "ایجاد حساب"}
          </button>
        </form>

        <div className="auth-foot">
          <span className="muted">حساب دارید؟</span>
          <Link className="nv-link strong" href="/login">
            ورود
          </Link>
        </div>
      </div>
    </main>
  );
}