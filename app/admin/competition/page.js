"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function AdminCompetitionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // تنظیمات مسابقه‌ی فعال
  const [form, setForm] = useState({
    title: "مسابقه دعوت ۱۵ روزه",
    start_date: "",
    end_date: "",
    prize_usdt: 100,
    min_referrals: 1,
    description: "هرکس بیشترین دعوت موفق داشته باشد، برنده می‌شود.",
  });

  // لیدربورد
  const [board, setBoard] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // خواندن آخرین تنظیمات مسابقه از جدول contests (در صورت نبود، نادیده می‌گیرد)
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
              start_date: data.start_date?.slice(0, 10) ?? "",
              end_date: data.end_date?.slice(0, 10) ?? "",
              prize_usdt: data.prize_usdt ?? 100,
              min_referrals: data.min_referrals ?? 1,
              description: data.description ?? "",
            });
          }
        } catch {}

        // لیدربورد: اگر view/جدول مناسب داری استفاده می‌شود؛ وگرنه سعی می‌کند از referrals بشمارد.
        try {
          // اول تلاش برای view آماده (مثلا referral_leaderboard)
          let rows = [];
          const { data: v1 } = await supabase.from("referral_leaderboard").select("*").limit(50);
          if (v1?.length) {
            rows = v1.map((r, i) => ({
              rank: i + 1,
              user_id: r.user_id ?? r.referrer_id ?? r.id,
              total: r.total ?? r.count ?? r.referrals ?? 0,
            }));
          } else {
            // fallback ساده روی جدول referrals (اگر وجود داشته باشد)
            const { data: r } = await supabase
              .from("referrals")
              .select("referrer_id")
              .limit(10000);

            if (r?.length) {
              const m = new Map();
              r.forEach((x) => {
                const k = x.referrer_id || x.user_id || x.id;
                if (!k) return;
                m.set(k, (m.get(k) || 0) + 1);
              });
              rows = [...m.entries()]
                .map(([user_id, total]) => ({ user_id, total, rank: 0 }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 50)
                .map((x, i) => ({ ...x, rank: i + 1 }));
            }
          }
          if (alive) setBoard(rows);
        } catch {}

      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // upsert تنظیمات به جدول contests (اگر نداری، بعداً می‌سازیم)
      const payload = {
        title: form.title,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        prize_usdt: Number(form.prize_usdt) || 0,
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

  return (
    <div className="nv-container">
      <div className="admin-top" style={{marginBottom:16}}>
        <div className="admin-breadcrumb">
          <Link href="/admin" className="btn-ghost">← بازگشت به پنل</Link>
        </div>
        <div>
          <h1 className="admin-title">مسابقه‌ی دعوت</h1>
          <p className="admin-sub">تنظیم بازه، جایزه و مشاهده لیدربورد</p>
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
          <p className="admin-card__desc">عنوان، بازه زمانی، جایزه (USDT) و حداقل دعوت</p>

          <form onSubmit={save} style={{display:"grid", gap:12, marginTop:8}}>
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

            <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
              <div>
                <label className="nv-label">جایزه (USDT)</label>
                <input className="nv-input" type="number" step="0.01" min="0"
                  value={form.prize_usdt}
                  onChange={(e)=>setForm({...form, prize_usdt:e.target.value})}/>
              </div>
              <div>
                <label className="nv-label">حداقل دعوتِ موثر</label>
                <input className="nv-input" type="number" min="0"
                  value={form.min_referrals}
                  onChange={(e)=>setForm({...form, min_referrals:e.target.value})}/>
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
            <h3>لیدربورد ۱۵ نفر برتر</h3>
            <div className="admin-chip"><span>{board.length}</span></div>
          </div>
          <p className="admin-card__desc">براساس تعداد دعوت‌های موفق</p>

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
                    <th>دعوت‌ها</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((r) => (
                    <tr key={r.user_id}>
                      <td>{r.rank}</td>
                      <td style={{direction:"ltr"}}>{r.user_id}</td>
                      <td>{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}