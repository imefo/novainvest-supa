"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const CATS = [
  { v: "general", t: "عمومی" },
  { v: "deposit", t: "واریز" },
  { v: "withdraw", t: "برداشت" },
  { v: "account", t: "حساب کاربری" },
];

const PRIOS = [
  { v: "low", t: "کم" },
  { v: "normal", t: "معمول" },
  { v: "high", t: "زیاد" },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
    // realtime: وقتی ادمین جواب می‌دهد، بلافاصله ببینیم
    const ch = supabase
      .channel("tickets-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => load(false)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function load(spin = true) {
    try {
      if (spin) setLoading(true);
      setErr("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErr("ابتدا وارد شوید.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("tickets")
        .select("id,title,message,category,priority,status,admin_reply,created_at,updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
      if (data && data.length && !selected) setSelected(data[0]); // اولین آیتم
    } catch (e) {
      setErr(e.message || "خطا در بارگذاری.");
    } finally {
      setLoading(false);
    }
  }

  async function submitTicket(e) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErr("عنوان و متن پیام الزامی است.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("نشست کاربر یافت نشد.");
      const { error } = await supabase.from("tickets").insert({
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        category,
        priority,
      });
      if (error) throw error;
      setTitle(""); setMessage(""); setCategory("general"); setPriority("normal");
      await load();
    } catch (e) {
      setErr(e.message || "ارسال ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  const StatBadge = ({ status }) => (
    <span className={
      "px-2 py-1 text-xs rounded-md border " +
      (status === "closed" ? "bg-gray-800/70 border-gray-700 text-gray-400" :
       status === "answered" ? "bg-emerald-900/50 border-emerald-700 text-emerald-300" :
       "bg-amber-900/50 border-amber-700 text-amber-300")
    }>
      {status === "closed" ? "بسته" : status === "answered" ? "پاسخ داده شد" : "باز"}
    </span>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-purple-300">پشتیبانی</h1>
        <button onClick={() => history.back()}
          className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:border-purple-500 text-sm">
          بازگشت
        </button>
      </div>

      {/* ردیف دو ستونه: لیست + جزئیات */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* لیست تیکت‌ها */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">تیکت‌های شما</h2>
            <button onClick={() => load()} className="text-xs px-2 py-1 rounded bg-gray-900 border border-gray-700 hover:border-purple-500">
              بروزرسانی
            </button>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 backdrop-blur">
            {loading ? (
              <div className="p-6 text-sm text-gray-400">در حال بارگذاری…</div>
            ) : tickets.length === 0 ? (
              <div className="p-6 text-sm text-gray-400">هنوز تیکتی ثبت نکرده‌اید.</div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {tickets.map(t => (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelected(t)}
                      className={"w-full text-right px-4 py-3 hover:bg-gray-900/50 flex items-center gap-3 " +
                        (selected?.id === t.id ? "bg-gray-900/70" : "")}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{t.title}</span>
                          <StatBadge status={t.status || "open"} />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {CATS.find(c => c.v === t.category)?.t || t.category} •
                          اولویت: {PRIOS.find(p => p.v === t.priority)?.t || t.priority}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-500 ltr">{new Date(t.created_at).toLocaleString()}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* جزئیات تیکت انتخاب‌شده + پاسخ ادمین */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 backdrop-blur p-5">
            {!selected ? (
              <div className="text-gray-400 text-sm">از لیست سمت چپ یک تیکت انتخاب کنید.</div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold">{selected.title}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {CATS.find(c => c.v === selected.category)?.t} • اولویت: {PRIOS.find(p => p.v === selected.priority)?.t}
                    </div>
                  </div>
                  <StatBadge status={selected.status || "open"} />
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                  <div className="text-xs text-gray-400 mb-1">پیام شما</div>
                  <p className="leading-7">{selected.message}</p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400 mb-2">پاسخ ادمین</div>
                    <span className="text-[11px] text-gray-500 ltr">
                      {selected.updated_at ? new Date(selected.updated_at).toLocaleString() : ""}
                    </span>
                  </div>
                  {selected.admin_reply ? (
                    <p className="leading-7 text-emerald-200">{selected.admin_reply}</p>
                  ) : (
                    <p className="text-gray-500 text-sm">هنوز پاسخی ثبت نشده است.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* فرم ساخت تیکت جدید */}
      <div className="rounded-2xl border border-gray-800 bg-gray-950/60 backdrop-blur p-5">
        <h2 className="text-lg font-semibold mb-4">ایجاد تیکت جدید</h2>
        {err && <div className="mb-3 text-sm text-red-400">{err}</div>}
        <form onSubmit={submitTicket} className="space-y-4">
          <input
            className="w-full rounded-lg bg-gray-900 border border-gray-800 focus:border-purple-500 px-3 py-2"
            placeholder="عنوان تیکت"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="w-full rounded-lg bg-gray-900 border border-gray-800 focus:border-purple-500 px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATS.map(c => <option key={c.v} value={c.v}>{c.t}</option>)}
            </select>
            <select
              className="w-full rounded-lg bg-gray-900 border border-gray-800 focus:border-purple-500 px-3 py-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIOS.map(p => <option key={p.v} value={p.v}>{p.t}</option>)}
            </select>
          </div>
          <textarea
            rows={5}
            className="w-full rounded-lg bg-gray-900 border border-gray-800 focus:border-purple-500 px-3 py-2"
            placeholder="متن پیام…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "در حال ارسال…" : "ثبت تیکت"}
          </button>
        </form>
      </div>
    </div>
  );
}