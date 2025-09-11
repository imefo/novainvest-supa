"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function TicketDetailPage(){
  const { id } = useParams();
  const [me, setMe] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user || null);
      await loadAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadAll(){
    const { data: t } = await supabase
      .from("tickets")
      .select("id, subject, status, priority, category, created_at")
      .eq("id", id).single();
    setTicket(t || null);

    const { data: m } = await supabase
      .from("ticket_messages")
      .select("id, role, message, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });
    setMsgs(m || []);
  }

  async function sendMessage(e){
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSending(false); return; }

    await supabase.from("ticket_messages").insert({
      ticket_id: id,
      user_id: user.id,
      role: "user",
      message: msg.trim(),
    });
    setMsg("");
    setSending(false);
    await loadAll();
  }

  if (!ticket) return <div className="nv-container"><div className="glass card-center">در حال بارگذاری…</div></div>;

  return (
    <div className="nv-container">
      <div className="head-row">
        <div className="breadcrumbs">
          <Link href="/dashboard" className="nv-link">داشبورد</Link>
          <span>/</span>
          <Link href="/dashboard/support" className="nv-link">پشتیبانی</Link>
          <span>/</span>
          <span className="muted">{ticket.subject}</span>
        </div>
        <div className="ti-meta">
          <span className={`chip chip-${ticket.status}`}>{faStatus(ticket.status)}</span>
          <span className="chip">{faPriority(ticket.priority)}</span>
          <span className="chip">{faCategory(ticket.category)}</span>
        </div>
      </div>

      <div className="glass chat-wrap">
        <ul className="chat-thread">
          {msgs.map(m => (
            <li key={m.id} className={`chat-bubble ${m.role === "admin" ? "admin" : "user"}`}>
              <div className="bubble">{m.message}</div>
              <div className="time muted">{new Date(m.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>

        <form onSubmit={sendMessage} className="chat-send">
          <input
            className="input"
            value={msg}
            onChange={e=>setMsg(e.target.value)}
            placeholder="پیامت رو بنویس…"
          />
          <button className="nv-btn nv-btn-primary" disabled={sending}>
            {sending ? "در حال ارسال…" : "ارسال"}
          </button>
        </form>
      </div>
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