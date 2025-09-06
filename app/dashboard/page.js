"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [u, setU] = useState(null);
  const [profile, setProfile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [tx, setTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      // کاربر
      const { data: { user } = {} } = await supabase.auth.getUser().catch(()=>({}));
      if (!user) { location.href="/login"; return; }
      if (!alive) return;
      setU({ id: user.id, email: user.email });

      // پروفایل
      try {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (alive) setProfile(p || {});
      } catch { if (alive) setProfile({}); }

      // پلن‌های کاربر
      try {
        const { data: up } = await supabase
          .from("user_plans")
          .select("*, plans(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending:false });
        if (alive) setPlans(up || []);
      } catch { if (alive) setPlans([]); }

      // تراکنش‌های اخیر
      try {
        const { data: t } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending:false })
          .limit(6);
        if (alive) setTx(t || []);
      } catch { if (alive) setTx([]); }

      if (alive) setLoading(false);
    })();
    return () => (alive = false);
  }, []);

  const balance = useMemo(() => Number(profile?.balance || 0), [profile]);
  const activePlans = useMemo(() => (plans || []).filter(p => p?.is_active !== false), [plans]);

  return (
    <div className="nv-container nv-rtl" style={{paddingTop:24}}>
      <h2 className="section-title">داشبورد من</h2>

      {/* کارت‌های خلاصه */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <div className="card">
          <div className="muted">موجودی</div>
          <div style={{fontSize:28,fontWeight:800}}>{balance.toLocaleString()} تومان</div>
        </div>
        <div className="card">
          <div className="muted">پلن‌های فعال</div>
          <div style={{fontSize:28,fontWeight:800}}>{activePlans.length}</div>
        </div>
        <div className="card">
          <div className="muted">تراکنش‌ها</div>
          <div style={{fontSize:28,fontWeight:800}}>{tx.length}</div>
        </div>
        <div className="card">
          <div className="muted">ایمیل</div>
          <div style={{fontWeight:700}}>{u?.email || "-"}</div>
        </div>
      </div>

      {/* پلن‌های من */}
      <div className="card" style={{marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <strong>پلن‌های من</strong>
        </div>

        {loading ? "در حال بارگذاری…" : (plans.length === 0 ? (
          <div className="muted">هنوز پلنی ندارید. از صفحه <a className="nv-link" href="/plans">پلن‌ها</a> شروع کنید.</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="nv-table">
              <thead>
                <tr>
                  <th>نام پلن</th>
                  <th>نوع</th>
                  <th>سود (%)</th>
                  <th>مدت (روز)</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((it) => (
                  <tr key={it.id}>
                    <td>{it.plans?.name || "-"}</td>
                    <td>{it.plans?.type === "safe" ? "امن" : it.plans?.type === "balanced" ? "متعادل" : "ریسکی"}</td>
                    <td>{it.plans?.profit_percent ?? "-"}</td>
                    <td>{it.plans?.duration_days ?? "-"}</td>
                    <td>
                      <span className="badge" style={{
                        background: it.is_active===false ? "rgba(239,68,68,.15)" : "rgba(34,197,94,.15)",
                        border: `1px solid ${it.is_active===false ? "rgba(239,68,68,.35)":"rgba(34,197,94,.35)"}`,
                        color: it.is_active===false ? "#f87171" : "#34d399"
                      }}>
                        {it.is_active===false ? "غیرفعال" : "فعال"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* تراکنش‌های اخیر */}
      <div className="card" style={{marginTop:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <strong>تراکنش‌های اخیر</strong>
          <a className="nv-link" href="/dashboard/transactions">همه تراکنش‌ها</a>
        </div>
        {loading ? "در حال بارگذاری…" : (tx.length === 0 ? (
          <div className="muted">تراکنشی ثبت نشده است.</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table className="nv-table">
              <thead>
                <tr>
                  <th>نوع</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {tx.map((t) => (
                  <tr key={t.id}>
                    <td>{t.type === "deposit" ? "واریز" : t.type === "withdraw" ? "برداشت" : t.type}</td>
                    <td>{Number(t.amount||0).toLocaleString()} تومان</td>
                    <td>{t.status || "-"}</td>
                    <td>{t.created_at ? new Date(t.created_at).toLocaleString("fa-IR") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}