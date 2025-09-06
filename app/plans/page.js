// app/plans/page.js
"use client";
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
        if (!ignore) setRows(data ?? []);
      } catch {
        if (!ignore) setErr("خطا در دریافت پلن‌ها");
      }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <section>
      <h1 className="section-title">پلن‌های فعال</h1>
      {err ? <div className="err">{err}</div> : null}
      <div className="plans-grid">
        {rows.map((p) => (
          <div key={p.id} className="card">
            <h3 style={{ marginTop: 0 }}>{p.name}</h3>
            <div className="muted" style={{ marginBottom: 6 }}>{p.type}</div>
            <p>{p.description}</p>
            <div className="muted">
              سود: {p.profit_percent}% • مدت: {p.duration_days} روز • حداقل: {Number(p.min_amount || 0).toLocaleString()}
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="muted">پلنی موجود نیست.</div>}
      </div>
    </section>
  );
}