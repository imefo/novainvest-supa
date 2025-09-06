"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminOverview() {
  const [m, setM] = useState({ users:0, plans:0, txAll:0, kycPending:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      const [{ count: users = 0 }, { count: plans = 0 }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("plans").select("*", { count: "exact", head: true }),
      ]).then(res => res.map(r => ({ count: r?.count || 0 }))).catch(()=>[{count:0},{count:0}]);

      // تراکنش‌ها و KYC (اگر جدول kyc وجود دارد)
      let txAll = 0, kycPending = 0;
      try {
        const tx = await supabase.from("transactions").select("*", { count:"exact", head:true });
        txAll = tx?.count || 0;
      } catch {}
      try {
        const kyc = await supabase.from("kyc").select("*", { count:"exact", head:true }).eq("status","pending");
        kycPending = kyc?.count || 0;
      } catch {}

      if (alive) setM({ users, plans, txAll, kycPending });
      if (alive) setLoading(false);
    })();
    return () => (alive = false);
  }, []);

  return (
    <div className="nv-container nv-rtl" style={{paddingTop:24}}>
      <h2 className="section-title">نمای کلی</h2>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <div className="card">
          <div className="muted">کاربران</div>
          <div style={{fontSize:28,fontWeight:800}}>{m.users}</div>
        </div>
        <div className="card">
          <div className="muted">پلن‌ها</div>
          <div style={{fontSize:28,fontWeight:800}}>{m.plans}</div>
        </div>
        <div className="card">
          <div className="muted">تراکنش‌ها</div>
          <div style={{fontSize:28,fontWeight:800}}>{m.txAll}</div>
        </div>
        <div className="card">
          <div className="muted">KYC در انتظار</div>
          <div style={{fontSize:28,fontWeight:800}}>{m.kycPending}</div>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        {loading ? "در حال بارگذاری…" : "همه‌چیز آماده است. از منوی سمت چپ یکی از بخش‌ها را انتخاب کنید."}
      </div>
    </div>
  );
}