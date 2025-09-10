"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ReferralCard from "@/components/ReferralCard";
import WalletCard from "@/components/walletCard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(0);
  const [profit30d, setProfit30d] = useState(0);
  const [invested, setInvested] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // موجودی کیف‌پول (اگر currency نداریم، فقط مقدار پیش‌فرض رو می‌خوانیم)
        const { data: bal } = await supabase
          .from("user_balances")
          .select("amount")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!alive) return;
        setWallet(bal?.amount ?? 0);

        // جمع سرمایه‌گذاری‌های فعال (اگر ویو/ستون‌ها آماده‌ست)
        const { data: inv } = await supabase
          .from("user_plans")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "active");
        if (!alive) return;
        const sumInvested = (inv ?? []).reduce((s, r) => s + (r.amount || 0), 0);
        setInvested(sumInvested);

        // سود ۳۰ روز اخیر (ساده و محافظه‌کارانه)
        const { data: txs } = await supabase
          .from("transactions")
          .select("amount,type,created_at")
          .eq("user_id", user.id)
          .eq("type", "profit")
          .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());
        if (!alive) return;
        const sumProfit = (txs ?? []).reduce((s, r) => s + (r.amount || 0), 0);
        setProfit30d(sumProfit);
      } catch (e) {
        if (!alive) return;
        setErr("مشکل پیش آمد. لطفاً دوباره تلاش کنید.");
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  return (
    <div className="nv-stack" style={{ display: "grid", gap: 16 }}>
      {/* عنوان */}
      <div className="nv-card-title" style={{ fontSize: 22, marginBottom: 4 }}>
        داشبورد
      </div>
      {err && (
        <div className="nv-card" style={{ borderColor: "rgba(255,80,80,.4)" }}>
          {err}
        </div>
      )}

      {/* سه کاشی خلاصه */}
      <div
        className="nv-grid"
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
        }}
      >
        <div className="nv-card">
          <div className="nv-muted">موجودی کیف‌پول (USDT)</div>
          <div className="nv-number">{wallet.toFixed(2)}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Link className="nv-btn" href="/deposit">واریز</Link>
            <Link className="nv-btn" href="/withdraw">برداشت</Link>
          </div>
        </div>

        <div className="nv-card">
          <div className="nv-muted">سود ۳۰ روز اخیر</div>
          <div className="nv-number">{profit30d.toFixed(2)} USDT</div>
          <div className="nv-muted" style={{ fontSize: 12 }}>با بازتوزیع خودکار</div>
        </div>

        <div className="nv-card">
          <div className="nv-muted">سرمایه‌گذاری‌ها</div>
          <div className="nv-number">{invested.toFixed(2)} USDT</div>
          <Link className="nv-btn" href="/plans" style={{ marginTop: 10 }}>
            مشاهده پلن‌ها
          </Link>
        </div>
      </div>

      {/* کیف‌پول + دعوت */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        <WalletCard />
        <ReferralCard />
      </div>

      {/* شورتکات‌ها */}
      <div
        className="nv-card"
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        <Link className="nv-btn" href="/plans">خرید پلن</Link>
        <Link className="nv-btn" href="/dashboard/transactions">تراکنش‌ها</Link>
        <Link className="nv-btn" href="/profile">پروفایل</Link>
        <Link className="nv-btn" href="/deposit">واریز دستی (کریپتو)</Link>
      </div>
    </div>
  );
}