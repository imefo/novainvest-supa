"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardHome() {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let live = true;
    (async ()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      if (live) { setEmail(user.email || ""); setLoading(false); }
    })();
    return ()=>{ live=false; };
  },[]);

  if (loading) return <main className="nv-container nv-rtl"><div className="nv-loading">در حال بارگذاری داشبورد…</div></main>;

  return (
    <main className="nv-container nv-rtl">
      <div className="nv-card">
        <h3>خوش آمدید</h3>
        <p className="muted">{email}</p>
        <div className="nv-quick">
          <Link className="btn" href="/dashboard/transactions">تراکنش‌ها</Link>
          <Link className="btn" href="/plans">پلن‌ها</Link>
        </div>
      </div>
    </main>
  );
}