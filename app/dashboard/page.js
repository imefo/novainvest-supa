"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUser(user);
    })();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!user) {
    return (
      <section className="section" style={{ minHeight:"calc(100dvh - 64px - 80px)", display:"grid", placeItems:"center" }}>
        <div className="card">در حال بارگذاری…</div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>داشبورد</h2>
          <p className="muted" style={{ marginTop: 6 }}>ورود با: {user.email}</p>
          <button className="btn" onClick={signOut} style={{ marginTop: 12 }}>خروج</button>
        </div>
      </div>
    </section>
  );
}