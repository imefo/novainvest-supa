"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    balanceUSDT: 0,
    profit30d: 0,
    activeInvests: 0,
    pendingTx: 0,
    ticketsOpen: 0,
    hasWallet: false,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !alive) return;
        setUser(user);

        const countOf = async (table, filter = (q) => q) => {
          const { count } = await filter(
            supabase.from(table).select("*", { count: "exact", head: true })
          );
          return count || 0;
        };

        // بالانس USDT
        let balanceUSDT = 0;
        try {
          const { data } = await supabase
            .from("user_balances")
            .select("amount")
            .eq("user_id", user.id)
            .eq("currency", "USDT")
            .maybeSingle();
          balanceUSDT = data?.amount || 0;
        } catch {}

        // ولت ثبت شده؟
        let hasWallet = false;
        try {
          const { data } = await supabase
            .from("profiles")
            .select("usdt_wallet_addr")
            .eq("user_id", user.id)
            .maybeSingle();
          hasWallet = !!data?.usdt_wallet_addr;
        } catch {}

        const [activeInvests, pendingTx, ticketsOpen] = await Promise.all([
          countOf("user_plans", (q) => q.eq("user_id", user.id).eq("is_active", true)),
          countOf("transactions", (q) => q.eq("user_id", user.id).eq("status", "pending")),
          countOf("tickets", (q) => q.eq("user_id", user.id).eq("status", "open")),
        ]);

        // سود ۳۰ روز اخیر
        let profit30d = 0;
        try {
          const { data } = await supabase
            .from("ledger")
            .select("amount, type, created_at")
            .eq("user_id", user.id)
            .gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString());
          profit30d =
            (data || [])
              .filter((x) => x.type === "profit")
              .reduce((sum, x) => sum + (Number(x.amount) || 0), 0) || 0;
        } catch {}

        if (!alive) return;
        setStats({ balanceUSDT, profit30d, activeInvests, pendingTx, ticketsOpen, hasWallet });
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const cards = [
    {
      title: "موجودی کیف‌پول",
      desc: "موجودی لحظه‌ای شما (USDT)",
      count: stats.balanceUSDT.toFixed(2),
      href: "/dashboard/wallet",
      icon: "💎",
      accent: "var(--acc5)",
    },
    {
      title: "واریز / برداشت",
      desc: "شارژ یا برداشت موجودی",
      count: stats.pendingTx,
      hint: "در انتظار",
      href: "/dashboard/wallet",
      icon: "💳",
      accent: "var(--acc3)",
    },
    {
      title: "سود ۳۰ روز اخیر",
      desc: "با بازتوزیع خودکار",
      count: stats.profit30d.toFixed(2),
      href: "/dashboard/transactions",
      icon: "📈",
      accent: "var(--acc2)",
    },
    {
      title: "سرمایه‌گذاری‌های فعال",
      desc: "وضعیت پلن‌ها و سودآوری",
      count: stats.activeInvests,
      href: "/plans",
      icon: "📦",
      accent: "var(--acc4)",
    },
    {
      title: "لینک دعوت",
      desc: "با هر دعوت موفق 0.50 USDT پاداش بگیر",
      count: "→",
      href: "/dashboard/referral",
      icon: "🎁",
      accent: "var(--acc7)",
    },
    {
      title: "تیکت‌های پشتیبانی",
      desc: "ایجاد تیکت و دیدن پاسخ‌ها",
      count: stats.ticketsOpen,
      hint: "باز",
      href: "/dashboard/support",
      icon: "🎧",
      accent: "var(--acc6)",
    },
    {
      title: "مسابقه دعوت‌ها",
      desc: "هر ۱۵ روز، بیشترین دعوت 100 USDT جایزه",
      count: "🏆",
      href: "/dashboard/competition",
      icon: "🔥",
      accent: "var(--acc9)",
    },
    {
      title: "تنظیم کیف‌پول",
      desc: stats.hasWallet ? "آدرس ثبت شده است" : "ثبت آدرس USDT (TRC20)",
      count: stats.hasWallet ? "✓" : "✎",
      href: "/dashboard/wallet",
      icon: "🔐",
      accent: "var(--acc1)",
    },
    {
      title: "پروفایل",
      desc: "نام، ایمیل، KYC و تنظیمات",
      count: "→",
      href: "/dashboard/profile",
      icon: "⚙️",
      accent: "var(--acc8)",
    },
  ];

  return (
    <div className="admin-grid">
      {cards.map((c, i) => (
        <Link href={c.href} key={i} className="admin-card" style={{ ['--ring']: c.accent }}>
          <div className="admin-card__icon" aria-hidden>{c.icon}</div>
          <div className="admin-card__head">
            <h3>{c.title}</h3>
            <div className="admin-chip">
              <span>{c.count}</span>
              {c.hint ? <small>{c.hint}</small> : null}
            </div>
          </div>
          <p className="admin-card__desc">{c.desc}</p>
          <div className="admin-card__cta">برو به {c.title} ↗</div>
        </Link>
      ))}
    </div>
  );
}