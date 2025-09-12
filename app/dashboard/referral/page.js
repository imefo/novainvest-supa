"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReferralDashboard() {
  const [user, setUser] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAll: 0, totalApproved: 0 });
  const [recent, setRecent] = useState([]); // چند دعوت آخر

  // سازنده‌ی کد یکتا
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

        // 1) دریافت کاربر
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !alive) return;
        setUser(user);

        // 2) دریافت/ساخت کد
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
            const newCode = makeCode(user.id);
            const { data: ins } = await supabase
              .from("referral_codes")
              .upsert(
                { user_id: user.id, code: newCode },
                { onConflict: "user_id", ignoreDuplicates: false }
              )
              .select()
              .maybeSingle();
            myCode = ins?.code || newCode;
          }
        }
        if (!alive) return;
        setCode(myCode);

        // 3) آمار + لیست مختصر دعوت‌ها
        const [{ count: cAll }, { count: cOk }, { data: rows }] = await Promise.all([
          supabase.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_code", myCode),
          supabase.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_code", myCode).eq("status", "approved"),
          supabase
            .from("referrals")
            .select("id, referred_id, status, created_at")
            .eq("referrer_code", myCode)
            .order("created_at", { ascending: false })
            .limit(6),
        ]);

        if (!alive) return;
        setStats({ totalAll: cAll || 0, totalApproved: cOk || 0 });
        setRecent(rows || []);
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
  const progress = useMemo(() => {
    // تارگت نمادین: 20 دعوت تأیید شده
    const max = 20;
    const val = Math.min(stats.totalApproved, max);
    return { val, max, pct: Math.round((val / max) * 100) };
  }, [stats]);

  const copy = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      alert("کپی شد ✅");
    } catch {
      prompt("نتونست کپی کنه؛ دستی کپی کن:", txt);
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "دعوت به NovaInvest", text: "با این لینک ثبت‌نام کن و جایزه بگیر!", url: inviteLink });
      } else {
        copy(inviteLink);
      }
    } catch {}
  };

  return (
    <div className="ref-wrap nv-container">
      {/* هدر گرادیانی */}
      <div className="ref-hero card">
        <div className="ref-hero__left">
          <div className="chip neon">دعوت دوستان</div>
          <h1>با هر دعوت تأیید‌شده <span className="accent">0.50 USDT</span> پاداش بگیر</h1>
          <p className="muted">لینک و کد اختصاصیِت پایین هست. فقط کپی کن و بفرست ✨</p>

          <div className="ref-code-row">
            <div className="ref-chip" title="کد معرف">
              {loading ? "…" : code || "—"}
            </div>
            <button className="nv-btn" onClick={() => copy(code)}>کپی کد</button>
          </div>

          <div className="ref-link-row">
            <input className="input" value={inviteLink} readOnly />
            <div className="share-row">
              <button className="nv-btn" onClick={() => copy(inviteLink)}>کپی لینک</button>
              <button className="nv-btn nv-btn-primary" onClick={share}>Share ↗</button>
            </div>
          </div>
        </div>

        <div className="ref-hero__right">
          <div className="glass-tile kpi">
            <div className="muted">پاداش قابل پرداخت</div>
            <div className="kpi-num">{rewardUSDT} <span>USDT</span></div>
            <div className="muted tiny">به ازای هر دعوت تأیید‌شده 0.50</div>
            <div className="progress">
              <div className="bar" style={{ width: `${progress.pct}%` }} />
            </div>
            <div className="progress-meta">
              <span>{progress.val}/{progress.max} دعوت تأیید‌شده</span>
              <span>{progress.pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* کارت های آمار سریع */}
      <div className="ref-grid">
        <div className="ref-card">
          <div className="pill">کل دعوتی‌ها</div>
          <div className="big">{stats.totalAll}</div>
          <div className="sub">تمام کاربرانی که با لینک تو ثبت‌نام کرده‌اند</div>
        </div>
        <div className="ref-card">
          <div className="pill accent">تأیید‌شده‌ها</div>
          <div className="big">{stats.totalApproved}</div>
          <div className="sub">دعوت‌هایی که وضعیت‌شان approved شده</div>
        </div>
        <div className="ref-card">
          <div className="pill">پاداش تخمینی</div>
          <div className="big">{rewardUSDT} <span className="unit">USDT</span></div>
          <div className="sub">پس از بررسی و تأیید توسط ادمین قابل واریز است</div>
        </div>
      </div>

      {/* جدول مختصر آخرین دعوت‌ها */}
      <div className="card">
        <div className="list-head">
          <h3>آخرین دعوت‌ها</h3>
        </div>
        <div className="table">
          <div className="tr th">
            <div>کاربر دعوت‌شده</div>
            <div>وضعیت</div>
            <div>تاریخ</div>
          </div>
          {(recent || []).length === 0 ? (
            <div className="empty">هنوز دعوتی ثبت نشده.</div>
          ) : (
            recent.map((r) => (
              <div className="tr" key={r.id}>
                <div className="td code">{shortId(r.referred_id)}</div>
                <div className={`td status s-${r.status}`}>{labelStatus(r.status)}</div>
                <div className="td muted">{fmtDate(r.created_at)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// utils UI
function shortId(id) {
  if (!id) return "—";
  return String(id).slice(0, 6) + "…" + String(id).slice(-4);
}
function labelStatus(s) {
  if (s === "approved") return "تأیید‌شده";
  if (s === "pending") return "در انتظار";
  if (s === "rejected") return "رد شده";
  return s || "—";
}
function fmtDate(x) {
  try { return new Date(x).toLocaleString(); } catch { return "—"; }
}