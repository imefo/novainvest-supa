"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    const email = e.currentTarget.email.value.trim();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });
      if (error) throw error;
      setSent(true);
    } catch (er) {
      setErr(er.message || "ارسال لینک ناموفق.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ minHeight:"calc(100dvh - 64px - 80px)", display:"grid", placeItems:"center" }}>
      <div className="card" style={{ width:"100%", maxWidth:520, padding:24, borderRadius:20 }}>
        <h1 style={{ margin:0, marginBottom:6, fontSize:24 }}>فراموشی رمز عبور</h1>
        <p className="muted" style={{ marginTop:0, marginBottom:14 }}>ایمیل خود را وارد کنید.</p>

        {err && <div className="card" style={{ borderColor:"rgba(239,68,68,.5)", background:"rgba(239,68,68,.12)", marginBottom:10 }}>{err}</div>}
        {sent ? (
          <div className="card" style={{ borderColor:"rgba(34,197,94,.5)", background:"rgba(34,197,94,.12)" }}>
            اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی ارسال شد.
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <label className="tiny" htmlFor="email">ایمیل</label>
            <input id="email" name="email" type="email" required placeholder="example@email.com" />
            <button className="btn btn-primary btn-block" type="submit" style={{ marginTop:12 }} disabled={loading}>
              {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
            </button>
          </form>
        )}

        <p className="tiny" style={{ textAlign:"center", marginTop:12 }}>
          <Link href="/login">بازگشت به ورود</Link>
        </p>
      </div>
    </section>
  );
}