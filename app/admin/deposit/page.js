"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDeposits() {
  const [destUSDT, setDestUSDT] = useState("");
  const [destTRX, setDestTRX] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      // load settings
      const { data: s } = await supabase.from("deposit_settings").select("currency,destination_wallet");
      (s||[]).forEach(v=>{
        if (v.currency==="USDT") setDestUSDT(v.destination_wallet||"");
        if (v.currency==="TRX")  setDestTRX(v.destination_wallet||"");
      });
      // load deposits
      const { data: d } = await supabase
        .from("deposits")
        .select("id, created_at, user_id, currency, network, amount, user_wallet_addr, tx_hash, status")
        .order("created_at",{ascending:false});
      if (alive) setRows(d||[]);
    })();
    return ()=>{alive=false};
  }, []);

  async function saveSettings() {
    await supabase.from("deposit_settings")
      .upsert([{currency:"USDT", destination_wallet:destUSDT},{currency:"TRX", destination_wallet:destTRX}], { onConflict: "currency" });
    alert("تنظیمات ذخیره شد.");
  }

  async function setStatus(id, status){
    await supabase.from("deposits").update({status}).eq("id", id);
    setRows(r=>r.map(x=>x.id===id?{...x,status}:x));
  }

  return (
    <div className="card glass p-4">
      <h2 className="h2 mb-3">واریزها (ادمین)</h2>

      <div className="grid" style={{gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"}}>
        <div>
          <div className="label">آدرس مقصد USDT (TRC20)</div>
          <input className="input ltr" value={destUSDT} onChange={e=>setDestUSDT(e.target.value)} />
        </div>
        <div>
          <div className="label">آدرس مقصد TRON (TRX)</div>
          <input className="input ltr" value={destTRX} onChange={e=>setDestTRX(e.target.value)} />
        </div>
      </div>
      <div className="mt-3">
        <button className="nv-btn nv-btn-primary" onClick={saveSettings}>ذخیره تنظیمات</button>
      </div>

      <hr className="sep"/>

      <div className="table-like">
        <div className="t-head">
          <div>کاربر</div><div>ارز</div><div>مقدار</div><div>Tx/Wallet</div><div>وضعیت</div><div>عملیات</div>
        </div>
        {rows.map(r=>(
          <div key={r.id} className="t-row">
            <div className="mono">{r.user_id.slice(0,8)}…</div>
            <div>{r.currency} <small>{r.network}</small></div>
            <div>{r.amount}</div>
            <div className="mono">{r.tx_hash || r.user_wallet_addr || "—"}</div>
            <div>{r.status}</div>
            <div className="flex" style={{gap:8}}>
              <button className="nv-btn" onClick={()=>setStatus(r.id,"rejected")}>رد</button>
              <button className="nv-btn nv-btn-primary" onClick={()=>setStatus(r.id,"approved")}>تایید</button>
            </div>
          </div>
        ))}
        {!rows.length && <div className="muted">رکوردی نیست.</div>}
      </div>
    </div>
  );
}