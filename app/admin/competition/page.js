"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminCompetitionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // فرم تنظیمات
  const [form, setForm] = useState({
    title: "مسابقه دعوت ۱۵ روزه",
    start_date: "",
    end_date: "",
    prize_usdt: 100,
    prize_1_usdt: 100,
    prize_2_usdt: 50,
    prize_3_usdt: 25,
    min_referrals: 1,
    description: "هرکس بیشترین دعوت موفق داشته باشد، برنده می‌شود.",
  });

  // لیدربورد
  const [board, setBoard] = useState([]);

  // پنل تنظیم دستی
  const [adjustEmail, setAdjustEmail] = useState("");
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustDelta, setAdjustDelta] = useState(1);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustSaving, setAdjustSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // آخرین تنظیمات
        try {
          const { data } = await supabase
            .from("contests")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (data && alive) {
            setForm({
              title: data.title ?? form.title,
              start_date: data.start_date?.slice(0,10) ?? "",
              end_date: data.end_date?.slice(0,10) ?? "",
              prize_usdt: data.prize_usdt ?? 100,
              prize_1_usdt: data.prize_1_usdt ?? 100,
              prize_2_usdt: data.prize_2_usdt ?? 50,
              prize_3_usdt: data.prize_3_usdt ?? 25,
              min_referrals: data.min_referrals ?? 1,
              description: data.description ?? "",
            });
          }
        } catch {}

        // لیدربورد
        try {
          const { data } = await supabase
            .from("referral_leaderboard")
            .select("*")
            .limit(100);
          const rows = (data || [])
            .map((r, i) => ({
              rank: i + 1,
              user_id: r.user_id,
              total: r.adjusted_total ?? r.total ?? 0,
              base_total: r.base_total ?? null,
              delta: r.total_adjustment ?? null,
            }))
            .sort((a,b) => b.total - a.total)
            .slice(0, 50)
            .map((x, i) => ({ ...x, rank: i + 1 }));
          if (alive) setBoard(rows);
        } catch {}

      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        prize_usdt: Number(form.prize_usdt) || 0,
        prize_1_usdt: Number(form.prize_1_usdt) || 0,
        prize_2_usdt: Number(form.prize_2_usdt) || 0,
        prize_3_usdt: Number(form.prize_3_usdt) || 0,
        min_referrals: Number(form.min_referrals) || 0,
        description: form.description,
      };
      await supabase.from("contests").upsert(payload, { onConflict: "id" });
      alert("تنظیمات ذخیره شد ✅");
    } catch (err) {
      console.error(err);
      alert("ذخیره تنظیمات ناموفق بود.");
    } finally {
      setSaving(false);
    }
  };

  async function resolveUserId(emailOrId) {
    const v = (emailOrId || "").trim();
    if (!v) return null;
    // اگر شبیه UUID بود، همان را برگردان
    if (/^[0-9a-f-]{36}$/i.test(v)) return v;

    // وگرنه با ایمیل از profiles بیاور
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", v)
      .maybeSingle();
    if (error) {
      console.error(error);
      return null;
    }
    return data?.user_id || null;
  }

  const applyAdjust = async (e) => {
    e.preventDefault();
    setAdjustSaving(true);
    try {
      let uid = adjustUserId?.trim();
      if (!uid && adjustEmail) {
        uid = await resolveUserId(adjustEmail);
      }
      if (!uid) {
        alert("ایمیل یا user_id معتبر وارد کن.");
        return;
      }
      const delta = Number(adjustDelta) || 0;
      if (!delta) {
        alert("delta نمی‌تواند صفر باشد.");
        return;
      }
      await supabase.from("referral_adjustments").insert({
        user_id: uid,
        delta,
        reason: adjustReason || null,
      });
      alert("تنظیم دستی ثبت شد ✅");
      setAdjustEmail("");
      setAdjustUserId("");
      setAdjustDelta(1);
      setAdjustReason("");

      // Refresh leaderboard
      const { data } = await supabase
        .from("referral_leaderboard")
        .select("*")
        .limit(100);
      const rows = (data || [])
        .map((r, i) => ({
          rank: i + 1,
          user_id: r.user_id,
          total: r.adjusted_total ?? r.total ?? 0,
          base_total: r.base_total ?? null,
          delta: r.total_adjustment ?? null,
        }))
        .sort((a,b) => b.total - a.total)
        .slice(0, 50)
        .map((x, i) => ({ ...x, rank: i + 1 }));
      setBoard(rows);
    } catch (err) {
      console.error(err);
      alert("ثبت تنظیم دستی ناموفق بود.");
    } finally {
      setAdjustSaving(false);
    }
  };

  return (
    <div className="nv-container">
      <div className="admin-top" style={{marginBottom:16}}>
        <div className="admin-breadcrumb">
          <Link href="/admin" className="btn-ghost">← بازگشت به پنل</Link>
        </div>
        <div>
          <h1 className="admin-title">مسابقه‌ی دعوت</h1>
          <p className="admin-sub">تنظیم بازه، جوایز و مدیریت لیدربورد</p>
        </div>
      </div>

      <div className="admin-grid" style={{gridTemplateColumns:"1.2fr 1fr"}}>
        {/* فرم تنظیمات */}
        <div className="admin-card" style={{ ['--ring']: "var(--acc7)" }}>
          <div className="admin-card__icon">⚙️</div>
          <div className="admin-card__head">
            <h3>تنظیمات مسابقه</h3>
            <div className="admin-chip"><span>{saving ? "..." : "ویرایش"}</span></div>
          </div>
          <p className="admin-card__desc">عنوان، بازه زمانی، حداقل دعوت و جوایز نفرات ۱/۲/۳</p>

          <form onSubmit={saveSettings} style={{display:"grid", gap:12, marginTop:8}}>
            <input className="nv-input" placeholder="عنوان"
              value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} />

            <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
              <div>
                <label className="nv-label">تاریخ شروع</label>
                <input className="nv-input" type="date"
                  value={form.start_date}
                  onChange={(e)=>setForm({...form, start_date:e.target.value})}/>
              </div>
              <div>
                <label className="nv-label">تاریخ پایان</label>
                <input className="nv-input" type="date"
                  value={form.end_date}
                  onChange={(e)=>setForm({...form, end_date:e.target.value})}/>
              </div>
            </div>

            <div style={{display:"grid", gap:12, gridTemplateColumns:"repeat(3,1fr)"}}>
              <div>
                <label className="nv-label">جایزه نفر اول (USDT)</label>
                <input className="nv-input" type="number" step="0.01" min="0"
                  value={form.prize_1_usdt}
                  onChange={(e)=>setForm({...form, prize_1_usdt:e.target.value})}/>
              </div>
              <div>
                <label className="nv-label">جایزه نفر دوم (USDT)</label>
                <input className="nv-input" type="number" step="0.01" min="0"
                  value={form.prize_2_usdt}
                  onChange={(e)=>setForm({...form, prize_2_usdt:e.target.value})}/>
              </div>
              <div>
                <label className="nv-label">جایزه نفر سوم (USDT)</label>
                <input className="nv-input" type="number" step="0.01" min="0"
                  value={form.prize_3_usdt}
                  onChange={(e)=>setForm({...form, prize_3_usdt:e.target.value})}/>
              </div>
            </div>

            <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
              <div>
                <label className="nv-label">حداقل دعوتِ موثر</label>
                <input className="nv-input" type="number" min="0"
                  value={form.min_referrals}
                  onChange={(e)=>setForm({...form, min_referrals:e.target.value})}/>
              </div>
              <div>
                <label className="nv-label">(اختیاری) جایزه کلی</label>
                <input className="nv-input" type="number" step="0.01" min="0"
                  value={form.prize_usdt}
                  onChange={(e)=>setForm({...form, prize_usdt:e.target.value})}/>
              </div>
            </div>

            <textarea className="nv-input" rows={4} placeholder="توضیحات"
              value={form.description}
              onChange={(e)=>setForm({...form, description:e.target.value})} />

            <button className="nv-btn nv-btn-primary" disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </button>
          </form>
        </div>

        {/* لیدربورد */}
        <div className="admin-card" style={{ ['--ring']: "var(--acc5)" }}>
          <div className="admin-card__icon">🏆</div>
          <div className="admin-card__head">
            <h3>لیدربورد ۵۰ نفر برتر</h3>
            <div className="admin-chip"><span>{board.length}</span></div>
          </div>
          <p className="admin-card__desc">براساس مجموع دعوت‌ها + تنظیمات دستی</p>

          <div className="nv-table-wrap">
            {loading ? (
              <div className="muted" style={{padding:"8px 0"}}>در حال بارگذاری...</div>
            ) : board.length === 0 ? (
              <div className="muted" style={{padding:"8px 0"}}>اطلاعاتی برای نمایش نیست.</div>
            ) : (
              <table className="nv-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>کاربر</th>
                    <th>کل موثر</th>
                    <th>پایه</th>
                    <th>تنظیم دستی</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((r) => (
                    <tr key={r.user_id}>
                      <td>{r.rank}</td>
                      <td style={{direction:"ltr"}}>{r.user_id}</td>
                      <td>{r.total}</td>
                      <td>{r.base_total ?? "—"}</td>
                      <td>{r.delta ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* پنل تنظیم دستی دعوتی */}
      <div className="admin-card" style={{ ['--ring']: "var(--acc9, var(--acc4))", marginTop:16 }}>
        <div className="admin-card__icon">🛠️</div>
        <div className="admin-card__head">
          <h3>تنظیم دستی تعداد دعوتی</h3>
          <div className="admin-chip"><span>adjust</span></div>
        </div>
        <p className="admin-card__desc">با ایمیل یا user_id کاربر را پیدا کن، سپس delta (مثبت/منفی) و دلیل را ثبت کن.</p>

        <form onSubmit={applyAdjust} style={{display:"grid", gap:12}}>
          <div style={{display:"grid", gap:12, gridTemplateColumns:"1.2fr 1fr 1fr"}}>
            <input className="nv-input" placeholder="ایمیل کاربر (یا خالی بگذار)"
              value={adjustEmail} onChange={(e)=>setAdjustEmail(e.target.value)} />
            <input className="nv-input" placeholder="user_id (اگر ایمیل را نزدی)"
              value={adjustUserId} onChange={(e)=>setAdjustUserId(e.target.value)} />
            <input className="nv-input" type="number" placeholder="delta (مثلاً +3 یا -2)"
              value={adjustDelta} onChange={(e)=>setAdjustDelta(e.target.value)} />
          </div>
          <input className="nv-input" placeholder="دلیل (اختیاری)"
            value={adjustReason} onChange={(e)=>setAdjustReason(e.target.value)} />
          <div style={{display:"flex", gap:10}}>
            <button className="nv-btn nv-btn-primary" disabled={adjustSaving}>
              {adjustSaving ? "در حال ثبت..." : "ثبت تنظیم دستی"}
            </button>
            <button type="button" className="nv-btn" onClick={()=>{
              setAdjustEmail(""); setAdjustUserId(""); setAdjustDelta(1); setAdjustReason("");
            }}>پاک‌سازی فرم</button>
          </div>
        </form>
      </div>
    </div>
  );
}