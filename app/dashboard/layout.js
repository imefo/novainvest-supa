"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!alive) return;
      setEmail(user?.email || "");
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="nv-container" style={{display:"grid", gridTemplateColumns:"1fr 280px", gap:16}}>
      <main>{children}</main>

      <aside style={{
        padding:12, borderRadius:12, border:"1px solid rgba(255,255,255,.08)",
        background:"rgba(10,13,24,.35)", backdropFilter:"blur(10px)"
      }}>
        <div style={{fontWeight:700, marginBottom:8}}>NovalInvest</div>
        <div style={{fontSize:12, opacity:.8, marginBottom:12}}>{email}</div>
        <nav style={{display:"grid", gap:8}}>
          <Link className="nv-btn" href="/dashboard">داشبورد</Link>
          <Link className="nv-btn" href="/dashboard/transactions">تراکنش‌ها</Link>
          <Link className="nv-btn" href="/plans">پلن‌ها</Link>
          <Link className="nv-btn" href="/deposit">واریز</Link>
          <button
            className="nv-btn"
            onClick={async () => { await supabase.auth.signOut(); window.location.href="/"; }}
          >
            خروج
          </button>
        </nav>
      </aside>
    </div>
  );
}