"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReferralDashboard() {
  const [user, setUser] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAll: 0, totalApproved: 0 });

  // یک کد کوتاه و یکتا بساز
  function makeCode(uid) {
    const rand = Math.random().toString(36).slice(2, 8);
    const suf = (uid || "").replace(/-/g, "").slice(0, 4);
    return `nv-${rand}${suf}`.toLowerCase();
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 1) گرفتن کاربر
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !alive) return;
        setUser(user);

        // 2) کد دعوت کاربر (اگر نبود، بساز)
        let myCode = "";
        {
          const { data } = await supabase
            .from("referral_codes")
            .select("code")
            .eq("user_id", user.id)
            .maybeSingle();

          if (data?.code) {
            myCode = data.code;
          } else {
            // تلاش برای ساخت کد
            const newCode = makeCode(user.id);
            // upsert براساس user_id؛ اگر constraint نداری، از insert ساده استفاده کن
            const { data: ins, error: eIns } = await supabase
              .from("referral_codes")
              .upsert(
                { user_id: user.id, code: newCode },
                { onConflict: "user_id", ignoreDuplicates: false }
              )
              .select()
              .maybeSingle();

            if (!eIns && ins?.code) {
              myCode = ins.code;
            } else {
              // fallback: یک بار دیگر با کد رندوم
              const alt = makeCode("");
              await supabase.from("referral_codes").upsert(
                { user_id: user.id, code: alt },
                { onConflict: "user_id", ignoreDuplicates: false }
              );
              myCode = alt;
            }
          }
        }
        if (!alive) return;
        setCode(myCode);

        // 3) آمار دعوت‌ها
        // totalAll = همه‌ی رکوردهایی که referrer_code = code
        // totalApproved = فقط status = 'approved'
        const [{ count: cAll }, { count: cOk }] = await Promise.all([
          supabase.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_code", myCode),
          supabase.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_code", myCode).eq("status", "approved"),
        ]);

        if (!alive) return;
        setStats({
          totalAll: cAll || 0,
          totalApproved: cOk || 0,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const inviteLink = useMemo(() => {
    if (!code) return "";
    if (typeof window === "undefined") return `/signup?ref=${code}`;
    return `${location.origin}/signup?ref=${code}`;
  }, [code]);

  const rewardUSDT = useMemo(() => (stats.totalApproved * 0.5).toFixed(2), [stats]);

  const copy = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      alert("کپی شد ✅");
    } catch {
      prompt("نتونست کپی کنه؛ دستی کپی کن:", txt);
    }
  };

  return (
    <div className="nv-container" style={{ maxWidth: 900 }}>
      <h1 className="text-2xl font-bold mb-3">لینک و کد دعوت</h1>
      <p className="muted mb-6">
        با دعوت دوستانت، برای هر ثبت‌نام تأیید‌شده <b>0.50 USDT</b> پاداش می‌گیری.
      </p>

      {/* کارت لینک دعوت */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label className="muted">لینک دعوت شما</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input className="input" value={inviteLink} readOnly />
            <button className="nv-btn" onClick={() => copy(inviteLink)}>کپی</button>
          </div>
        </div>
      </div>

      {/* کارت کد معرف */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label className="muted">کد معرف شما</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input className="input" value={code || (loading ? "…" : "—")} readOnly />
            <button className="nv-btn" onClick={() => copy(code)}>کپی</button>
          </div>
        </div>
      </div>

      {/* آمار */}
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <Stat title="کل دعوتی‌ها" value={stats.totalAll} />
          <Stat title="تأیید‌شده‌ها" value={stats.totalApproved} />
          <Stat title="پاداش قابل پرداخت (USDT)" value={rewardUSDT} />
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="glass-tile" style={{ padding: 16 }}>
      <div className="muted" style={{ marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}