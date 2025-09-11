"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ReferralCard from "@/components/ReferralCard";
import WalletCard from "@/components/walletCard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [wallet, setWallet] = useState(0);
  const [profit30d, setProfit30d] = useState(0);
  const [invested, setInvested] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // کیف‌پول
        const { data: bal } = await supabase
          .from("user_balances")
          .select("amount")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!alive) return;
        setWallet(bal?.amount ?? 0);

        // سرمایه‌گذاری‌های فعال
        const { data: ups } = await supabase
          .from("user_plans")
          .select("amount,status")
          .eq("user_id", user.id)
          .eq("status", "active");
        const investedSum = (ups ?? []).reduce((s, r) => s + (r.amount || 0), 0);
        if (!alive) return;
        setInvested(investedSum);

        // سود ۳۰ روز اخیر
        const since = new Date(Date.now() - 30 * 86400000).toISOString();
        const { data: txs } = await supabase
          .from("transactions")
          .select("amount,type,created_at")
          .eq("user_id", user.id)
          .eq("type", "profit")
          .gte("created_at", since);
        const p = (txs ?? []).reduce((s, r) => s + (r.amount || 0), 0);
        if (!alive) return;
        setProfit30d(p);
      } catch (e) {
        console.error(e);
        if (alive) setErr("مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  return (
    <div className="lux-stack">
      {/* Hero */}
      <section className="lux-hero">
        <div className="title">داشبورد</div>
        <div className="sub">وضعیت کلی حساب، کیف‌پول و سرمایه‌گذاری‌ها</div>
        <div className="actions">
          <Link className="lux-chip" href="/plans">خرید پلن</Link>
          <Link className="lux-chip" href="/dashboard/transactions">تراکنش‌ها</Link>
        </div>
      </section>

      {/* خطا */}
      {err && <div className="lux-alert">{err}</div>}

      {/* متریک‌ها */}
      <section className="lux-metrics">
        <Metric
          title="موجودی کیف‌پول (USDT)"
          value={wallet}
          gradient="g1"
          actions={
            <div className="metric-actions">
              <Link className="lux-btn sm" href="/deposit">واریز</Link>
              <Link className="lux-btn sm" href="/withdraw">برداشت</Link>
            </div>
          }
          loading={loading}
        />
        <Metric
          title="سود ۳۰ روز اخیر"
          value={profit30d}
          suffix="USDT"
          gradient="g2"
          loading={loading}
        />
        <Metric
          title="سرمایه‌گذاری‌های فعال"
          value={invested}
          suffix="USDT"
          gradient="g3"
          actions={<Link className="lux-btn sm" href="/plans">مشاهده پلن‌ها</Link>}
          loading={loading}
        />
      </section>

      {/* کیف‌پول + دعوت */}
      <section className="lux-two">
        <WalletCard />
        <ReferralCard />
      </section>

      {/* CTA پایین صفحه */}
      <section className="lux-cta">
        <div className="text">
          آماده‌ای درآمدت رو شروع کنی؟ پلن مناسب رو انتخاب کن.
        </div>
        <Link className="lux-btn xl primary" href="/plans">شروع سرمایه‌گذاری</Link>
      </section>
    </div>
  );
}

function Metric({ title, value, suffix = "", gradient = "g1", actions, loading }) {
  return (
    <div className={`lux-metric ${gradient}`}>
      <div className="m-title">{title}</div>
      <div className="m-value">
        {loading ? <span className="skeleton" /> : (
          <>
            {Number(value || 0).toFixed(2)}{" "}
            <span className="suffix">{suffix}</span>
          </>
        )}
      </div>
      {actions && <div className="m-actions">{actions}</div>}
    </div>
  );
} 