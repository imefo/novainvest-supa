// app/login/page.js
"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;

      const uid = data?.user?.id;
      let to = "/dashboard";
      if (uid) {
        const ok = await isAdminFast(uid, 2500);
        if (ok) to = "/admin";
      }
      r.replace(to);
    } catch (e) {
      setErr(e?.message || "خطا در ورود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="glass-card" onSubmit={onSubmit} style={{ maxWidth: 520, width: "100%" }}>
        <h1 style={{ marginTop: 0 }}>ورود</h1>
        <input placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="رمز عبور" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        {err && <div className="err">{err}</div>}
        <button className="nv-btn nv-btn-primary" disabled={busy}>
          {busy ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}