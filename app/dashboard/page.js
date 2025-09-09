"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ReferralCard from "@/components/ReferralCard";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [invested, setInvested] = useState(null);
  const [last30, setLast30] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");

        // 1) کاربر
        const { data: u, error: eU } = await supabase.auth.getUser();
        if (eU) throw eU;
        if (!u?.user) {
          setErr("ابتدا وارد شوید.");
          return;
        }
        if (!alive) return;
        setUser(u.user);

        // 2) موجودی کیف‌پول USDT (اگر رکورد نبود → 0)
        const { data: bRow, error: eB } = await supabase
          .from("user_balances")
          .select("balance")
          .eq("user_id", u.user.id)
          .eq("currency", "USDT")
          .maybeSingle();
        if (eB) throw eB;
        setBalance(bRow?.balance ?? 0);

        // 3) مقادیر نمایشی (فعلاً صفر تا بعداً RPC واقعی بسازیم)
        setInvested(0);
        setLast30(0);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "خطا در بارگذاری داشبورد");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  return (
    <div className="nv-container dash">
      <div className="dash-grid">
        {/* سایدبار */}
        <aside className="side">
          <div className="side-card glass">
            <div className="brand">NovalInvest</div>
            <div className="muted" style={{ marginTop: 4 }}>{user?.email}</div>
            <nav className="side-nav" style={{ marginTop: 12 }}>
              <Link href="/dashboard" className="side-link">داشبورد</Link>
              <Link href="/dashboard/transactions" className="side-link">تراکنش‌ها</Link>
              <Link href="/plans" className="side-link">پلن‌ها</Link>
              <Link href="/deposit" className="side-link">واریز</Link>
              <Link href="/logout" className="side-link danger">خروج</Link>
            </nav>
          </div>
        </aside>

        {/* محتوای اصلی */}
        <main className="main">
          <h1 style={{ marginBottom: 12 }}>داشبورد</h1>

          {/* ردیف آمار */}
          <div className="stats">
            <div className="stat glass">
              <div className="label">موجودی کیف‌پول (USDT)</div>
              <div className="value">
                {balance == null ? "…" : fmt.format(Number(balance))}
              </div>
              <div className="row gap">
                <Link href="/deposit" className="btn primary">واریز</Link>
                <Link href="/withdraw" className="btn">برداشت</Link>
              </div>
            </div>

            <div className="stat glass">
              <div className="label">سود ۳۰ روز اخیر</div>
              <div className="value">
                {last30 == null ? "…" : fmt.format(Number(last30))}
              </div>
              <div className="muted">با بازتوزیع خودکار</div>
            </div>

            <div className="stat glass">
              <div className="label">سرمایه‌گذاری‌ها</div>
              <div className="value">
                {invested == null ? "…" : fmt.format(Number(invested))}
              </div>
              <Link href="/plans" className="btn">مشاهده پلن‌ها</Link>
            </div>
          </div>

          {/* کارت‌ها: کیف پول + دعوت */}
          <div className="cards two" style={{ marginTop: 12 }}>
            <div className="card glass">
              <div className="card-head">کیف‌پول</div>
              <p className="muted">
                پس از واریز، اسکرین‌شات یا TxHash را در صفحه واریز بارگذاری کنید تا توسط ادمین تأیید و کیف‌پول شارژ شود.
              </p>
              <Link href="/deposit" className="btn primary">صفحه واریز</Link>
            </div>

            <ReferralCard />
          </div>

          {/* شورتکات‌ها */}
          <div className="row gap wrap" style={{ marginTop: 12 }}>
            <Link href="/plans" className="chip">خرید پلن</Link>
            <Link href="/dashboard/transactions" className="chip">تراکنش‌ها</Link>
            <Link href="/profile" className="chip">پروفایل</Link>
          </div>

          {/* ارور کلی (در صورت وجود) */}
          {err && <div className="alert error" style={{ marginTop: 12 }}>{err}</div>}

          {/* جدول ترنزاکشن‌های اخیر */}
          <div className="card glass" style={{ marginTop: 12 }}>
            <div className="card-head">تراکنش‌های اخیر</div>
            <div className="muted">تراکنشی ثبت نشده است.</div>
          </div>
        </main>
      </div>
    </div>
  );
}