"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.pass.value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data.user;
      // اگر ادمین بود → /admin
      const { data: isAdm } = await supabase.rpc("is_admin", { uid: user.id });
      router.replace(isAdm ? "/admin" : "/dashboard");
    } catch (er) {
      setErr(er.message || "مشکلی پیش آمده.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ minHeight:"calc(100dvh - 64px - 80px)", display:"grid", placeItems:"center" }}>
      <div className="card" style={{ width:"100%", maxWidth:520, padding:24, borderRadius:20 }}>
        <h1 style={{ margin:0, marginBottom:6, fontSize:24 }}>ورود به حساب</h1>
        <p className="muted" style={{ marginTop:0, marginBottom:14 }}>ایمیل و رمز عبور خود را وارد کنید.</p>

        {err && <div className="card" style={{ borderColor:"rgba(239,68,68,.5)", background:"rgba(239,68,68,.12)", marginBottom:10 }}>{err}</div>}

        <form onSubmit={onSubmit}>
          <label className="tiny" htmlFor="email">ایمیل</label>
          <input id="email" name="email" type="email" required placeholder="example@email.com" />
          <label className="tiny" htmlFor="pass" style={{ marginTop:10 }}>رمز عبور</label>
          <input id="pass" name="pass" type="password" required placeholder="••••••••" />
          <button className="btn btn-gold btn-block" type="submit" style={{ marginTop:12 }} disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="tiny" style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
          <span>حساب ندارید؟ <Link href="/signup">ثبت‌نام</Link></span>
          <Link href="/forgot">فراموشی رمز؟</Link>
        </div>
      </div>
    </section>
  );
}