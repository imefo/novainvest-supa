"use client";

// لیست پلن‌های کاربر (خریداری‌شده/فعال)
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

function fmtDate(v) {
  try {
    if (!v) return "—";
    const d = new Date(v);
    return d.toLocaleDateString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "—";
  }
}
function fmtNum(n) {
  const x = Number(n || 0);
  return x.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function UserPlansPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 1) کاربر
        const { data: auth } = await supabase.auth.getUser();
        const u = auth?.user;
        if (!u) {
          setLoading(false);
          return;
        }
        if (!alive) return;
        setUser(u);

        // 2) لیست پلن‌ها (join به plans)
        // ستون‌ها را محافظه‌کارانه می‌خوانیم تا اگر بعضی‌شان در اسکیمای شما نبود، UI از کار نیفتد
        const { data, error } = await supabase
          .from("user_plans")
          .select(`
            id,
            user_id,
            plan_id,
            is_active,
            amount_usdt,
            invested_usdt,
            started_at,
            ends_at,
            created_at,
            plans:plans(
              id,
              name,
              type,
              profit_percent,
              duration_days,
              is_active
            )
          `)
          .eq("user_id", u.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          setRows([]);
        } else {
          setRows(data || []);
        }
      } catch (e) {
        console.error(e);
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="admin-wrap">
      <div className="admin-top">
        <div className="admin-breadcrumb">
          <Link className="btn-ghost" href="/dashboard">داشبورد</Link>
          <span className="sep">/</span>
          <span>پلن‌های من</span>
        </div>
        <div>
          <h1 className="admin-title">پلن‌های من</h1>
          <p className="admin-sub">جزئیات پلن‌های فعال و سابق</p>
        </div>
      </div>

      {/* CTA برای خرید پلن جدید */}
      <div style={{display:"flex", gap:12, margin:"12px 0 20px"}}>
        <Link href="/plans" className="nv-btn nv-btn-primary">+ خرید/انتخاب پلن جدید</Link>
        <Link href="/dashboard/transactions" className="nv-btn">تراکنش‌ها</Link>
      </div>

      {/* وضعیت بارگذاری / خالی */}
      {loading ? (
        <div className="empty-glass">در حال بارگذاری...</div>
      ) : rows.length === 0 ? (
        <div className="empty-glass">
          هنوز هیچ پلنی ندارید. از بخش <Link href="/plans">پلن‌ها</Link> یک پلن انتخاب کنید.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>پلن</th>
                <th>نوع</th>
                <th>سرمایه (USDT)</th>
                <th>درصد سود</th>
                <th>مدت (روز)</th>
                <th>وضعیت</th>
                <th>شروع</th>
                <th>پایان</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = r?.plans || {};
                const invested = r?.amount_usdt ?? r?.invested_usdt ?? 0;
                const active = !!r?.is_active;
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{display:"flex", flexDirection:"column"}}>
                        <strong>{p?.name || "—"}</strong>
                        <small className="muted">#{p?.id || r?.plan_id}</small>
                      </div>
                    </td>
                    <td>{p?.type || "—"}</td>
                    <td>{fmtNum(invested)}</td>
                    <td>{p?.profit_percent != null ? `${p.profit_percent}%` : "—"}</td>
                    <td>{p?.duration_days != null ? p.duration_days : "—"}</td>
                    <td>
                      <span className={`badge ${active ? "ok" : "muted"}`}>
                        {active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td>{fmtDate(r?.started_at || r?.created_at)}</td>
                    <td>{fmtDate(r?.ends_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style jsx global>{`
        .admin-table-wrap { overflow:auto; border-radius:16px; border:1px solid rgba(255,255,255,.08); background:rgba(13,16,28,.4); }
        .admin-table { width:100%; border-collapse: collapse; min-width:820px; }
        .admin-table th, .admin-table td { padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.06); text-align:right; }
        .admin-table th { font-weight:700; color:#e5e7eb; background:rgba(255,255,255,.03); position:sticky; top:0; }
        .muted { opacity:.7; font-size:12px; }
        .badge { padding:6px 10px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,.12); }
        .badge.ok { background:rgba(16,185,129,.15); border-color:rgba(16,185,129,.25); }
        .badge.muted { background:rgba(255,255,255,.06); }
        .empty-glass { padding:24px; border-radius:16px; border:1px solid rgba(255,255,255,.08); background:rgba(13,16,28,.4); }
        .sep { opacity:.5; margin:0 8px; }
      `}</style>
    </div>
  );
}