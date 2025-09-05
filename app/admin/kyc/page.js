"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminKYC() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("pending");

  async function load() {
    let q = supabase
      .from("kyc_submissions")
      .select("id,user_id,doc_url,note,status,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows(data || []);
  }
  useEffect(() => { load(); }, [filter]);

  async function setStatus(id, status) {
    await supabase.from("kyc_submissions").update({ status }).eq("id", id);
    load();
  }

  return (
    <div className="stack gap16">
      <h1>احراز هویت</h1>
      <div className="row gap8">
        <select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="pending">در انتظار</option>
          <option value="approved">تایید شده</option>
          <option value="rejected">رد شده</option>
          <option value="all">همه</option>
        </select>
      </div>
      <div className="glass card">
        <div className="table">
          <div className="thead">
            <div>ID</div><div>کاربر</div><div>مدرک</div><div>یادداشت</div><div>وضعیت</div><div>اعمال</div>
          </div>
          {rows.map(r => (
            <div key={r.id} className="trow">
              <div className="muted">{r.id.slice(0,8)}…</div>
              <div className="muted">{r.user_id.slice(0,8)}…</div>
              <div><a className="link" target="_blank" href={r.doc_url}>مشاهده</a></div>
              <div className="muted">{r.note || "-"}</div>
              <div>{r.status}</div>
              <div className="row gap6">
                <button className="btn" onClick={() => setStatus(r.id, "approved")}>تایید</button>
                <button className="btn" onClick={() => setStatus(r.id, "rejected")}>رد</button>
                <button className="btn" onClick={() => setStatus(r.id, "pending")}>بازگشت به انتظار</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}