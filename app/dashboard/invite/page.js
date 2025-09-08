"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InvitePage(){
  const [loading,setLoading] = useState(true);
  const [code,setCode] = useState("");
  const [count,setCount] = useState(0);

  useEffect(()=>{
    let alive = true;
    (async ()=>{
      const { data: u } = await supabase.auth.getUser();
      const user = u?.user;
      if(!user){ window.location.href="/login?to=/dashboard/invite"; return; }

      const { data: p } = await supabase
        .from("profiles").select("referral_code").eq("user_id", user.id).single();

      const { count: c } = await supabase
        .from("referrals").select("id", { count:"exact", head:true })
        .eq("inviter_id", user.id);

      if(!alive) return;
      setCode(p?.referral_code || "");
      setCount(c ?? 0);
      setLoading(false);
    })();
    return ()=>{ alive=false; }
  },[]);

  const link = typeof window !== "undefined" && code
    ? `${window.location.origin}/signup?ref=${code}` : "";

  return (
    <div className="nv-container">
      <h1>دعوت دوستان</h1>

      <div className="card glass">
        <div className="muted tiny">لینک اختصاصی شما</div>
        <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
          <input className="glass-input" readOnly value={link} />
          <button className="btn" onClick={()=> link && navigator.clipboard.writeText(link)}>کپی</button>
        </div>
        <div className="muted tiny" style={{ marginTop:8 }}>
          هر کاربر جدید با این لینک ثبت‌نام کند، <b>0.5 USDT</b> بونوس می‌گیرد.
        </div>
      </div>

      <div className="card glass" style={{ marginTop:12 }}>
        <div>تعداد دعوت‌های شما: <b>{count}</b></div>
      </div>
    </div>
  );
}