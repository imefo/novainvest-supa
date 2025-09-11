"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

export default function TicketThreadPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const bottomRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    const { data: t, error: e1 } = await supabase
      .from("tickets").select("*").eq("id", id).single();
    if (e1) setErr(e1.message);
    setTicket(t);

    const { data: m, error: e2 } = await supabase
      .from("ticket_messages")
      .select("id, ticket_id, sender_id, message, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });
    if (e2) setErr(e2.message);
    setMsgs(m || []);
    setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}), 50);
  };

  useEffect(() => {
    load();
    const sub = supabase.channel(`ticket-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${id}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [id]);

  const send = async (e) => {
    e.preventDefault();
    setErr("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("ابتدا وارد شوید."); return; }
    if (!text.trim()) return;
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: id, sender_id: user.id, message: text.trim()
    });
    if (error) { setErr(error.message); return; }
    setText("");
    await load();
  };

  return (
    <div className="nv-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-200">
          پشتیبانی — {ticket?.title || "..."}
        </h1>
        <Link href="/dashboard/support" className="nv-btn">بازگشت</Link>
      </div>

      {err && <div className="text-red-400 mb-3">{err}</div>}

      <div className="glass rounded-xl p-4 h-[60vh] overflow-y-auto space-y-3">
        {loading ? <div className="text-slate-400">در حال بارگذاری...</div> :
          msgs.map(m => (
            <div key={m.id} className="flex">
              <div className="px-3 py-2 rounded-lg bg-white/10 text-slate-200 ml-auto">
                {m.message}
              </div>
            </div>
          ))
        }
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input className="input flex-1" placeholder="پیام شما..."
               value={text} onChange={(e)=>setText(e.target.value)} />
        <button className="nv-btn nv-btn-primary">ارسال</button>
      </form>
    </div>
  );
}