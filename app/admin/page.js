"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

/**
 * داشبورد ادمین با کارت‌های KPI
 * کارت‌ها: کاربران، پلن‌ها، تراکنش‌ها، KYC، تیکت‌ها، واریز/برداشت
 * هر کارت یک شمارنده (count) و دکمه‌ی رفتن به صفحه‌ی مربوطه دارد.
 * سایدبار حذف شده و همه‌چیز روی یک گرید ریسپانسیو نمایش داده می‌شود.
 */

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    txs: 0,
    kycPending: 0,
    ticketsOpen: 0,
    depositsPending: 0,
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // تعداد کاربران از جدول profiles
        const { count: usersCount, error: e1 } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        if (e1) throw e1;

        // تعداد پلن‌ها از جدول plans
        const { count: plansCount, error: e2 } = await supabase
          .from("plans")
          .select("*", { count: "exact", head: true });
        if (e2) throw e2;

        // تعداد تراکنش‌ها از جدول transactions
        const { count: txCount, error: e3 } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true });
        if (e3) throw e3;

        // KYC در انتظار از kyc_requests (فرض: ستون status دارد)
        const { count: kycCount, error: e4 } = await supabase
          .from("kyc_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
        if (e4) throw e4;

        // تیکت‌های باز از tickets (فرض: ستون status دارد: open/answered/closed)
        const { count: ticketsCount, error: e5 } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");
        if (e5) throw e5;

        // واریز/برداشت‌های در انتظار از deposits (فرض: ستون status دارد)
        const { count: depCount, error: e6 } = await supabase
          .from("deposits")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
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
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="admin-wrap">
      <div className="admin-head">
        <div className="admin-title">
          پنل ادمین
          <span className="admin-sub">مدیریت کلی سیستم</span>
        </div>

        <div className="admin-actions">
          <Link href="/dashboard" className="btn ghost">بازگشت به داشبورد کاربر</Link>
          <Link href="/" className="btn ghost">بازگشت به سایت</Link>
        </div>
      </div>

      {err ? (
        <div className="alert error">خطا: {err}</div>
      ) : null}

      <div className="kpi-grid">
        <KpiCard
          color="gradient-1"
          title="کاربران"
          hint="مشاهده و مدیریت کاربران + تغییر موجودی"
          count={stats.users}
          cta="رفتن به کاربران"
          href="/admin/users"
          emoji="🧑‍💼"
          loading={loading}
        />

        <KpiCard
          color="gradient-2"
          title="پلن‌ها"
          hint="ایجاد/ویرایش/حذف پلن‌ها + فعال/غیرفعال"
          count={stats.plans}
          cta="رفتن به پلن‌ها"
          href="/admin/plans"
          emoji="📈"
          loading={loading}
        />

        <KpiCard
          color="gradient-3"
          title="تراکنش‌ها"
          hint="واریز/برداشت‌ها و وضعیت‌ها"
          count={stats.txs}
          cta="رفتن به تراکنش‌ها"
          href="/admin/transactions"
          emoji="💳"
          loading={loading}
        />

        <KpiCard
          color="gradient-4"
          title="KYC در انتظار"
          hint="تأیید/رد احراز هویت کاربران"
          count={stats.kycPending}
          cta="رفتن به KYC"
          href="/admin/kyc"
          emoji="🪪"
          loading={loading}
        />

        <KpiCard
          color="gradient-5"
          title="واریز/برداشت در انتظار"
          hint="تنظیم ارز و آدرس ولت + تایید دستی"
          count={stats.depositsPending}
          cta="رفتن به واریز/برداشت"
          href="/admin/deposit"
          emoji="💰"
          loading={loading}
        />

        <KpiCard
          color="gradient-6"
          title="تیکت‌های باز"
          hint="پاسخگویی به تیکت‌ها و بستن گفتگو"
          count={stats.ticketsOpen}
          cta="رفتن به تیکت‌ها"
          href="/admin/tickets"
          emoji="🎧"
          loading={loading}
        />
      </div>

      <style jsx>{`
        .admin-wrap {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .admin-title {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.2px;
        }
        .admin-sub {
          font-size: 13px;
          font-weight: 500;
          opacity: 0.7;
        }

        .admin-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 10px 14px;
          font-size: 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          transition: 180ms ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.1);
        }
        .btn.ghost {
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.25);
        }

        .alert.error {
          background: rgba(255, 69, 58, 0.2);
          border: 1px solid rgba(255, 99, 71, 0.4);
          color: #ffdada;
          padding: 10px 12px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 14px;
        }
        /* 6 کارت در دو ردیف: هر کارت روی دسکتاپ span=4 (سه تا در هر ردیف) */
        .kpi {
          grid-column: span 4;
          min-height: 150px;
          border-radius: 16px;
          padding: 18px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(10,12,20,0.6);
          backdrop-filter: blur(6px);
        }
        @media (max-width: 980px) {
          .kpi { grid-column: span 6; }
        }
        @media (max-width: 640px) {
          .kpi { grid-column: span 12; }
        }

        .kpi .badge {
          position: absolute;
          right: 12px;
          top: 12px;
          font-size: 18px;
          opacity: 0.9;
        }

        .kpi h3 {
          font-size: 16px;
          font-weight: 800;
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kpi p {
          font-size: 12.5px;
          opacity: 0.75;
          margin: 0 0 14px;
          min-height: 32px;
        }

        .kpi .count {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }

        .kpi .cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13.5px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .kpi .cta:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.14);
        }

        /* گرادیانت‌های ظریف گوشه‌ها */
        .gradient-1::after,
        .gradient-2::after,
        .gradient-3::after,
        .gradient-4::after,
        .gradient-5::after,
        .gradient-6::after {
          content: "";
          position: absolute;
          inset: -30%;
          background: radial-gradient(60% 60% at 85% 15%, var(--g1, #7c3aed) 0%, transparent 60%),
                      radial-gradient(60% 60% at 10% 90%, var(--g2, #06b6d4) 0%, transparent 60%);
          opacity: 0.18;
          pointer-events: none;
        }
        .gradient-1 { --g1:#7c3aed; --g2:#06b6d4; }
        .gradient-2 { --g1:#a21caf; --g2:#22d3ee; }
        .gradient-3 { --g1:#2563eb; --g2:#22c55e; }
        .gradient-4 { --g1:#f59e0b; --g2:#6366f1; }
        .gradient-5 { --g1:#10b981; --g2:#f43f5e; }
        .gradient-6 { --g1:#8b5cf6; --g2:#14b8a6; }

        .muted {
          opacity: 0.7;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

function KpiCard({ color, title, hint, count, cta, href, emoji, loading }) {
  return (
    <div className={`kpi ${color}`}>
      <div className="badge">{emoji}</div>
      <h3>{title}</h3>
      <p className="muted">{hint}</p>

      <div className="count">{loading ? "…" : Intl.NumberFormat("fa-IR").format(count || 0)}</div>

      <Link className="cta" href={href}>
        <span>رفتن به {title.replace("‌", "").replace("ها", "")}</span> <span>↗</span>
      </Link>
    </div>
  );
}