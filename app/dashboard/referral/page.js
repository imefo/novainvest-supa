"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReferralPage() {
  const [user, setUser] = useState(null);
  const [refCode, setRefCode] = useState("");
  const [refCount, setRefCount] = useState(0);
  const [reward, setReward] = useState(0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://novainvest-supa3.vercel.app";
  const inviteLink = refCode ? `${siteUrl}/signup?ref=${refCode}` : "";

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .maybeSingle();
      setRefCode(profile?.referral_code || "");

      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id);
      setRefCount(count || 0);

      const { data: bal } = await supabase
        .from("user_balances")
        .select("amount")
        .eq("user_id", user.id)
        .eq("currency", "USDT")
        .maybeSingle();
      setReward(Number(bal?.amount || 0));
    })();
  }, []);

  const copy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    alert("لینک کپی شد ✅");
  };

  return (
    <div className="nv-container" style={{ maxWidth: 780 }}>
      <h2>🎁 لینک دعوت</h2>
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div>
          <div className="muted">کد معرف شما</div>
          <div className="mono" style={{ fontSize: 18 }}>{refCode || "-"}</div>
        </div>

        <div>
          <div className="muted">لینک دعوت</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input value={inviteLink} readOnly className="mono" />
            <button className="btn" onClick={copy}>کپی</button>
          </div>
        </div>

        <div className="grid-3">
          <div className="stat">
            <strong>{refCount}</strong>
            <span className="muted">تعداد دعوتی</span>
          </div>
          <div className="stat">
            <strong>{reward.toFixed(2)} USDT</strong>
            <span className="muted">پاداش فعلی</span>
          </div>
          <div className="stat">
            <strong>0.50 USDT</strong>
            <span className="muted">پاداش هر دعوت</span>
          </div>
        </div>

        <p className="muted tiny">
          با اشتراک‌گذاری لینک، اگر کاربر با این لینک ثبت‌نام کند، ۰.۵ تتر به موجودی دعوت‌کننده افزوده می‌شود.
        </p>
      </div>
    </div>
  );
}