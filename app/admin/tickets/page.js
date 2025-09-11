"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminTicketsPage(){
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("open");
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, [filter]);

  async function load(){
    const q = supabase
      .from("tickets")
      .select("id, subject, status, priority, category, created_at, user_id, profiles:profiles(full_name,email)")
      .order("created_at", { ascending: false });
    const { data, error } = await (filter==="all" ? q : q.eq("status", filter));
    if (!error) setItems(data || []);
  }

  async function sendReply(ticketId){
    if (!replyText.trim()) return;
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      user_id: user?.id || null,
      role: "admin",
      message: replyText.trim(),
    });
    // وقتی پاسخ دادیم، وضعیت رو answered کنیم اگر بسته نیست
    await supabase.from("tickets").update({ status: "answered" }).eq("id", ticketId);
    setReplyText("");
    setReplyFor(null);
    setBusy(false);
  }

  async function changeStatus(ticketId, status){
    await supabase.from("tickets").update({ status }).eq("id", ticketId);
    await load();
  }

  return (
    <div className="nv-container">
      <div className="head-row">
        <h1 className="title">تیکت‌ها</h1>
        <div className="filters">
          <select className="input" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="open">باز</option>
            <option value="answered">پاسخ‌داده‌شده</option>
            <option value="closed">بسته</option>
            <option value="all">همه</option>
          </select>
        </div>
      </div>

      <ul className="ticket-list">
        {items.map(t => (
          <li key={t.id} className="ticket-item glass">
            <div className="ti-left">
              <div className="ti-subj">{t.subject}</div>
              <div className="ti-meta">
                <span className={`chip chip-${t.status}`}>{faStatus(t.status)}</span>
                <span className="chip">{faPriority(t.priority)}</span>
                <span className="chip">{faCategory(t.category)}</span>
                <span className="muted">{new Date(t.created_at).toLocaleString()}</span>
                {t.profiles?.full_name && <span className="chip">{t.profiles.full_name}</span>}
                {t.profiles?.email && <span className="chip">{t.profiles.email}</span>}
              </div>
            </div>

            <div className="ti-actions">
              <button className="nv-btn" onClick={()=>setReplyFor(t.id)}>پاسخ</button>
              <button className="nv-btn" onClick={()=>changeStatus(t.id, "open")}>باز</button>
              <button className="nv-btn" onClick={()=>changeStatus(t.id, "answered")}>پاسخ‌داده</button>
              <button className="nv-btn" onClick={()=>changeStatus(t.id, "closed")}>بستن</button>
            </div>

            {replyFor === t.id && (
              <div className="reply-box">
                <textarea
                  className="input"
                  rows={3}
                  placeholder="پاسخ ادمین…"
                  value={replyText}
                  onChange={e=>setReplyText(e.target.value)}
                />
                <div className="row-gap">
                  <button className="nv-btn nv-btn-primary" disabled={busy} onClick={()=>sendReply(t.id)}>
                    {busy ? "در حال ارسال…" : "ارسال پاسخ"}
                  </button>
                  <button className="nv-btn" onClick={()=>{setReplyFor(null); setReplyText("");}}>انصراف</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function faStatus(s){ return s==="open"?"باز":s==="answered"?"پاسخ داده‌شده":s==="closed"?"بسته":"نامشخص"; }
function faPriority(p){ return p==="high"?"بالا":p==="normal"?"معمولی":"کم"; }
function faCategory(c){
  switch(c){
    case "deposit": return "واریز";
    case "withdrawal": return "برداشت";
    case "kyc": return "احراز هویت";
    case "plans": return "پلن‌ها";
    default: return "عمومی";
  }
}