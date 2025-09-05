"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminHome() {
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    txs: 0,
    kycPending: 0,
  });

  useEffect(() => {
    (async () => {
      const users = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      const plans = await supabase
        .from("plans")
        .select("*", { count: "exact", head: true });
      const txs = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });
      const kyc = await supabase
        .from("kyc_submissions")
        .select("status", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        users: users.count ?? 0,
        plans: plans.count ?? 0,
        txs: txs.count ?? 0,
        kycPending: kyc.count ?? 0,
      });
    })();
  }, []);

  return (
    <div className="stack gap16">
      <h1>مدیریت</h1>
      <div className="grid4">
        <div className="glass stat">
          <div className="muted">کاربران</div>
          <strong>{stats.users}</strong>
        </div>
        <div className="glass stat">
          <div className="muted">پلن‌ها</div>
          <strong>{stats.plans}</strong>
        </div>
        <div className="glass stat">
          <div className="muted">تراکنش‌ها</div>
          <strong>{stats.txs}</strong>
        </div>
        <div className="glass stat">
          <div className="muted">KYC در انتظار</div>
          <strong>{stats.kycPending}</strong>
        </div>
      </div>
    </div>
  );
}