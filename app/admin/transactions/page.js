"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function Section({title, rows, onApprove, onReject}) {
  return (
    <div className="nv-card" style={{marginTop:16}}>
      <h3>{title}</h3>
      <table className="nv-table">
        <thead>
          <tr><th>کاربر</th><th>مقدار</th><th>ارز</th><th>شبکه</th><th>Tx</th><th>اسکرین</th><th>وضعیت</th><th>عملیات</th></tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id}>
              <td>{r.user_email || r.user_id}</td>
              <td>{r.amount}</td>
              <td>{r.currency}</td>
              <td>{r.network}</td>
              <td style={{maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}}>{r.tx_hash || "-"}</td>
              <td>{r.screenshot_url ? <a href={r.screenshot_url} target="_blank">مشاهده</a> : "-"}</td>
              <td>{r.status}</td>
              <td className="nv-actions">
                {r.status === "pending" && (
                  <>
                    <button className="nv-btn" onClick={()=>onApprove(r.id)}>تایید</button>
                    <button className="nv-btn" onClick={()=>onReject(r.id)}>رد</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={8} style={{textAlign:"center"}}>موردی نیست</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminTransactions() {
  const [deposits, setDeposits] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: d } = await supabase
      .from("deposits")
      .select("id, user_id, amount, currency, network, tx_hash, screenshot_url, status, created_at, users!inner(email)")
      .order("created_at", { ascending:false })
      .limit(200);
    const { data: w } = await supabase
      .from("withdrawals")
      .select("id, user_id, amount, currency, network, address, status, created_at, users!inner(email)")
      .order("created_at", { ascending:false })
      .limit(200);

    setDeposits((d||[]).map(x=>({ ...x, user_email: x.users?.email })));
    setWithdraws((w||[]).map(x=>({ ...x, user_email: x.users?.email })));
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  const approveDeposit = async (id) => {
    const { error } = await supabase.rpc("admin_review_deposit", { dep_id: id, approve: true });
    if (error) return alert(error.message);
    load();
  };
  const rejectDeposit = async (id) => {
    const { error } = await supabase.rpc("admin_review_deposit", { dep_id: id, approve: false });
    if (error) return alert(error.message);
    load();
  };
  const approveWithdraw = async (id) => {
    const { error } = await supabase.rpc("admin_review_withdraw", { w_id: id, approve: true });
    if (error) return alert(error.message);
    load();
  };
  const rejectWithdraw = async (id) => {
    const { error } = await supabase.rpc("admin_review_withdraw", { w_id: id, approve: false });
    if (error) return alert(error.message);
    load();
  };

  return (
    <div className="nv-container">
      <h1 className="nv-h1">تراکنش‌ها</h1>
      {loading ? <p>در حال بارگذاری...</p> : null}

      <Section
        title="واریزها"
        rows={deposits}
        onApprove={approveDeposit}
        onReject={rejectDeposit}
      />
      <Section
        title="برداشت‌ها"
        rows={withdraws}
        onApprove={approveWithdraw}
        onReject={rejectWithdraw}
      />
    </div>
  );
}