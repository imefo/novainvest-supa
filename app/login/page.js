// app/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    router.replace("/dashboard"); // بعد از ورود برو به داشبورد
  };

  return (
    <section className="container" style={{ padding: "40px 0" }}>
      <h1>Sign in</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={{ width: "100%", height: 44, marginBottom: 12, padding: "0 12px" }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          style={{ width: "100%", height: 44, marginBottom: 12, padding: "0 12px" }}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {err && <p className="muted" style={{ color: "tomato", marginTop: 12 }}>{err}</p>}
      </form>
    </section>
  );
}