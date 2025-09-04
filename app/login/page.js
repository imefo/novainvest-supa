"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    setLoading(true);

    const full_name = e.currentTarget.name.value.trim();
    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.pass.value;

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name } }
    });

    setLoading(false);

    if (error) { setErr(error.message || "ثبت‌نام ناموفق."); return; }

    // اگر ایمیل‌وریفای روشن باشد، سشن نمی‌دهد → پیام بده
    if (!data.session) {
      setMsg("لینک تأیید به ایمیل شما ارسال شد. لطفاً ایمیل خود را چک کنید.");
      return;
    }
    // در غیر اینصورت وارد شده → برو داشبورد
    router.push("/dashboard");
  };

  return (
    <section className="section" style={{ minHeight: "calc(100dvh - 64px - 80px)", display:"grid", placeItems:"center" }}>
      <div className="card" style={{ width:"100%", maxWidth:560, padding:24, borderRadius:20 }}>
        <h1 style={{ margin:0, marginBottom:6, fontSize:24 }}>ثبت‌نام</h1>
        <p className="muted" style={{ marginTop:0, marginBottom:14 }}>حساب جدید بسازید.</p>

        {err && <div className="card" style={{ borderColor:"rgba(239,68,68,.5)", background:"rgba(239,68,68,.12)", marginBottom:10 }}>{err}</div>}
        {msg && <div className="card" style={{ borderColor:"rgba(34,197,94,.5)", background:"rgba(34,197,94,.12)", marginBottom:10 }}>{msg}</div>}

        <form onSubmit={onSubmit}>
          <label className="tiny" htmlFor="name">نام و نام خانوادگی</label>
          <input id="name" name="name" type="text" placeholder="مثال: علی رضایی" required />

          <label className="tiny" htmlFor="email" style={{ marginTop:10 }}>ایمیل</label>
          <input id="email" name="email" type="email" placeholder="example@email.com" required />

          <label className="tiny" htmlFor="pass" style={{ marginTop:10 }}>رمز عبور</label>
          <input id="pass" name="pass" type="password" placeholder="حداقل ۸ کاراکتر" required />

          <button className="btn btn-gold btn-block" type="submit" style={{ marginTop:12 }} disabled={loading}>
            {loading ? "در حال ساخت حساب..." : "ایجاد حساب"}
          </button>
        </form>

        <p className="tiny" style={{ textAlign:"center", marginTop:12 }}>
          حساب دارید؟ <Link href="/login">ورود</Link>
        </p>
      </div>
    </section>
  );
}