"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // اگر لاگین است، بفرست به داشبورد (ادمین لینک بالاست)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const next = params.get("next");
        router.replace(next || "/dashboard");
      }
    })();
  }, [router, params]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }
    const next = params.get("next");
    router.replace(next || "/dashboard");
  }

  return (
    <section className="section">
      <div className="container">
        <form onSubmit={onSubmit} className="glass card stack gap12" style={{maxWidth:420, margin:"40px auto"}}>
          <h2 style={{margin:"0 0 6px 0"}}>ورود</h2>
          {err && <div className="alert">{err}</div>}

          <input
            className="input"
            type="email"
            placeholder="ایمیل"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="رمز عبور"
            value={pass}
            onChange={(e)=>setPass(e.target.value)}
            required
          />

          <button className="btn-primary" disabled={loading}>{loading ? "…" : "ورود"}</button>

          <div className="row gap8 muted" style={{justifyContent:"space-between"}}>
            <a href="/forgot">فراموشی رمز</a>
            <a href="/signup">حساب ندارید؟ ثبت‌نام</a>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container"><div className="glass p24">در حال بارگذاری…</div></div>}>
      <LoginInner />
    </Suspense>
  );
}