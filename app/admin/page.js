"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminHome() {
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    txPending: 0,
    kycPending: 0,
    ticketsOpen: 0,
    depositsPending: 0,
    withdrawalsPending: 0,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const countOf = async (table, filter = (q) => q) => {
          const { count } = await filter(
            supabase.from(table).select("*", { count: "exact", head: true })
          );
          return count || 0;
        };

        const [users, plans, kycPending, ticketsOpen, txPending, depPending, wdPending] =
          await Promise.all([
            countOf("profiles"),
            countOf("plans"),
            countOf("kyc_requests", (q) => q.eq("status", "pending")),
            countOf("tickets", (q) => q.eq("status", "open")),
            countOf("transactions", (q) => q.eq("status", "pending")),
            countOf("transactions", (q) => q.eq("type", "deposit").eq("status", "pending")),
            countOf("transactions", (q) => q.eq("type", "withdraw").eq("status", "pending")),
          ]);

        if (alive) {
          setStats({
            users,
            plans,
            kycPending,
            ticketsOpen,
            txPending,
            depositsPending: depPending,
            withdrawalsPending: wdPending,
          });
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const cards = [
    { title: "کاربران", desc: "مشاهده / مسدودسازی / تغییر موجودی", count: stats.users, href: "/admin/users", icon: "👤", accent: "var(--acc1)" },
    { title: "پلن‌ها", desc: "ایجاد/ویرایش/حذف پلن + فعال/غیرفعال", count: stats.plans, href: "/admin/plans", icon: "📝", accent: "var(--acc2)" },
    { title: "تراکنش‌ها", desc: "واریز/برداشت‌ها و وضعیت‌ها", count: stats.txPending, hint: "در انتظار", href: "/admin/transactions", icon: "🧾", accent: "var(--acc3)" },
    { title: "KYC", desc: "تایید/رد احراز هویت کاربران", count: stats.kycPending, hint: "در انتظار", href: "/admin/kyc", icon: "🪪", accent: "var(--acc4)" },
    { title: "واریز/برداشت", desc: "تنظیم ارز و آدرس ولت + تایید دستی", count: stats.depositsPending + stats.withdrawalsPending, hint: "در انتظار", href: "/admin/deposit", icon: "💰", accent: "var(--acc5)" },
    { title: "تیکت‌ها", desc: "پاسخگویی و بستن گفتگو", count: stats.ticketsOpen, hint: "باز", href: "/admin/tickets", icon: "🎧", accent: "var(--acc6)" },
    { title: "دعوت‌ها", desc: "بررسی و تنظیم ریفرال/جوایز", count: "→", href: "/admin/referrals", icon: "🎁", accent: "var(--acc7)" },

    // 👇 کارت جدید مسابقه
    { title: "مسابقه‌ی دعوت", desc: "تنظیم بازه، جایزه و لیدربورد", count: "🏆", href: "/admin/competition", icon: "🏆", accent: "var(--acc9, var(--acc5))" },

    { title: "بازگشت به سایت", desc: "نمای کاربر / داشبورد", count: "←", href: "/dashboard", icon: "🏠", accent: "var(--acc8)" },
  ];

  return (
    <div className="admin-wrap">
      <div className="admin-top">
        <div className="admin-breadcrumb">
          <Link href="/" className="btn-ghost">بازگشت به سایت</Link>
          <Link href="/dashboard" className="btn-ghost">بازگشت به داشبورد کاربر</Link>
        </div>
        <div>
          <h1 className="admin-title">پنل ادمین</h1>
          <p className="admin-sub">مدیریت کلِ سیستم</p>
        </div>
      </div>

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
            <div className="admin-card__cta">رفتن به {c.title} ↗</div>
          </Link>
        ))}
      </div>
    </div>
  );
}