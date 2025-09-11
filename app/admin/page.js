"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminKPI() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    txs: 0,
    kycPending: 0,
    ticketsOpen: 0,
    depositsPending: 0,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(""); setLoading(true);

        // تعدادها را از جداولت می‌گیرد — اگر اسم‌ها فرق دارد همین‌جا عوض کن
        const [{ count: usersCount, error: e1 }] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);
        if (e1) throw e1;

        const { count: plansCount, error: e2 } =
          await supabase.from("plans").select("*", { count: "exact", head: true });
        if (e2) throw e2;

        const { count: txCount, error: e3 } =
          await supabase.from("transactions").select("*", { count: "exact", head: true });
        if (e3) throw e3;

        const { count: kycCount, error: e4 } =
          await supabase.from("kyc_requests").select("*", { count: "exact", head: true }).eq("status","pending");
        if (e4) throw e4;

        const { count: ticketsCount, error: e5 } =
          await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("status","open");
        if (e5) throw e5;

        const { count: depCount, error: e6 } =
          await supabase.from("deposits").select("*", { count: "exact", head: true }).eq("status","pending");
        if (e6) throw e6;

        if (!alive) return;
        setStats({
          users: usersCount || 0,
          plans: plansCount || 0,
          txs: txCount || 0,
          kycPending: kycCount || 0,
          ticketsOpen: ticketsCount || 0,
          depositsPending: depCount || 0,
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "خطای ناشناخته");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <main className="wrap" dir="rtl">
      <header className="top">
        <div className="title">
          <h1>پنل ادمین</h1>
          <p>نمای کلی | مدیریت سیستم</p>
        </div>
        <div className="actions">
          <Link href="/dashboard" className="btn ghost">بازگشت به داشبورد کاربر</Link>
          <Link href="/" className="btn ghost">بازگشت به سایت</Link>
        </div>
      </header>

      {err && <div className="alert">خطا: {err}</div>}

      <section className="grid">
        <Card
          emoji="🧑‍💼"
          title="کاربران"
          hint="مشاهده/مسدودسازی/تغییر موجودی"
          count={stats.users}
          href="/admin/users"
          gradient="g1"
          loading={loading}
        />
        <Card
          emoji="📈"
          title="پلن‌ها"
          hint="ایجاد/ویرایش/حذف + فعال/غیرفعال"
          count={stats.plans}
          href="/admin/plans"
          gradient="g2"
          loading={loading}
        />
        <Card
          emoji="💳"
          title="تراکنش‌ها"
          hint="واریز/برداشت و وضعیت‌ها"
          count={stats.txs}
          href="/admin/transactions"
          gradient="g3"
          loading={loading}
        />
        <Card
          emoji="🪪"
          title="KYC در انتظار"
          hint="تأیید/رد احراز هویت"
          count={stats.kycPending}
          href="/admin/kyc"
          gradient="g4"
          loading={loading}
        />
        <Card
          emoji="💰"
          title="واریز/برداشت در انتظار"
          hint="تنظیم ارز/ولت + تایید دستی"
          count={stats.depositsPending}
          href="/admin/deposit"
          gradient="g5"
          loading={loading}
        />
        <Card
          emoji="🎧"
          title="تیکت‌های باز"
          hint="پاسخ و بستن گفتگو"
          count={stats.ticketsOpen}
          href="/admin/tickets"
          gradient="g6"
          loading={loading}
        />
      </section>

      <style jsx>{`
        /* ایزوله کردن لینک‌ها از گلوبال‌ها */
        :global(.wrap a) { color: inherit; text-decoration: none; }

        .wrap{max-width:1200px;margin:0 auto;padding:24px;}
        .top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;}
        .title h1{margin:0;font-size:26px;font-weight:900;letter-spacing:-.4px}
        .title p{margin:4px 0 0;opacity:.7;font-size:13px}
        .actions{display:flex;gap:8px;flex-wrap:wrap}
        .btn{padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06)}
        .btn.ghost{background:transparent;border-style:dashed}
        .btn:hover{transform:translateY(-1px);background:rgba(255,255,255,.1)}
        .alert{background:rgba(255,80,80,.15);border:1px solid rgba(255,120,120,.35);padding:10px 12px;border-radius:12px;margin-bottom:14px}

        .grid{
          display:grid;
          grid-template-columns:repeat(12,1fr);
          gap:16px;
        }
        @media(max-width:1024px){ .grid>section{grid-column:span 6} }
        @media(max-width:640px){ .grid>section{grid-column:span 12} }

        /* کارت KPI */
        section.card{
          grid-column:span 4;
          position:relative;
          overflow:hidden;
          padding:18px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(12,14,22,.7);
          backdrop-filter: blur(6px);
          transition: transform .18s ease, box-shadow .18s ease;
          box-shadow:0 6px 24px rgba(0,0,0,.25) inset;
        }
        section.card:hover{ transform: translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,.35) inset; }

        .head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
        .emoji{font-size:22px;opacity:.9}
        .titleBox{display:flex;flex-direction:column;gap:4px}
        .titleBox h3{margin:0;font-size:16px;font-weight:800}
        .titleBox .hint{font-size:12px;opacity:.75}

        .count{font-size:30px;font-weight:900;margin:10px 0 14px;letter-spacing:-.6px}
        .cta{display:inline-flex;gap:8px;align-items:center;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08)}
        .cta:hover{background:rgba(255,255,255,.14)}

        /* گرادینت نرم پس‌زمینه هر کارت */
        .g1::after,.g2::after,.g3::after,.g4::after,.g5::after,.g6::after{
          content:"";position:absolute;inset:-35%;
          background:
            radial-gradient(60% 60% at 85% 15%, var(--c1) 0%, transparent 55%),
            radial-gradient(60% 60% at 10% 90%, var(--c2) 0%, transparent 55%);
          opacity:.18;pointer-events:none;
        }
        .g1{--c1:#7c3aed;--c2:#06b6d4}
        .g2{--c1:#a21caf;--c2:#22d3ee}
        .g3{--c1:#2563eb;--c2:#22c55e}
        .g4{--c1:#f59e0b;--c2:#6366f1}
        .g5{--c1:#10b981;--c2:#f43f5e}
        .g6{--c1:#8b5cf6;--c2:#14b8a6}
      `}</style>
    </main>
  );
}

function Card({ emoji, title, hint, count, href, gradient, loading }) {
  return (
    <section className={`card ${gradient}`}>
      <div className="head">
        <span className="emoji">{emoji}</span>
      </div>
      <div className="titleBox">
        <h3>{title}</h3>
        <div className="hint">{hint}</div>
      </div>

      <div className="count">{loading ? "…" : Intl.NumberFormat("fa-IR").format(count || 0)}</div>

      <Link href={href} className="cta">
        <span>رفتن به {title}</span><span>↗</span>
      </Link>
    </section>
  );
}