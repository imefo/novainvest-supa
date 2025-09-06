"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginInner() {
  const q = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")||"").trim();
    const password = String(fd.get("password")||"");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    location.href = "/dashboard";
  }

  useEffect(()=>{ if(q.get("next")==="admin") document.querySelector("h1")?.scrollIntoView({behavior:"smooth"}); },[q]);

  return (
    <main className="nv-rtl">
      <div className="container" style={{display:"grid",placeItems:"center",minHeight:"70vh"}}>
        <form onSubmit={onSubmit} className="card" style={{width:"100%",maxWidth:420,display:"grid",gap:12}}>
          <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"center",marginBottom:6}}>
            <div className="nv-home-icon">🏠</div>
            <strong className="nv-title">NovaInvest</strong>
          </div>
          <h1 style={{textAlign:"center",margin:0}}>ورود</h1>
          {err && <div className="card" style={{borderColor:"#ef4444"}}>{err}</div>}
          <div>
            <label style={{display:"block",marginBottom:6,color:"#cbd5e1"}}>ایمیل</label>
            <input className="input" type="email" name="email" required placeholder="you@mail.com"/>
          </div>
          <div>
            <label style={{display:"block",marginBottom:6,color:"#cbd5e1"}}>رمز عبور</label>
            <input className="input" type="password" name="password" required placeholder="••••••••"/>
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading?"لطفاً صبر کنید…":"ورود"}</button>

          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <a href="/forgot" className="nv-link">فراموشی رمز؟</a>
            <a href="/signup" className="nv-link">ثبت‌نام</a>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{padding:16}}>در حال بارگذاری…</div>}>
      <LoginInner />
    </Suspense>
  );
}