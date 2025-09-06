"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminHome() {
  const [ok, setOk]     = useState(false);
  const [err, setErr]   = useState(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) { window.location.href="/login"; return; }
        const { data: isAdmin, error: rpcErr } = await supabase.rpc("is_admin", { uid: user.id });
        if (rpcErr) throw rpcErr;
        if (!isAdmin) { window.location.href="/dashboard"; return; }
        if (live) setOk(true);
      } catch (e) {
        if (live) setErr(e.message || "مشکل ناشناخته");
      }
    })();
    return () => { live = false; };
  }, []);

  if (err) {
    return (
      <main className="nv-container nv-rtl">
        <div className="nv-alert">
          <strong>خطا</strong>
          <p>مشکلی پیش آمد: {err}</p>
          <button className="btn" onClick={()=>location.reload()}>تلاش مجدد</button>
        </div>
      </main>
    );
  }

  if (!ok) return (
    <main className="nv-container nv-rtl"><div className="nv-loading">در حال بررسی…</div></main>
  );

  return (
    <main className="nv-container nv-rtl">
      <div className="nv-grid-3">
        <Link className="nv-card link" href="/admin/users">کاربران</Link>
        <Link className="nv-card link" href="/admin/plans">پلن‌ها</Link>
        <Link className="nv-card link" href="/admin/transactions">تراکنش‌ها</Link>
        <Link className="nv-card link" href="/admin/kyc">احراز هویت</Link>
      </div>
    </main>
  );
}