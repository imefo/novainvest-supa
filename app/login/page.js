"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [err,  setErr]        = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) { setErr(error.message || "خطا در ورود"); return; }
    // بعد از ورود: اگر ادمین است به /admin، وگرنه /dashboard
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const { data: isAdmin } = await supabase.rpc("is_admin", { uid: user.id });
      window.location.href = isAdmin ? "/admin" : "/dashboard";
    }
  };

  return (
    <main className="nv-container nv-rtl">
      <div className="nv-auth-card">
        <h2>ورود</h2>
        <form onSubmit={onSubmit}>
          <input type="email" placeholder="ایمیل" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="رمز عبور" value={pass} onChange={e=>setPass(e.target.value)} required />
          <button className="btn btn-primary" disabled={loading}>{loading?"در حال ورود…":"ورود"}</button>
        </form>
        {err && <p className="err">{err}</p>}
        <div className="nv-auth-links">
          <Link href="/forgot">فراموشی رمز</Link>
          <span>•</span>
          <Link href="/signup">ثبت‌نام</Link>
        </div>
      </div>
    </main>
  );
}