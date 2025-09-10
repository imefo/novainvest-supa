"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDepositConfig() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("deposit_config").select("*").order("currency");
    setLoading(false);
    if (error) setMsg(error.message); else setRows(data||[]);
  };
  useEffect(()=>{ load(); }, []);

  const save = async (currency, network) => {
    const address = prompt(`آدرس برای ${currency} / ${network}:`, rows.find(r=>r.currency===currency && r.network===network)?.address || "");
    if (address == null) return;
    const { error } = await supabase.rpc("admin_set_deposit_config", {
      p_currency: currency, p_network: network, p_address: address, p_active: true
    });
    if (error) return alert(error.message);
    load();
  };

  return (
    <div className="nv-container">
      <h1 className="nv-h1">تنظیمات واریز</h1>
      {msg && <p className="nv-err">{msg}</p>}
      <div className="nv-card">
        <table className="nv-table">
          <thead><tr><th>ارز</th><th>شبکه</th><th>آدرس</th><th>وضعیت</th><th>ویرایش</th></tr></thead>
          <tbody>
            {[
              {currency:"USDT", network:"TRC20"},
              {currency:"TRX", network:"TRON"},
            ].map(x=>{
              const r = rows.find(z=>z.currency===x.currency && z.network===x.network);
              return (
                <tr key={x.currency+x.network}>
                  <td>{x.currency}</td>
                  <td>{x.network}</td>
                  <td style={{maxWidth:340,overflow:"hidden",textOverflow:"ellipsis"}}>{r?.address || "-"}</td>
                  <td>{r?.is_active ? "فعال" : "غیرفعال"}</td>
                  <td><button className="nv-btn" onClick={()=>save(x.currency, x.network)}>ویرایش</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}