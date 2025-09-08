"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const search = useSearchParams();
  const inviteCode = (search?.get("ref") || "").trim();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSignup(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password: pass,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      const newUser = data?.user;
      if (newUser?.id && inviteCode) {
        await supabase.rpc("apply_referral", {
          invited: newUser.id,
          code: inviteCode,
          // bonus_amount: 0.5  // در صورت تمایل می‌توانی override کنی
        });
      }

      router.push("/dashboard");
    } catch (e) {
      setErr(e.message || "خطا در ثبت‌نام");
    } finally { setLoading(false); }
  }

  return (
    <div className="nv-container" style={{ display:"grid", placeItems:"center", minHeight:"65vh" }}>
      <form onSubmit={onSignup} className="card glass" style={{ width:"100%", maxWidth:520 }}>
        <div className="row-between" style={{ marginBottom:8 }}>
          <div style={{ fontSize:22, fontWeight:800 }}>ثبت‌نام</div>
          {inviteCode && <div className="badge">کد معرف: <b>{inviteCode}</b></div>}
        </div>

        {err && <div className="chip failed" style={{ marginBottom:8 }}>{err}</div>}

        <label className="muted tiny">نام و نام خانوادگی</label>
        <input className="glass-input" value={fullName} onChange={(e)=>setFullName(e.target.value)} required />

        <label className="muted tiny" style={{ marginTop:10 }}>ایمیل</label>
        <input className="glass-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />

        <label className="muted tiny" style={{ marginTop:10 }}>رمز عبور</label>
        <input className="glass-input" type="password" value={pass} onChange={(e)=>setPass(e.target.value)} minLength={6} required />

        <button className="btn btn-primary" disabled={loading} style={{ width:"100%", marginTop:12 }}>
          {loading ? "در حال ایجاد حساب…" : "ایجاد حساب"}
        </button>

        <div style={{ marginTop:10, textAlign:"center" }}>
          حساب دارید؟ <Link href="/login" className="nv-link">ورود</Link>
        </div>
      </form>
    </div>
  );
}