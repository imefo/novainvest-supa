"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErr(error.message || "ورود ناموفق بود.");
        return;
      }
      // ورود موفق → مستقیم به داشبورد (گیت ادمین داخل /admin است)
      window.location.assign("/dashboard");
    } catch (e) {
      setErr("خطای غیرمنتظره. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="nv-container" dir="rtl" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} className="glass-card" style={{ width: "min(520px, 92vw)", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>NovaInvest</div>
          <div style={{ opacity: .9 }}>ورود</div>
        </div>

        <p style={{ margin: "0 0 12px 0", color: "#cbd5e1" }}>برای ادامه وارد حساب کاربری‌ات شو.</p>

        <label className="lbl">ایمیل</label>
        <input
          type="email"
          className="inpt"
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          inputMode="email"
          autoComplete="email"
        />

        <label className="lbl">رمز عبور</label>
        <input
          type="password"
          className="inpt"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {err && (
          <div className="alert" style={{ marginTop: 10 }}>{err}</div>
        )}

        <button
          type="submit"
          className="nv-btn nv-btn-primary"
          disabled={loading}
          style={{ width: "100%", marginTop: 12 }}
        >
          {loading ? "در حال ورود…" : "ورود"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <Link className="nv-link" href="/signup">ثبت‌نام</Link>
          <Link className="nv-link" href="/forgot">فراموشی رمز</Link>
        </div>
      </form>

      <style jsx>{`
        .glass-card{
          background: rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.12);
          border-radius:16px;
          backdrop-filter: blur(10px) saturate(140%);
        }
        .lbl{display:block;margin:10px 0 6px 0;color:#cbd5e1;font-size:13px}
        .inpt{
          width:100%; height:44px; border-radius:10px;
          border:1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08); color:#e5e7eb;
          padding:0 12px; outline:none;
        }
        .inpt::placeholder{color:#94a3b8}
        .alert{
          background: rgba(244,63,94,.18);
          border:1px solid rgba(244,63,94,.35);
          color:#fecaca; padding:8px 10px; border-radius:10px;
          font-size:13px;
        }
      `}</style>
    </main>
  );
}