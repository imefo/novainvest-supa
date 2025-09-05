"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PlansPublicPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      // فقط پلن‌های فعال را بگیر
      const { data, error } = await supabase
        .from("plans")
        .select("id,name,description,type,profit_percent,duration_days,min_amount,max_amount")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error) setRows(data || []);
      setLoading(false);
    })();
  },[]);

  return (
    <section className="section">
      <div className="container">
        <h1 style={{marginBottom:12}}>پلن‌ها</h1>

        {loading ? (
          <div className="glass card">درحال بارگذاری…</div>
        ) : rows.length ? (
          <div className="grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
            {rows.map((p)=>(
              <div key={p.id} className="glass card">
                <div className="muted" style={{marginBottom:6}}>{labelType(p.type)}</div>
                <h3 style={{margin:"0 0 8px 0"}}>{p.name}</h3>
                {p.description && <p className="muted" style={{marginTop:0}}>{p.description}</p>}
                <div className="row gap8" style={{marginTop:8,flexWrap:"wrap"}}>
                  <Badge>سود: {Number(p.profit_percent)}٪</Badge>
                  <Badge>{p.duration_days} روزه</Badge>
                  <Badge>حداقل: {Number(p.min_amount).toLocaleString("fa-IR")}</Badge>
                  {p.max_amount != null && <Badge>حداکثر: {Number(p.max_amount).toLocaleString("fa-IR")}</Badge>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass card">فعلاً پلن فعالی موجود نیست.</div>
        )}
      </div>
    </section>
  );
}

function Badge({children}) {
  return <span style={{
    padding:"4px 8px",
    borderRadius:8,
    border:"1px solid rgba(255,255,255,.18)",
    background:"rgba(255,255,255,.08)",
    fontSize:12
  }}>{children}</span>;
}

function labelType(t) {
  switch (t) {
    case "safe": return "ایمن";
    case "balanced": return "متعادل";
    case "risky": return "ریسکی";
    default: return t || "-";
  }
}