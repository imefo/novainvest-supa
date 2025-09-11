"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [prio, setPrio] = useState("all");
  const [replies, setReplies] = useState({}); // { [ticketId]: string }

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tickets")
        .select(
          "id,user_id,subject,title,category,priority,message,admin_reply,created_at,updated_at"
        )
        .order("created_at", { ascending: false });

      if (!error && alive) {
        setTickets(data || []);
        // preload reply inputs
        const init = {};
        (data || []).forEach((t) => (init[t.id] = t.admin_reply || ""));
        setReplies(init);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const s = search.trim().toLowerCase();
      const okSearch =
        !s ||
        (t.subject || "").toLowerCase().includes(s) ||
        (t.title || "").toLowerCase().includes(s) ||
        (t.message || "").toLowerCase().includes(s) ||
        (t.user_id || "").toLowerCase().includes(s);
      const okCat = cat === "all" || t.category === cat;
      const okPr = prio === "all" || t.priority === prio;
      return okSearch && okCat && okPr;
    });
  }, [tickets, search, cat, prio]);

  async function saveReply(id) {
    const text = replies[id] ?? "";
    setSavingId(id);
    const { error } = await supabase
      .from("tickets")
      .update({ admin_reply: text, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      alert("ذخیره پاسخ ناموفق بود:\n" + error.message);
      return;
    }
  }

  return (
    <div className="wrap">
      <div className="head">
        <div className="title">
          <span>🎧</span>
          <h1>مدیریت تیکت‌ها</h1>
        </div>

        <div className="filters">
          <input
            className="search"
            placeholder="جستجو: موضوع/عنوان/پیام/شناسه کاربر…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">همه دسته‌بندی‌ها</option>
            <option value="general">عمومی</option>
            <option value="deposit">واریز</option>
            <option value="withdraw">برداشت</option>
            <option value="kyc">KYC</option>
            <option value="other">سایر</option>
          </select>
          <select value={prio} onChange={(e) => setPrio(e.target.value)}>
            <option value="all">همه اولویت‌ها</option>
            <option value="low">کم</option>
            <option value="normal">معمول</option>
            <option value="high">زیاد</option>
            <option value="urgent">فوری</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">در حال بارگذاری…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">تیکتی یافت نشد.</div>
      ) : (
        <div className="grid">
          {filtered.map((t) => (
            <article key={t.id} className="card">
              <header className="cardHead">
                <div className="subject">{t.subject || "—"}</div>
                <div className="chips">
                  <span className={`chip cat ${t.category || "other"}`}>
                    {mapCategory(t.category)}
                  </span>
                  <span className={`chip pr ${t.priority || "normal"}`}>
                    {mapPriority(t.priority)}
                  </span>
                </div>
              </header>

              <div className="meta">
                <span>کاربر: <code>{t.user_id}</code></span>
                <span>ایجاد: {fmtDate(t.created_at)}</span>
                {t.updated_at && <span>ویرایش: {fmtDate(t.updated_at)}</span>}
              </div>

              {t.title && <div className="titleLine">عنوان: {t.title}</div>}

              <div className="msg">
                <label>پیام کاربر</label>
                <p>{t.message || "—"}</p>
              </div>

              <div className="reply">
                <label>پاسخ ادمین</label>
                <textarea
                  rows={4}
                  value={replies[t.id] ?? ""}
                  onChange={(e) =>
                    setReplies((r) => ({ ...r, [t.id]: e.target.value }))
                  }
                  placeholder="پاسخ خود را بنویسید…"
                />
                <div className="actions">
                  <button
                    className="btn"
                    disabled={savingId === t.id}
                    onClick={() => saveReply(t.id)}
                  >
                    {savingId === t.id ? "در حال ذخیره…" : "ذخیره پاسخ"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <style jsx>{`
        .wrap {
          padding: 24px 16px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          margin-bottom: 16px;
        }
        .title {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .title h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
        }
        .filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .search {
          min-width: 280px;
        }
        input,
        select,
        textarea {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 10px;
          padding: 10px 12px;
          color: #e7eaf0;
          outline: none;
        }
        .loading,
        .empty {
          padding: 24px;
          text-align: center;
          opacity: 0.8;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 14px;
        }
        .card {
          grid-column: span 12;
          background: linear-gradient(180deg, rgba(20,24,39,.8), rgba(16,19,33,.8));
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,.18);
        }
        @media (min-width: 900px) {
          .card { grid-column: span 6; }
        }
        .cardHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .subject {
          font-size: 16px;
          font-weight: 800;
        }
        .chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .chip {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          border: 1px solid rgba(255,255,255,.15);
          opacity: .95;
        }
        .chip.cat.general { background: rgba(59,130,246,.15); }
        .chip.cat.deposit { background: rgba(34,197,94,.15); }
        .chip.cat.withdraw { background: rgba(244,63,94,.15); }
        .chip.cat.kyc { background: rgba(234,179,8,.15); }
        .chip.cat.other { background: rgba(148,163,184,.15); }
        .chip.pr.low { background: rgba(148,163,184,.12); }
        .chip.pr.normal { background: rgba(99,102,241,.14); }
        .chip.pr.high { background: rgba(249,115,22,.18); }
        .chip.pr.urgent { background: rgba(244,63,94,.22); }
        .meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          opacity: .8;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .titleLine {
          opacity: .9;
          margin-bottom: 8px;
        }
        .msg label, .reply label {
          font-size: 12px;
          opacity: .75;
        }
        .msg p {
          margin: 6px 0 10px;
          line-height: 1.7;
        }
        .reply textarea {
          width: 100%;
          margin-top: 6px;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .btn {
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          color: #fff;
          cursor: pointer;
        }
        .btn:disabled {
          opacity: .6;
          cursor: default;
        }
      `}</style>
    </div>
  );
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString("fa-IR");
  } catch {
    return "—";
  }
}
function mapCategory(c) {
  switch (c) {
    case "general": return "عمومی";
    case "deposit": return "واریز";
    case "withdraw": return "برداشت";
    case "kyc": return "KYC";
    default: return "سایر";
  }
}
function mapPriority(p) {
  switch (p) {
    case "low": return "کم";
    case "normal": return "معمول";
    case "high": return "زیاد";
    case "urgent": return "فوری";
    default: return "معمول";
  }
}