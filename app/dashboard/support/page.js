"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    category: "general",
    priority: "normal",
    message: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setMe(user);
      await loadTickets(user.id);
      setLoading(false);
    })();
  }, []);

  async function loadTickets(uid) {
    const { data, error } = await supabase
      .from("tickets")
      .select("id, subject, status, priority, category, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (!error) setTickets(data || []);
  }

  async function createTicket(e) {
    e.preventDefault();
    setError("");
    if (!form.subject.trim() || !form.message.trim()) {
      setError("موضوع و متن تیکت الزامی است.");
      return;
    }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreating(false); setError("ابتدا وارد شوید."); return; }

    const { data: t, error: e1 } = await supabase
      .from("tickets")
      .insert({
        user_id: user.id,
        subject: form.subject.trim(),
        category: form.category,
        priority: form.priority,
        status: "open",
      })
      .select("id")
      .single();

    if (e1) { setCreating(false); setError(e1.message); return; }

    const { error: e2 } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: t.id,
        user_id: user.id,
        role: "user",
        message: form.message.trim(),
      });

    setCreating(false);
    if (e2) { setError(e2.message); return; }

    setForm({ subject: "", category: "general", priority: "normal", message: "" });
    await loadTickets(user.id);
  }

  if (loading) return <div className="nv-container"><div className="glass card-center">در حال بارگذاری…</div></div>;

  return (
    <div className="nv-container">
      <div className="head-row">
        <h1 className="title">پشتیبانی</h1>
        <div className="muted">هر سوالی داری، تیکت بزن؛ سریع جواب می‌دیم.</div>
      </div>

      <div className="grid-2">
        {/* Create box */}
        <div className="glass card-pad">
          <h3 className="card-title">ایجاد تیکت جدید</h3>
          <form onSubmit={createTicket} className="form-grid">
            <label className="form-col">
              <span>موضوع</span>
              <input
                className="input"
                value={form.subject}
                onChange={e=>setForm(f=>({...f, subject:e.target.value}))}
                placeholder="مثلاً مشکل برداشت"
              />
            </label>

            <div className="form-row">
              <label className="form-col">
                <span>دسته‌بندی</span>
                <select
                  className="input"
                  value={form.category}
                  onChange={e=>setForm(f=>({...f, category:e.target.value}))}>
                  <option value="general">عمومی</option>
                  <option value="deposit">واریز</option>
                  <option value="withdrawal">برداشت</option>
                  <option value="kyc">احراز هویت</option>
                  <option value="plans">پلن‌ها</option>
                </select>
              </label>
              <label className="form-col">
                <span>اولویت</span>
                <select
                  className="input"
                  value={form.priority}
                  onChange={e=>setForm(f=>({...f, priority:e.target.value}))}>
                  <option value="low">کم</option>
                  <option value="normal">معمولی</option>
                  <option value="high">بالا</option>
                </select>
              </label>
            </div>

            <label className="form-col">
              <span>متن پیام</span>
              <textarea
                className="input"
                rows={5}
                value={form.message}
                onChange={e=>setForm(f=>({...f, message:e.target.value}))}
                placeholder="با جزئیات بنویس تا سریع‌تر حل بشه" />
            </label>

            {error && <div className="err">{error}</div>}

            <button className="nv-btn nv-btn-primary" disabled={creating}>
              {creating ? "در حال ثبت..." : "ثبت تیکت"}
            </button>
          </form>
        </div>

        {/* List box */}
        <div className="glass card-pad">
          <h3 className="card-title">تیکت‌های شما</h3>
          {tickets.length === 0 ? (
            <div className="muted">هنوز تیکتی ثبت نکردی.</div>
          ) : (
            <ul className="ticket-list">
              {tickets.map(t => (
                <li key={t.id} className="ticket-item">
                  <div className="ti-left">
                    <div className="ti-subj">{t.subject}</div>
                    <div className="ti-meta">
                      <span className={`chip chip-${t.status}`}>{faStatus(t.status)}</span>
                      <span className="chip">{faPriority(t.priority)}</span>
                      <span className="chip">{faCategory(t.category)}</span>
                    </div>
                  </div>
                  <Link className="nv-btn" href={`/dashboard/tickets/${t.id}`}>مشاهده</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
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