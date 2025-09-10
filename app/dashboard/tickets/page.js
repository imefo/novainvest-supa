"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TicketsPage() {
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [tickets, setTickets] = useState([]);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("tickets")
      .select("id, subject, status, created_at")
      .order("created_at", { ascending: false });
    if (!error) setTickets(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createTicket(e) {
    e.preventDefault();
    if (!subject.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("tickets")
      .insert([{ user_id: user.id, subject }]);
    if (!error) {
      setSubject("");
      load();
    }
  }

  return (
    <div className="nv-container">
      <h1 style={{marginBottom:12}}>تیکت‌های پشتیبانی</h1>

      <form onSubmit={createTicket} className="card" style={{marginBottom:16}}>
        <label style={{display:"block", marginBottom:6}}>موضوع تیکت</label>
        <input
          className="input"
          value={subject}
          onChange={(e)=>setSubject(e.target.value)}
          placeholder="مثلاً مشکل ورود، سوال درباره واریز، ..."
        />
        <button className="nv-btn nv-btn-primary" style={{marginTop:10}}>ایجاد تیکت</button>
      </form>

      {loading ? <p>در حال بارگذاری...</p> : (
        tickets.length ? (
          <div className="list">
            {tickets.map(t => (
              <a key={t.id} className="row card" href={`/dashboard/tickets/${t.id}`}>
                <div>
                  <div style={{fontWeight:600}}>{t.subject}</div>
                  <div className="muted" style={{fontSize:12}}>{new Date(t.created_at).toLocaleString()}</div>
                </div>
                <span className="badge">{t.status}</span>
              </a>
            ))}
          </div>
        ) : <p>تیکتی نداری.</p>
      )}
    </div>
  );
}