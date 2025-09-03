"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; // اگر مسیر lib فرق دارد، تغییر بده

export default function LoginPage(){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const router = useRouter();

  const onSubmit = async (e)=>{
    e.preventDefault(); setErr(null); setLoading(true);
    try{
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      router.push("/dashboard");
    }catch(ex){ setErr(ex.message || "خطا در ورود"); }
    finally{ setLoading(false); }
  };

  return (
    <section className="section" dir="rtl">
      <div className="container">
        <h1 className="section-title">ورود به حساب</h1>
        <form className="glass-card form" onSubmit={onSubmit}>
          {err && <p className="muted" style={{color:"#fca5a5"}}>{err}</p>}
          <label>ایمیل</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <label style={{marginTop:10}}>رمز عبور</label>
          <input className="input" type="password" value={pass} onChange={e=>setPass(e.target.value)} required />
          <button className="glass-btn glass-btn--primary" style={{marginTop:14}} disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </button>
          <p className="muted" style={{marginTop:10}}>
            حساب ندارید؟ <Link href="/login/register" className="glass-btn glass-btn--ghost">ثبت‌نام</Link>
          </p>
        </form>
      </div>
    </section>
  );
}