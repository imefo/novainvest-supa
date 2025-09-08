"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ReferralCard from "@/components/ReferralCard";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({ usdt: 0 });
  const [stats, setStats] = useState({ last30d: 0, plansCount: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        setLoading(true);

        // session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUser(null);
          setLoading(false);
          return;
        }
        if (!alive) return;
        setUser({ id: user.id, email: user.email ?? "" });

        // balance
        const { data: bal, error: eBal } = await supabase
          .from("user_balances")
          .select("usdt_balance")
          .eq("user_id", user.id)
          .single();
        if (eBal && eBal.code !== "PGRST116") throw eBal; // ignore "no rows" only
        if (!alive) return;
        setWallet({ usdt: bal?.usdt_balance ?? 0 });

        // simple stats (plans count + last 30d profit placeholder = 0)
        const { count } = await supabase
          .from("user_plans")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (!alive) return;
        setStats({ last30d: 0, plansCount: count ?? 0 });
      } catch (err) {
        console.error(err);
        setError("مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="nv-container">
        <div className="glass p-6 rounded-xl text-slate-200 text-center">در حال بارگذاری داشبورد…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="nv-container">
        <div className="glass p-6 rounded-xl text-slate-200">
          <p>برای مشاهده داشبورد وارد شوید.</p>
          <div className="mt-4">
            <Link className="nv-btn nv-btn-primary" href="/login">ورود</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nv-container">
      {error && (
        <div className="glass rounded-xl p-4 mb-4 text-red-300">
          {error}
        </div>
      )}

      {/* Top tiles */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="text-slate-400 text-sm">موجودی کیف‌پول (USDT)</div>
          <div className="text-2xl mt-2 font-bold">{wallet.usdt.toFixed(2)}</div>
          <div className="mt-4 flex gap-8">
            <Link href="/deposit" className="nv-btn nv-btn-primary">واریز</Link>
            <Link href="/dashboard/withdraw" className="nv-btn">برداشت</Link>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="text-slate-400 text-sm">سود ۳۰ روز اخیر</div>
          <div className="text-2xl mt-2 font-bold">{stats.last30d.toFixed(2)} USDT</div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="text-slate-400 text-sm">سرمایه‌گذاری‌ها</div>
          <div className="text-2xl mt-2 font-bold">{stats.plansCount}</div>
          <div className="mt-4">
            <Link href="/plans" className="nv-btn">مشاهده پلن‌ها</Link>
          </div>
        </div>
      </div>

      {/* Referral */}
      <ReferralCard />

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="glass rounded-xl p-4">
          <div className="text-slate-300 font-semibold mb-2">اقدامات سریع</div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/plans" className="nv-btn">خرید پلن</Link>
            <Link href="/dashboard/transactions" className="nv-btn">تراکنش‌ها</Link>
            <Link href="/dashboard/profile" className="nv-btn">پروفایل</Link>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-slate-300 font-semibold mb-2">واریز دستی (کریپتو)</div>
          <p className="text-slate-400 text-sm">
            پس از واریز، اسکرین‌شات یا TxHash را در صفحه واریز بارگذاری کنید تا توسط ادمین تأیید و کیف‌پول شارژ شود.
          </p>
          <div className="mt-3">
            <Link href="/deposit" className="nv-btn nv-btn-primary">صفحه واریز</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
