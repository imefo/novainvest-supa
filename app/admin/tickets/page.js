"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function Badge({ children, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs border ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Tile({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-slate-100 font-semibold">{value}</div>
    </div>
  );
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [prio, setPrio] = useState("all");
  const [active, setActive] = useState(null); // تیکت انتخاب‌شده
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("id, title, message, category, priority, user_id, created_at, updated_at, admin_reply")
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    else setTickets(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesQ =
        !s ||
        t.title?.toLowerCase().includes(s) ||
        t.message?.toLowerCase().includes(s) ||
        t.user_id?.toLowerCase().includes(s) ||
        t.id?.toLowerCase().includes(s);
      const matchesCat = cat === "all" || (t.category || "").toLowerCase() === cat;
      const matchesPr = prio === "all" || (t.priority || "").toLowerCase() === prio;
      return matchesQ && matchesCat && matchesPr;
    });
  }, [tickets, q, cat, prio]);

  const toneByCat = (c) =>
    c === "deposit" ? "emerald" : c === "withdraw" ? "amber" : "indigo";
  const toneByPrio = (p) =>
    p === "high" ? "rose" : p === "low" ? "slate" : "indigo";

  async function sendReply() {
    if (!active?.id) return;
    if (!reply.trim()) {
      setErr("پاسخ را بنویسید.");
      return;
    }
    setSaving(true);
    setErr("");
    const { error } = await supabase
      .from("tickets")
      .update({
        admin_reply: reply.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", active.id);

    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    // در حافظه هم آپدیت کن
    setTickets((arr) =>
      arr.map((t) => (t.id === active.id ? { ...t, admin_reply: reply.trim(), updated_at: new Date().toISOString() } : t))
    );
    setReply("");
  }

  return (
    <div className="p-6 text-slate-100">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          مدیریت تیکت‌ها <span className="text-slate-400 text-base">| پشتیبانی</span>
        </h1>
        <button
          onClick={load}
          className="px-3 py-1.5 rounded-lg text-sm border border-white/15 bg-white/5 hover:bg-white/10"
        >
          بروزرسانی
        </button>
      </div>

      {/* فیلترها */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو: عنوان/متن/ایمیل/شناسه کاربر/ID تیکت…"
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400/40"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400/40"
        >
          <option value="all">همه دسته‌بندی‌ها</option>
          <option value="general">عمومی</option>
          <option value="deposit">واریز</option>
          <option value="withdraw">برداشت</option>
        </select>
        <select
          value={prio}
          onChange={(e) => setPrio(e.target.value)}
          className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400/40"
        >
          <option value="all">همه اولویت‌ها</option>
          <option value="low">کم</option>
          <option value="normal">معمول</option>
          <option value="high">زیاد</option>
        </select>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      {/* دو ستون: لیست + جزئیات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* لیست */}
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03]">
          <div className="p-3 border-b border-white/10 text-sm text-slate-300">
            {loading ? "در حال بارگذاری…" : `تعداد تیکت‌ها: ${filtered.length}`}
          </div>
          <div className="max-h-[70vh] overflow-auto p-3 space-y-3">
            {loading ? (
              <div className="text-slate-400 text-sm">…</div>
            ) : filtered.length === 0 ? (
              <div className="text-slate-400 text-sm">تیکتی پیدا نشد.</div>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActive(t);
                    setReply(t.admin_reply || "");
                  }}
                  className={`w-full text-right rounded-xl border px-3 py-3 transition
                   ${active?.id === t.id ? "border-indigo-400/40 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="font-semibold truncate">{t.title || "بدون عنوان"}</div>
                    <div className="text-xs text-slate-400 ltr">
                      {new Date(t.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone={toneByCat((t.category || "").toLowerCase())}>
                      {t.category || "عمومی"}
                    </Badge>
                    <Badge tone={toneByPrio((t.priority || "").toLowerCase())}>
                      {t.priority || "معمول"}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-300 line-clamp-2">
                    {t.message || "—"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* جزئیات + پاسخ */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          {!active ? (
            <div className="text-slate-400">یک تیکت از لیست انتخاب کنید…</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-extrabold">{active.title || "بدون عنوان"}</h2>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Tile label="دسته‌بندی" value={active.category || "عمومی"} />
                    <Tile label="اولویت" value={active.priority || "معمول"} />
                    <Tile label="کاربر" value={active.user_id?.slice(0, 10) + "…"} />
                    <Tile
                      label="ایجاد"
                      value={new Date(active.created_at).toLocaleString()}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="px-3 py-1.5 rounded-lg text-sm border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  بستن
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4">
                <div className="text-xs text-slate-400 mb-1">متن کاربر</div>
                <div className="text-slate-100 whitespace-pre-wrap leading-7">
                  {active.message || "—"}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-400">پاسخ ادمین</div>
                  {active.admin_reply && (
                    <Badge tone="emerald">ارسال شده</Badge>
                  )}
                </div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="پاسخ خود را بنویسید…"
                  rows={5}
                  className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 outline-none focus:border-indigo-400/40"
                />
                <div className="mt-3 flex items-center gap-2">
                  <button
                    disabled={saving}
                    onClick={sendReply}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60"
                  >
                    {saving ? "در حال ارسال…" : "ارسال پاسخ"}
                  </button>
                  <button
                    onClick={() => setReply(active.admin_reply || "")}
                    className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 hover:bg-white/10"
                  >
                    ریست به متن قبلی
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}