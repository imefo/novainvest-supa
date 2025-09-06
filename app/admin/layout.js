"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser, isAdminFast } from "@/lib/role";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }) {
  const [ok, setOk] = useState(null); // null=loading, false=deny, true=allow

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await getSessionUser();
        if (!u?.id) { if (alive) setOk(false); return; }
        const isAdmin = await isAdminFast(u.id);
        if (alive) setOk(!!isAdmin);
      } catch {
        if (alive) setOk(false);
      }
    })();
    return () => (alive = false);
  }, []);

  if (ok === null) return <div className="nv-container nv-rtl" style={{paddingTop:24}}>در حال بررسی…</div>;
  if (!ok) return (
    <div className="nv-container nv-rtl" style={{paddingTop:24}}>
      <div className="card">
        <strong>دسترسی غیرمجاز</strong>
        <p className="muted">برای ورود ادمین لازم است.</p>
        <Link href="/login?next=admin" className="btn" style={{marginTop:8}}>ورود</Link>
      </div>
    </div>
  );

  return (
    <div className="nv-rtl" style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:16}}>
      <aside style={{position:"sticky", top:64, alignSelf:"start"}}>
        <div className="card" style={{padding:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div className="nv-home-icon">🛠️</div>
            <strong>پنل ادمین</strong>
          </div>
          <nav style={{display:"grid",gap:6}}>
            <Link className="nv-link" href="/admin">نمای کلی</Link>
            <Link className="nv-link" href="/admin/users">کاربران</Link>
            <Link className="nv-link" href="/admin/plans">پلن‌ها</Link>
            <Link className="nv-link" href="/admin/transactions">تراکنش‌ها</Link>
            <Link className="nv-link" href="/admin/kyc">احراز هویت</Link>
          </nav>
          <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:10}}>
            <Link className="nv-link" href="/dashboard">مشاهده داشبورد کاربر</Link>
          </div>
        </div>
      </aside>
      <main style={{minHeight:"70vh"}}>{children}</main>
    </div>
  );
}