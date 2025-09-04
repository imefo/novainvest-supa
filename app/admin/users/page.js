"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("balance", { ascending: false });
    if (!error) setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function adjust(user_id, amount, kind = "adjust") {
    const note = prompt("توضیح (دلخواه):") || null;
    const { error } = await supabase.rpc("admin_adjust_balance", {
      uid: user_id,
      delta: Number(amount),
      note,
      kind,
    });
    if (error) alert(error.message);
    await load();
  }

  async function toggleBlock(user_id, is_blocked) {
    const { error } = await supabase.rpc("admin_set_block", {
      uid: user_id,
      blocked: !is_blocked,
    });
    if (error) alert(error.message);
    await load();
  }

  async function setKyc(user_id) {
    const status = prompt("وضعیت KYC را وارد کن: pending | approved | rejected", "approved");
    if (!status) return;
    const { error } = await supabase.rpc("admin_set_kyc", {
      uid: user_id,
      new_status: status,
    });
    if (error) alert(error.message);
    await load();
  }

  const filtered = rows.filter(r =>
    !q || (r.email || "").toLowerCase().includes(q.toLowerCase()) || (r.full_name || "").includes(q)
  );

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>مدیریت کاربران</h2>

          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input placeholder="جستجو ایمیل/نام…" value={q} onChange={e=>setQ(e.target.value)} />
            <button className="btn" onClick={load}>بازخوانی</button>
          </div>

          {loading ? "در حال بارگذاری…" : (
            <div style={{ overflowX:"auto" }}>
              <table className="table" style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <th>کاربر</th>
                    <th>ایمیل</th>
                    <th>موجودی</th>
                    <th>ادمین</th>
                    <th>مسدود</th>
                    <th>KYC</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.user_id}>
                      <td>{u.full_name || "-"}</td>
                      <td>{u.email || "-"}</td>
                      <td>{Number(u.balance).toLocaleString("fa-IR")}</td>
                      <td>{u.is_admin ? "✅" : "—"}</td>
                      <td>{u.is_blocked ? "⛔️" : "✅"}</td>
                      <td>
                        <button className="btn tiny" onClick={()=>setKyc(u.user_id)}>KYC</button>
                      </td>
                      <td style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <button className="btn tiny" onClick={()=>adjust(u.user_id, +prompt("مبلغ افزایش؟","100000") || 0, "adjust")}>+ افزایش</button>
                        <button className="btn tiny" onClick={()=>adjust(u.user_id, -(+prompt("مبلغ کسر؟","100000") || 0), "adjust")}>− کسر</button>
                        <button className="btn tiny" onClick={()=>adjust(u.user_id, +prompt("سود (profit)؟","50000") || 0, "profit")}>سود</button>
                        <button className="btn tiny" onClick={()=>toggleBlock(u.user_id, u.is_blocked)}>{u.is_blocked ? "آزاد" : "مسدود"}</button>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr><td colSpan={7} style={{ textAlign:"center", padding:16 }}>موردی یافت نشد.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}