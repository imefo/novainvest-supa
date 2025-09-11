"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

const CATS = { general: "عمومی", deposit: "واریز", withdraw: "برداشت", account: "حساب کاربری" };
const PRIOS = { low: "کم", normal: "معمول", high: "زیاد" };
const STATUS = { open: "باز", answered: "پاسخ داده شد", closed: "بسته" };

export default function AdminTickets() {
  const [rows, setRows] = useState([]);
  const [sel, setSel] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("answered");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !(await isAdminFast(user.id))) {
        setErr("دسترسی ادمین ندارید.");
        setLoading(false);
        return;
      }
      await load();
      // realtime
      const ch = supabase
        .channel("tickets-admin")
        .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => load(false))
        .subscribe();
      return () => supabase.removeChannel(ch);
    })();
  }, []);

  async function load(spin = true) {
    if (spin) setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("id,title,message,category,priority,status,admin_reply,created_at,updated_at,user_id")
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else {
      setRows(data || []);
      if (data?.length && !sel) setSel(data[0]);
    }
    setLoading(false);
  }

  async function saveReply() {
    if (!sel) return;
    const { error } = await supabase
      .from("tickets")
      .update({ admin_reply: reply.trim(), status })
      .eq("id", sel.id);
    if (error) {
      setErr(error.message);
      return;
    }
    setReply("");
    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-purple-300">مدیریت تیکت‌ها</h1>
        <button onClick={() => history.back()} className="px-3 py-1.5 rounded bg-gray-900 border border-gray-700 hover:border-purple-500 text-sm">بازگشت</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* لیست */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-800 bg-gray-950/60">
          {loading ? (
            <div className="p-6 text-sm text-gray-400">در حال بارگذاری…</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">تیکتی یافت نشد.</div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {rows.map(r => (
                <li key={r.id}>
                  <button
                    onClick={() => { setSel(r); setReply(r.admin_reply || ""); setStatus(r.status || "open"); }}
                    className={"w-full text-right px-4 py-3 hover:bg-gray-900/50 " + (sel?.id === r.id ? "bg-gray-900/70" : "")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{r.title}</div>
                      <div className="text-[11px] text-gray-500 ltr">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {CATS[r.category] || r.category} • اولویت: {PRIOS[r.priority] || r.priority} • وضعیت: {STATUS[r.status] || r.status}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* جزئیات + پاسخ */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
          {!sel ? (
            <div className="text-gray-400 text-sm">یک تیکت را از ستون کناری انتخاب کنید.</div>
          ) : (
            <div className="space-y-5">
              {err && <div className="text-sm text-red-400">{err}</div>}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold">{sel.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {CATS[sel.category] || sel.category} • اولویت: {PRIOS[sel.priority] || sel.priority}
                  </div>
                </div>
                <span className="text-[11px] text-gray-500 ltr">{new Date(sel.created_at).toLocaleString()}</span>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                <div className="text-xs text-gray-400 mb-1">پیام کاربر</div>
                <p className="leading-7">{sel.message}</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    className="rounded-lg bg-gray-900 border border-gray-800 focus:border-purple-500 px-3 py-2"
                    value={status} onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="open">باز</option>
                    <option value="answered">پاسخ داده شد</option>
                    <option value="closed">بسته</option>
                  </select>
                </div>
                <textarea
                  rows={5}
                  className="w-full rounded-lg bg-gray-900 border border-gray-800 focus:border-purple-500 px-3 py-2"
                  placeholder="پاسخ ادمین…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={saveReply}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90"
                  >
                    ثبت پاسخ
                  </button>
                  <button
                    onClick={() => { setReply(""); setStatus("open"); }}
                    className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-purple-500"
                  >
                    پاک‌کردن فرم
                  </button>
                </div>
              </div>

              {sel.admin_reply ? (
                <div className="rounded-xl border border-emerald-800 bg-emerald-900/20 p-4">
                  <div className="text-xs text-emerald-300 mb-1">آخرین پاسخ ثبت‌شده</div>
                  <p className="leading-7 text-emerald-200">{sel.admin_reply}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}