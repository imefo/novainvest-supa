"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { setRefCookie } from "@/lib/referral";

// ذخیره ref در کوکی (بعد از importها، نه قبلش)
useEffect(() => {
  try {
    const ref = new URL(window.location.href).searchParams.get("ref");
    if (ref) setRefCookie(ref, 30);
  } catch {}
}, []);
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PlansPublicPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("plans")
          .select("id,name,description,type,profit_percent,duration_days,min_amount,is_active")
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (!ignore) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("plans load error:", e);
        if (!ignore) setErr("خطا در دریافت پلن‌ها");
      }
    })();
    return () => { ignore = true; };
  }, []);

  const fmtNum = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "0";
    try { return n.toLocaleString("fa-IR"); } catch { return String(n); }
  };

  return (
    <section dir="rtl">
      <h1>پلن‌های فعال</h1>
      {err ? <div className="err">{err}</div> : null}
      <div className="plans-grid">
        {rows.map((p) => (
          <div key={p?.id || Math.random()} className="card">
            <h3>{p?.name ?? "بدون نام"}</h3>
            <div className="muted">{p?.type ?? "-"}</div>
            <p>{p?.description ?? ""}</p>
            <div className="muted">
              سود: {fmtNum(p?.profit_percent)}% • مدت: {fmtNum(p?.duration_days)} روز • حداقل: {fmtNum(p?.min_amount)}
            </div>
          </div>
        ))}
        {rows.length === 0 && !err && <div className="muted">پلن فعالی موجود نیست.</div>}
      </div>
    </section>
  );
}