"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SupportPage() {
  const [user, setUser] = useState(null);

  // فرم
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general"); // general | deposit | withdraw | plan | kyc | other
  const [priority, setPriority] = useState("normal");  // low | normal | high | urgent
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) { setErr(error.message); return; }
      if (!alive) return;
      setUser(user || null);
      if (user?.id) await loadTickets(user.id);
    })();
    return () => { alive = false; };
  }, []);

  async function loadTickets(uid) {
    setErr("");
    const { data, error } = await supabase
      .from("tickets")
      .select("id, title, category, priority, status, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) setErr(error.message);
    else setTickets(data || []);
  }

  async function submitTicket(e) {
    e.preventDefault();
    setErr(""); setOk("");

    // اعتبارسنجی حداقلی
    if (!title.trim()) { setErr("موضوع را وارد کنید."); return; }
    if (!message.trim()) { setErr("متن پیام را وارد کنید."); return; }
    if (!user?.id) { setErr("لطفاً ابتدا وارد شوید."); return; }

    setSubmitting(true);
    const payload = {
      user_id: user.id,
      title: title.trim(),
      category,
      priority,
      message: message.trim(), // *** مهم: ستون message حتماً پاس داده می‌شود ***
      status: "open",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("tickets").insert([payload]);
    setSubmitting(false);

    if (error) { setErr(error.message); return; }

    setOk("تیکت با موفقیت ثبت شد.");
    setTitle(""); setMessage("");
    await loadTickets(user.id);
  }

  return (
    <div className="nv-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">پشتیبانی</h1>
        <Link href="/dashboard" className="nv-btn">بازگشت</Link>
      </div>

      {/* پیام‌های وضعیت */}
      {err ? <div className="nv-alert nv-alert-error">{err}</div> : null}
      {ok ? <div className="nv-alert nv-alert-ok">{ok}</div> : null}

      <div className="grid gap-6 md:grid-cols-3">
        {/* لیست تیکت‌های من */}
        <section className="nv-card md:col-span-1">
          <div className="nv-card-title">تیکت‌های شما</div>
          <div className="space-y-2">
            {tickets.length === 0 && (
              <div className="text-sm opacity-70">هنوز تیکتی ثبت نکردید.</div>
            )}
            {tickets.map(t => (
              <Link
                key={t.id}
                href={`/dashboard/support/${t.id}`}
                className="block nv-item hover:opacity-90"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{t.title}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                    {mapStatus(t.status)}
                  </span>
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {mapCategory(t.category)} • {mapPriority(t.priority)}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* فرم ایجاد تیکت */}
        <section className="nv-card md:col-span-2">
          <div className="nv-card-title">ایجاد تیکت جدید</div>

          <form onSubmit={submitTicket} className="space-y-4">
            <div>
              <label className="nv-label">موضوع</label>
              <input
                className="nv-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثلاً مشکل در برداشت"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="nv-label">دسته‌بندی</label>
                <select
                  className="nv-input"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="general">عمومی</option>
                  <option value="deposit">واریز</option>
                  <option value="withdraw">برداشت</option>
                  <option value="plan">پلن‌ها</option>
                  <option value="kyc">احراز هویت (KYC)</option>
                  <option value="other">سایر</option>
                </select>
              </div>
              <div>
                <label className="nv-label">اولویت</label>
                <select
                  className="nv-input"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="low">کم</option>
                  <option value="normal">معمول</option>
                  <option value="high">زیاد</option>
                  <option value="urgent">فوری</option>
                </select>
              </div>
            </div>

            <div>
              <label className="nv-label">متن پیام</label>
              <textarea
                className="nv-textarea"
                rows={6}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="توضیحات کامل مشکل/درخواست…"
              />
            </div>

            <button disabled={submitting} className="nv-btn nv-btn-primary">
              {submitting ? "در حال ثبت…" : "ثبت تیکت"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

/* --- کمک‌تابع‌های نمایشی --- */
function mapStatus(s) {
  switch (s) {
    case "open": return "باز";
    case "answered": return "پاسخ داده شد";
    case "closed": return "بسته";
    default: return s || "نامشخص";
  }
}
function mapCategory(c) {
  switch (c) {
    case "general": return "عمومی";
    case "deposit": return "واریز";
    case "withdraw": return "برداشت";
    case "plan": return "پلن‌ها";
    case "kyc": return "KYC";
    case "other": return "سایر";
    default: return c || "نامشخص";
  }
}
function mapPriority(p) {
  switch (p) {
    case "low": return "کم";
    case "normal": return "معمول";
    case "high": return "زیاد";
    case "urgent": return "فوری";
    default: return p || "نامشخص";
  }
}