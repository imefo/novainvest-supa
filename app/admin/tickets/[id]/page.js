"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

export default function AdminTicketThreadPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("open");
  const [err, setErr] = useState("");
  const bottomRef = useRef(null);

  const load = async () => {
    setErr("");
    const { data: t, error: e1 } = await supabase.from("tickets").select("*").eq("id", id).single();
    if (e1) setErr(e1.message);
    setTicket(t || null);
    setStatus(t?.status || "open");

    const { data: m, error: e2 } = await supabase
      .from("ticket_messages")
      .select("id, message, sender_id, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });
    if (e2) setErr(e2.message);
    setMsgs(m || []);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}), 50);
  };

  useEffect(()=>{ load(); }, [id]);

  const reply = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("نیاز به ورود ادمین."); return; }
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: id, sender_id: user.id, message: text.trim()
    });
    if (error) { setErr(error.message); return; }
    setText("");
    await supabase.from("tickets").update({ status: "answered" }).eq("id", id);
    await load();
  };

  const saveStatus = async () => {
    const { error } = await supabase.from("tickets").update({ status }).eq("id", id);
    if (error) setErr(error.message); else load();
  };

  return (
    <div className="nv-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-200">تیکت — {ticket?.title || "..."}</h1>
        <Link href="/admin/tickets" className="nv-btn">بازگشت</Link>
      </div>

      {err && <div className="text-red-400 mb-3">{err}</div>}

      <div className="mb-3 flex gap-2">
        <select className="input w-48" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="open">open</option>
          <option value="answered">answered</option>
          <option value="closed">closed</option>
        </select>
        <button className="nv-btn" onClick={saveStatus}>ذخیره وضعیت</button>
      </div>

      <div className="glass rounded-xl p-4 h-[60vh] overflow-y-auto space-y-3">
        {msgs.map(m => (
          <div key={m.id} className="flex">
            <div className="px-3 py-2 rounded-lg bg-white/10 text-slate-200">
              {m.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={reply} className="mt-3 flex gap-2">
        <input className="input flex-1" placeholder="پاسخ ادمین..."
               value={text} onChange={(e)=>setText(e.target.value)} />
        <button className="nv-btn nv-btn-primary">ارسال پاسخ</button>
      </form>
    </div>
  );
}