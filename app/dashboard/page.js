"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ReferralCard from "@/components/ReferralCard";

/** مدل‌های کوچک برای State */
function fmtUSDT(v) {
  if (v == null || isNaN(v)) return "0.00";
  return Number(v).toFixed(2);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [txs, setTxs] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // کاربر
        const { data: udata, error: uerr } = await supabase.auth.getUser();
        if (uerr) throw uerr;
        const u = udata?.user ?? null;
        if (!u) {
          setUser(null);
          return;
        }
        setUser({ id: u.id, email: u.email || "" });

        // پروفایل (والت/بالانس/ادمین)
        const { data: prow, error: perr } = await supabase
          .from("profiles")
          .select("user_id, full_name, is_admin, usdt_wallet_addr, usdt_wallet_balance")
          .eq("user_id", u.id)
          .maybeSingle();
        if (perr) throw perr;
        setProfile(prow || null);

        // ۵ تراکنش آخر
        const { data: txRows, error: txErr } = await supabase
          .from("transactions")
          .select("id, created_at, type, amount_usdt, status")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false })
          .limit(5);
        if (txErr) throw txErr;
        setTxs(txRows || []);
      } catch (e) {
        console.error(e);
        setErr("مشکل پیش آمد. لطفاً دوباره تلاش کنید.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const balance = profile?.usdt_wallet_balance ?? 0;

  return (
    <div className="dash-wrap">
      {/* عنوان */}
      <div className="dash-top">
        <div className="title">داشبورد</div>
        {user?.email && <div className="muted">{user.email}</div>}
      </div>

      {/* خطا */}
      {err && <div className="alert error">{err}</div>}

      {/* کاشی‌های خلاصه */}
      <div className="tiles">
        <div className="card">
          <div className="card-head">
            <span>موجودی کیف‌پول (USDT)</span>
          </div>
          <div className="stat">{fmtUSDT(balance)} <span className="unit">USDT</span></div>
          <div className="row gap8">
            <Link href="/deposit" className="nv-btn nv-btn-primary">واریز</Link>
            <Link href="/withdraw" className="nv-btn" aria-disabled>برداشت</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span>سود ۳۰ روز اخیر</span>
          </div>
          <div className="stat">0.00 <span className="unit">USDT</span></div>
          <div className="muted">با بازتوزیعِ خودکار</div>
        </div>

        <div className="card">
          <div className="card-head">
            <span>سرمایه‌گذاری‌ها</span>
          </div>
          <div className="stat">0</div>
          <Link className="nv-btn" href="/plans">مشاهده پلن‌ها</Link>
        </div>
      </div>

      {/* دعوت و کیف‌پول */}
      <div className="grid-2">
        <ReferralCard />
        <div className="card">
          <div className="card-head">
            <span>کیف‌پول</span>
          </div>
          <div className="muted">
            * پس از واریز، اسکرین‌شات یا TxHash را در صفحه واریز بارگذاری کنید تا توسط ادمین تأیید و کیف‌پول شارژ شود.
          </div>
          <div className="row gap8 mt12">
            <Link href="/deposit" className="nv-btn nv-btn-primary">صفحه واریز</Link>
            {profile?.usdt_wallet_addr ? (
              <button
                className="nv-btn"
                onClick={() => navigator.clipboard.writeText(profile.usdt_wallet_addr)}
              >
                کپی آدرس دریافت شما
              </button>
            ) : (
              <span className="muted">آدرس دریافت هنوز ثبت نشده است.</span>
            )}
          </div>
        </div>
      </div>

      {/* اقدامات سریع */}
      <div className="quick grid-4">
        <Link className="pill" href="/plans">خرید پلن</Link>
        <Link className="pill" href="/dashboard/transactions">تراکنش‌ها</Link>
        <Link className="pill" href="/profile">پروفایل</Link>
        <Link className="pill" href="/deposit">واریز دستی (کریپتو)</Link>
      </div>

      {/* تراکنش‌های اخیر */}
      <div className="card mt16">
        <div className="card-head"><span>تراکنش‌های اخیر</span></div>
        {loading ? (
          <div className="muted">در حال بارگذاری…</div>
        ) : txs?.length ? (
          <div className="tx-list">
            {txs.map((t) => (
              <div key={t.id} className="tx-row">
                <div className={`badge ${t.status}`}>{t.status}</div>
                <div className="tx-type">{t.type}</div>
                <div className="grow" />
                <div className="tx-amt">{fmtUSDT(t.amount_usdt)} USDT</div>
                <div className="tx-date">{new Date(t.created_at).toLocaleString("fa-IR")}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">تراکنشی ثبت نشده است.</div>
        )}
      </div>
    </div>
  );
}