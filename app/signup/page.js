"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// — ذخیره ref در کوکی (داخل Suspense رندر می‌شود)
function RefCapture() {
  const search = useSearchParams();
  useEffect(() => {
    const ref = search.get("ref");
    if (ref) {
      document.cookie = `ref=${encodeURIComponent(ref)};path=/;max-age=${60 * 60 * 24 * 30}`;
    }
  }, [search]);
  return null;
}

// جلوگیری از prerender خطادار
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.name.trim() || null },
        },
      });
      if (error) throw error;
      // بعد از ثبت‌نام کاربر را به داشبورد یا ورود ببر
      router.replace("/login"); // اگر ایمیل تاییدی دارید می‌توانید به /login یا /dashboard ببرید
    } catch (e) {
      setErr(e?.message || "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      {/* این قسمت، شرطِ Next.js را برآورده می‌کند */}
      <Suspense fallback={null}>
        <RefCapture />
      </Suspense>

      <div className="auth-card">
        <h1 className="auth-title">ثبت‌نام</h1>
        <p className="auth-sub">حساب جدید بسازید.</p>

        {err ? <div className="alert error">{err}</div> : null}

        <form onSubmit={submit} className="form-v">
          <label>نام و نام‌خانوادگی</label>
          <input
            type="text"
            placeholder="مثلاً علی رضایی"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />

          <label>ایمیل</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            required
          />

          <label>رمز عبور</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            required
          />

          <button className="btn-primary" disabled={loading}>
            {loading ? "در حال ایجاد حساب..." : "ایجاد حساب"}
          </button>
        </form>

        <div className="auth-foot">
          حساب دارید؟ <a href="/login">ورود</a>
        </div>
      </div>

      <style jsx>{`
        .page-wrap {
          min-height: 70vh;
          display: grid;
          place-items: center;
          padding: 2rem 1rem;
        }
        .auth-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
          backdrop-filter: blur(8px);
        }
        .auth-title {
          margin: 0 0 6px;
          font-size: 1.6rem;
        }
        .auth-sub {
          opacity: .8;
          margin: 0 0 18px;
        }
        .form-v {
          display: grid;
          gap: 10px;
        }
        input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 12px;
          color: inherit;
          outline: none;
        }
        .btn-primary {
          margin-top: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 0;
          cursor: pointer;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          color: #fff;
          font-weight: 600;
        }
        .auth-foot {
          margin-top: 14px;
          text-align: center;
          opacity: .9;
        }
        .alert.error {
          background: rgba(255, 77, 77, 0.08);
          border: 1px solid rgba(255, 77, 77, 0.35);
          color: #ff6b6b;
          padding: 8px 10px;
          border-radius: 10px;
          margin-bottom: 10px;
          font-size: .9rem;
        }
      `}</style>
    </div>
  );
}