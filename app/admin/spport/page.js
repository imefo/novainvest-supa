"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default function AdminSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all"); // all | open | pending | closed
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);

    // چک نقش ادمین از profiles
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("ابتدا وارد شوید."); setLoading(false); return; }

    const { data: prof } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!prof?.is_admin) { setErr("دسترسی ادمین ندارید."); setLoading(false); return; }

    let q = supabase.from("tickets")
      .select("*, profiles: user_id (full_name, email)")
      .order("created_at", { ascending: false });

    if (filter !== "all") q = q.eq("status", filter);

    const { data, error } = await q;
    if (error) setErr(error.message);
    else setTickets(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  async function reply(ticketId, replyText, newStatus) {
    setErr(null); setOk(null);
    const { error } = await supabase
      .from("tickets")
      .update({ admin_reply: replyText, status: newStatus })
      .eq("id", ticketId);
    if (error) setErr(error.message);
    else { setOk("به‌روزرسانی شد."); load(); }
  }

  return (
    <div className="nv-container" style={{ maxWidth: 1100 }}>
      <h1 className="page-title">تیکت‌ها (ادمین)</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="muted">فیلتر:</span>
          <select className="nv-input" value={filter} onChange={(e)=>setFilter(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="all">همه</option>
            <option value="open">باز</option>
            <option value="pending">در انتظار</option>
            <option value="closed">بسته</option>
          </select>
          <button className="nv-btn" onClick={load}>بازخوانی</button>
        </div>
      </div>

      {err && <div className="nv-alert nv-alert-error" style={{ marginBottom: 12 }}>{err}</div>}
      {ok && <div className="nv-alert nv-alert-ok" style={{ marginBottom: 12 }}>{ok}</div>}

      <div className="card">
        {loading ? (
          <div className="muted">در حال بارگذاری…</div>
        ) : tickets.length === 0 ? (
          <div className="muted">چیزی پیدا نشد.</div>
        ) : (
          <div className="nv-table">
            <div className="nv-thead">
              <div>کاربر</div>
              <div>موضوع</div>
              <div>وضعیت</div>
              <div>پیام</div>
              <div>پاسخ ادمین</div>
              <div>اقدام</div>
            </div>
            {tickets.map((t) => (
              <AdminRow key={t.id} t={t} onReply={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminRow({ t, onReply }) {
  const [replyText, setReplyText] = useState(t.admin_reply || "");
  const [status, setStatus] = useState(t.status);

  return (
    <div className="nv-row">
      <div>
        <div><strong>{t.profiles?.full_name || "-"}</strong></div>
        <div className="muted" style={{fontSize:12}}>{t.profiles?.email || "-"}</div>
      </div>
      <div>{t.subject}</div>
      <div>{t.status}</div>
      <div className="muted" style={{whiteSpace:"pre-wrap", maxWidth: 280}}>{t.message}</div>
      <div style={{ display: "grid", gap: 6 }}>
        <textarea
          className="nv-input"
          rows={3}
          placeholder="پاسخ ادمین…"
          value={replyText}
          onChange={(e)=>setReplyText(e.target.value)}
        />
        <select className="nv-input" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="open">باز</option>
          <option value="pending">در انتظار</option>
          <option value="closed">بسته</option>
        </select>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <button className="nv-btn nv-btn-primary" onClick={()=>onReply(t.id, replyText, status)}>ذخیره</button>
      </div>
    </div>
  );
}