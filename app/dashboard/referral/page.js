"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function randCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // بدون حروف گیج‌کننده
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export default function ReferralPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState({ link: false, code: false });
  const [totalInvites, setTotalInvites] = useState(0);
  const [recent, setRecent] = useState([]);

  const inviteLink = useMemo(() => {
    if (!code) return "";
    // origin در CSR همیشه در دسترسه
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://novainvest-supa3.vercel.app";
    return `${origin}/signup?ref=${encodeURIComponent(code)}`;
  }, [code]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 1) کاربر
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !alive) return;
        setUser(user);

        // 2) کُد دعوت: اگر نبود بساز
        let myCode = "";
        {
          const { data: rc } = await supabase
            .from("referral_codes")
            .select("code")
            .eq("user_id", user.id)
            .maybeSingle();

          if (rc?.code) {
            myCode = rc.code;
          } else {
            // سعی برای ساخت کُد یکتا
            for (let i = 0; i < 6 && !myCode; i++) {
              const attempt = `NOVA-${randCode(6)}`;
              const { error } = await supabase.from("referral_codes").insert({
                code: attempt,
                user_id: user.id,
              });
              if (!error) myCode = attempt;
              // اگر conflict بود دوباره تلاش می‌کنیم
            }
          }
        }
        if (!alive) return;
        setCode(myCode);

        // 3) آمار دعوت‌ها (از view: referral_leaderboard)
        if (myCode) {
          // total از لیدربورد
          const { data: lb } = await supabase
            .from("referral_leaderboard")
            .select("user_id, adjusted_total")
            .eq("user_id", user.id)
            .maybeSingle();
          setTotalInvites(lb?.adjusted_total || 0);

          // لیست آخرین دعوت‌ها (از referrals)
          const { data: list } = await supabase
            .from("referrals")
            .select("user_id, referral_code, created_at")
            .eq("referrer_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);
          setRecent(list || []);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rewardUSDT = useMemo(() => (totalInvites * 0.5).toFixed(2), [totalInvites]);

  async function copy(text, which) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((c) => ({ ...c, [which]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [which]: false })), 1500);
    } catch {}
  }

  return (
    <div className="nv-container">
      <div className="ref-wrap">
        <div className="ref-head">
          <div>
            <h1 className="ref-title">دعوت دوستان</h1>
            <p className="ref-sub">
              با هر ثبت‌نام موفق از طریق کُد یا لینک شما، <strong>۰.۵ USDT</strong> به کیف‌پولتان
              اضافه می‌شود.
            </p>
          </div>
        </div>

        {/* لینک دعوت */}
        <div className="ref-card">
          <div className="ref-card__title">لینک دعوت اختصاصی</div>
          <div className="ref-input-row">
            <input className="ref-input" value={inviteLink} readOnly />
            <button
              className="nv-btn"
              onClick={() => copy(inviteLink, "link")}
              disabled={!inviteLink}
            >
              {copied.link ? "کپی شد ✓" : "کپی لینک"}
            </button>
          </div>
          <div className="ref-hint">این لینک را برای دوستان خود ارسال کنید.</div>
        </div>

        {/* کُد معرفی */}
        <div className="ref-card">
          <div className="ref-card__title">کُد معرفی</div>
          <div className="ref-input-row">
            <input className="ref-input" value={code} readOnly />
            <button className="nv-btn" onClick={() => copy(code, "code")} disabled={!code}>
              {copied.code ? "کپی شد ✓" : "کپی کُد"}
            </button>
          </div>
          <div className="ref-hint">
            دوستانتان هنگام ثبت‌نام می‌توانند این کُد را در فیلد «کُد معرف» وارد کنند.
          </div>
        </div>

        {/* KPI ها */}
        <div className="ref-kpis">
          <div className="ref-kpi">
            <div className="ref-kpi__label">تعداد دعوت‌های موفق</div>
            <div className="ref-kpi__value">{loading ? "…" : totalInvites}</div>
          </div>
          <div className="ref-kpi">
            <div className="ref-kpi__label">پاداش تخمینی</div>
            <div className="ref-kpi__value">{loading ? "…" : `${rewardUSDT} USDT`}</div>
          </div>
        </div>

        {/* لیست آخرین دعوت‌ها */}
        <div className="ref-card">
          <div className="ref-card__title">آخرین دعوت‌ها</div>
          {!loading && recent.length === 0 ? (
            <div className="ref-empty">هنوز دعوتی ثبت نشده است.</div>
          ) : (
            <div className="ref-table">
              <div className="ref-tr ref-th">
                <div>کاربر دعوت‌شده</div>
                <div>کُد استفاده‌شده</div>
                <div>تاریخ</div>
              </div>
              {(recent || []).map((r, i) => (
                <div key={i} className="ref-tr">
                  <div className="muted mono">{r.user_id?.slice(0, 8)}…</div>
                  <div className="mono">{r.referral_code || "—"}</div>
                  <div className="muted">
                    {new Date(r.created_at).toLocaleString("fa-IR")}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="ref-note">
            * هر دعوت پس از تأیید سامانه به‌عنوان «موفق» شمرده می‌شود. جایزه‌ها در کیف‌پول شما
            قابل مشاهده/برداشت است.
          </div>
        </div>
      </div>
    </div>
  );
}