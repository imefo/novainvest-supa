"use client";
import ReferralCard from "@/components/ReferralCard";
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// --- helpers ---
const rial = (n) =>
  new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

const statusChip = (s) => {
  const map = {
    approved: "تاییدشده",
    done: "تاییدشده",
    pending: "درحال بررسی",
    rejected: "رد شده",
    failed: "ناموفق",
  };
  return map[s] || s;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  const [balance, setBalance] = useState(0);
  const [invested, setInvested] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);

  const [portfolio, setPortfolio] = useState([]); // [{plan_name, amount, started_at, status, progress}]
  const [lastTx, setLastTx] = useState([]); // 8 تراکنش آخر

  // -------- load all ----------
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) {
          window.location.href = "/login?to=/dashboard";
          return;
        }
        if (!alive) return;
        setMe({ id: user.id, email: user.email });

        // 1) Transactions (approved deposits/withdrawals/profit)
        // اگر وضعیت‌های نهایی شما متفاوت است، این آرایه را تنظیم کن:
        const APPROVED = ["approved", "done", "success"];

        const { data: tx, error: txErr } = await supabase
          .from("transactions")
          .select("id,type,amount,status,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(200);
        if (txErr) throw txErr;

        const okTx = tx.filter((t) => APPROVED.includes(String(t.status)));

        // موجودی = واریز تاییدشده - برداشت تاییدشده + سودهای تاییدشده
        const dep = okTx
          .filter((t) => t.type === "deposit")
          .reduce((s, t) => s + Number(t.amount || 0), 0);
        const wd = okTx
          .filter((t) => t.type === "withdraw")
          .reduce((s, t) => s + Number(t.amount || 0), 0);
        const prof = okTx
          .filter((t) => t.type === "profit")
          .reduce((s, t) => s + Number(t.amount || 0), 0);

        const now = new Date();
        const mAgo = new Date(now);
        mAgo.setDate(now.getDate() - 30);
        const last30Profit = okTx
          .filter(
            (t) =>
              t.type === "profit" &&
              new Date(t.created_at) >= mAgo &&
              new Date(t.created_at) <= now
          )
          .reduce((s, t) => s + Number(t.amount || 0), 0);

        if (!alive) return;
        setBalance(dep - wd + prof);
        setMonthProfit(last30Profit);

        // 8 تراکنش آخر برای جدول
        setLastTx(tx.slice(0, 8));

        // 2) پرتفوی (از user_plans یا هر جدولی که داری)
        // اگر جدول شما نام دیگری دارد، این بخش را مطابقش عوض کن.
        // ستون‌های رایج: plan_id, plan_name, amount, status, started_at, ends_at
        const { data: up, error: upErr } = await supabase
          .from("user_plans")
          .select(
            "id, amount, status, started_at, ends_at, plans(name, duration_days)"
          )
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(50);
        if (upErr) {
          // اگر چنین جدولی نداری، پرتفوی را خالی بگذاریم تا UI کار کند
          setPortfolio([]);
        } else {
          const shaped = (up || []).map((r) => {
            const name = r?.plans?.name ?? "پلن";
            const dur = r?.plans?.duration_days ?? 0;
            const started = r?.started_at ? new Date(r.started_at) : null;
            const ends = r?.ends_at ? new Date(r.ends_at) : null;

            let progress = 0;
            if (started && ends && ends > started) {
              const total = ends - started;
              const elapsed = Math.min(Date.now() - started, total);
              progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
            }
            return {
              id: r.id,
              plan_name: name,
              amount: Number(r.amount || 0),
              status: r.status || "active",
              started_at: r.started_at,
              progress,
            };
          });

          setPortfolio(shaped);
          const inv = shaped.reduce((s, p) => s + Number(p.amount || 0), 0);
          setInvested(inv);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const totalPlans = portfolio.length;
  const activePlans = useMemo(
    () => portfolio.filter((p) => p.status === "active").length,
    [portfolio]
  );

  return (
    <div className="nv-container">
      {/* عنوان */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0 }}>داشبورد</h1>
        <div className="muted" style={{ fontSize: 14 }}>
          {me?.email || "—"}
        </div>
      </div>

      {/* KPI ها */}
      <div className="grid-kpi">
        <div className="card glass">
          <div className="kpi-label">موجودی کیف‌پول</div>
          <div className="kpi-value">{loading ? "…" : `${rial(balance)} تومان`}</div>
          <div className="kpi-actions">
            <Link href="/deposit" className="btn btn-primary">واریز</Link>
            <Link href="/dashboard/withdraw" className="btn">برداشت</Link>
          </div>
        </div>

        <div className="card glass">
          <div className="kpi-label">سرمایه‌گذاری‌ها</div>
          <div className="kpi-value">
            {loading ? "…" : `${rial(invested)} تومان`}
          </div>
          <div className="tiny muted">پلن‌های فعال: {activePlans}/{totalPlans}</div>
        </div>

        <div className="card glass">
          <div className="kpi-label">سود ۳۰ روز اخیر</div>
          <div className="kpi-value">{loading ? "…" : `${rial(monthProfit)} تومان`}</div>
          <div className="tiny muted">با به‌روزرسانی خودکار</div>
        </div>

        <div className="card glass">
          <div className="kpi-label">اقدامات سریع</div>
          <div className="kpi-qa">
            <Link href="/plans" className="btn">خرید پلن</Link>
            <Link href="/dashboard/transactions" className="btn">تراکنش‌ها</Link>
            <Link href="/profile" className="btn">پروفایل</Link>
          </div>
        </div>
      </div>

      {/* کیف پول – کارت مجزا و شکیل */}
      <div className="card glass wallet-card">
        <div className="wallet-head">
          <div>
            <div className="muted tiny">کیف‌پول</div>
            <div className="wallet-balance">{loading ? "…" : `${rial(balance)} تومان`}</div>
          </div>
          <div className="wallet-actions">
            <Link href="/deposit" className="btn btn-primary">واریز دستی (کریپتو)</Link>
            <Link href="/dashboard/withdraw" className="btn">درخواست برداشت</Link>
          </div>
        </div>
        <div className="muted tiny">
          * پس از واریز، اسکرین‌شات یا TxHash را در صفحه واریز بارگذاری کنید تا توسط ادمین تایید و کیف‌پول شما شارژ شود.
        </div>
      </div>

      {/* پرتفوی */}
      <div className="section-title" style={{ marginTop: 24 }}>پرتفوی</div>
      {portfolio.length === 0 ? (
        <div className="card glass" style={{ textAlign: "center" }}>
          هنوز سرمایه‌گذاری فعالی ندارید.{" "}
          <Link href="/plans" className="nv-link">همین حالا شروع کنید →</Link>
        </div>
      ) : (
        <div className="portfolio-grid">
          {portfolio.map((p) => (
            <div key={p.id} className="card glass">
              <div className="row-between">
                <div style={{ fontWeight: 600 }}>{p.plan_name}</div>
                <div className="badge">{p.status === "active" ? "فعال" : "غیرفعال"}</div>
              </div>
              <div className="muted tiny">مبلغ: {rial(p.amount)} تومان</div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${Math.round(p.progress)}%` }} />
              </div>
              <div className="row-between tiny muted">
                <span>پیشرفت</span>
                <span>%{Math.round(p.progress)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* تراکنش‌های اخیر */}
      <div className="section-title" style={{ marginTop: 24 }}>
        تراکنش‌های اخیر
      </div>
      <div className="card glass">
        {lastTx.length === 0 ? (
          <div className="muted tiny">تراکنشی ثبت نشده است.</div>
        ) : (
          <div className="table">
            <div className="thead">
              <div>نوع</div>
              <div>مبلغ</div>
              <div>وضعیت</div>
              <div>تاریخ</div>
            </div>
            {lastTx.map((t) => (
              <div key={t.id} className="trow">
                <div>{t.type === "deposit" ? "واریز" : t.type === "withdraw" ? "برداشت" : t.type === "profit" ? "سود" : t.type}</div>
                <div>{rial(t.amount)} تومان</div>
                <div className={`chip ${t.status}`}>{statusChip(t.status)}</div>
                <div className="muted tiny">
                  {new Date(t.created_at).toLocaleString("fa-IR")}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: "left", marginTop: 10 }}>
          <Link href="/dashboard/transactions" className="nv-link">نمایش همه →</Link>
        </div>
      </div>
    </div>
  );
}