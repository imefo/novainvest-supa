"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, is_blocked, usdt_balance, referrals_count")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) setMsg(error.message);
    else setRows(data || []);
  };

  useEffect(() => { load(); }, []);

  const block = async (uid, blocked) => {
    const { error } = await supabase.rpc("admin_block_user", { target: uid, blocked });
    if (error) return alert(error.message);
    load();
  };

  const setBalance = async (uid) => {
    const v = prompt("New USDT balance:");
    if (v == null) return;
    const amt = Number(v);
    const { error } = await supabase.rpc("admin_set_balance", { target: uid, new_balance: amt });
    if (error) return alert(error.message);
    load();
  };

  const incBalance = async (uid, sign) => {
    const v = prompt(sign>0 ? "Add USDT amount:" : "Subtract USDT amount:");
    if (v == null) return;
    const delta = sign>0 ? Math.abs(Number(v)) : -Math.abs(Number(v));
    const { error } = await supabase.rpc("admin_inc_balance", { target: uid, delta, note: "manual" });
    if (error) return alert(error.message);
    load();
  };

  const setRefs = async (uid) => {
    const v = prompt("New referrals count:");
    if (v == null) return;
    const n = parseInt(v, 10);
    const { error } = await supabase.rpc("admin_set_referrals", { target: uid, new_count: n });
    if (error) return alert(error.message);
    load();
  };

  return (
    <div className="nv-container">
      <h1 className="nv-h1">کاربران</h1>
      {loading ? <p>در حال بارگذاری...</p> : null}
      {msg && <p className="nv-err">{msg}</p>}
      <div className="nv-card">
        <table className="nv-table">
          <thead>
            <tr>
              <th>ایمیل</th><th>نام</th><th>USDT</th><th>دعوتی‌ها</th><th>وضعیت</th><th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.user_id}>
                <td>{r.email}</td>
                <td>{r.full_name || "-"}</td>
                <td>{Number(r.usdt_balance).toFixed(2)}</td>
                <td>{r.referrals_count}</td>
                <td>{r.is_blocked ? "مسدود" : "فعال"}</td>
                <td className="nv-actions">
                  <button onClick={()=>block(r.user_id, !r.is_blocked)} className="nv-btn">
                    {r.is_blocked ? "آزاد" : "مسدود"}
                  </button>
                  <button onClick={()=>incBalance(r.user_id, +1)} className="nv-btn">+USDT</button>
                  <button onClick={()=>incBalance(r.user_id, -1)} className="nv-btn">-USDT</button>
                  <button onClick={()=>setBalance(r.user_id)} className="nv-btn">Set USDT</button>
                  <button onClick={()=>setRefs(r.user_id)} className="nv-btn">Set دعوتی</button>
                </td>
              </tr>
            ))}
            {!rows.length && !loading ? <tr><td colSpan={6} style={{textAlign:"center"}}>کاربری یافت نشد</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}