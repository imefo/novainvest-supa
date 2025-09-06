"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // اگر لاگین بود، مستقیم ببریم
    (async () => {
      const { data: { user } = {} } = await supabase.auth.getUser().catch(() => ({}));
      if (user?.id) {
        const ok = await isAdminFast(user.id).catch(() => false);
        location.href = ok ? "/admin" : "/dashboard";
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // نقش
      const { data: { user } = {} } = await supabase.auth.getUser();
      const ok = user?.id ? await isAdminFast(user.id) : false;
      location.href = ok ? "/admin" : "/dashboard";
    } catch (e) {
      setErr(e?.message || "خطا در ورود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nv-auth nv-rtl">
      <div className="nv-auth-card glass-card">
        <div className="nv-auth-brand">
          <Link href="/" className="nv-brand-link">
            <span className="nv-home-icon">🏠</span>
            <span className="nv-brand-title">NovaInvest</span>
          </Link>
        </div>

        <h3 style={{marginTop:8}}>ورود</h3>
        <p className="muted" style={{marginTop:4}}>برای ادامه وارد حساب کاربری‌ات شو.</p>

        <form onSubmit={onSubmit} style={{marginTop:12}}>
          <input name="email" type="email" placeholder="ایمیل" required />
          <input name="password" type="password" placeholder="رمز عبور" required style={{marginTop:10}} />
          {err && <div className="error-box">{err}</div>}
          <button className="btn btn-primary" style={{width:"100%", marginTop:10}} disabled={loading}>
            {loading ? "در حال ورود…" : "ورود"}
          </button>
        </form>

        <div className="nv-auth-links">
          <Link className="nv-link" href="/forgot">فراموشی رمز</Link>
          <Link className="nv-link" href="/signup">ثبت‌نام</Link>
        </div>
      </div>
    </div>
  );
}