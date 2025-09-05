"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminTransactions() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");

  async function load() {
    let q = supabase.from("transactions")
      .select("id,user_id,type,amount,status,created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows(data || []);
  }
  useEffect(() => { load(); }, [filter]);

  async function setStatus(id, status) {
    await supabase.from("transactions").update({ status }).eq("id", id);
    load();
  }

  return (
    <div className="stack gap16">
      <h1>تراکنش‌ها</h1>
      <div className="row gap8">
        <select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">همه وضعیت‌ها</option>
          <option value="pending">در انتظار</option>
          <option value="done">انجام شده</option>
          <option value="canceled">لغو</option>
        </select>
      </div>

      <div className="glass card">
        <div className="table">
          <div className="thead">
            <div>ID</div><div>کاربر</div><div>نوع</div><div>مبلغ</div><div>وضعیت</div><div>تاریخ</div><div>اعمال</div>
          </div>
          {rows.map((t) => (
            <div key={t.id} className="trow">
              <div className="muted">{t.id.slice(0,8)}…</div>
              <div className="muted">{t.user_id.slice(0,8)}…</div>
              <div>{t.type}</div>
              <div>{t.amount}</div>
              <div>{t.status}</div>
              <div className="muted">{new Date(t.created_at).toLocaleString("fa-IR")}</div>
              <div className="row gap6">
                <button className="btn" onClick={() => setStatus(t.id, "done")}>تایید</button>
                <button className="btn" onClick={() => setStatus(t.id, "canceled")}>لغو</button>
                <button className="btn" onClick={() => setStatus(t.id, "pending")}>بازگشت به انتظار</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}