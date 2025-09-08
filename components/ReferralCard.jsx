// components/ReferralCard.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { makeQrApiUrl } from "@/lib/referral";

export default function ReferralCard({ userId, userEmail }) {
  const [loading, setLoading] = useState(true);
  const [refCode, setRefCode] = useState("");
  const [inviteCount, setInviteCount] = useState(0);
  const [bonus, setBonus] = useState(0);

  const base = typeof window !== "undefined"
    ? `${window.location.origin}`
    : "https://novainvest-supa3.vercel.app";

  const inviteLink = useMemo(() => {
    return refCode ? `${base}/plans?ref=${refCode}` : "";
  }, [base, refCode]);

  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      // 1) پروفایل را بگیر
      const { data: p, error } = await supabase
        .from("profiles")
        .select("ref_code, referral_bonus_usdt")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      let code = p?.ref_code || "";
      // اگر ref_code نداشت، بساز و ذخیره کن
      if (!code) {
        code = (userEmail?.split("@")[0] || "nova") + "-" + Math.random().toString(36).slice(2,8);
        await supabase.from("profiles").update({ ref_code: code }).eq("user_id", userId);
      }

      // 2) شمارش دعوت‌شده‌ها (کسانی که referred_by = code)
      const { count: cnt } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("referred_by", code);

      if (!live) return;
      setRefCode(code);
      setInviteCount(cnt || 0);
      setBonus(p?.referral_bonus_usdt || 0);
      setLoading(false);
    }
    if (userId) load();
    return () => { live = false; };
  }, [userId, userEmail]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert("لینک دعوت کپی شد ✅");
    } catch {
      prompt("کپی دستی:", inviteLink);
    }
  }

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-white">🎁 لینک دعوت</h3>
        <span className="text-sm text-slate-300">پاداش: <b className="text-white">{bonus.toFixed(2)} USDT</b></span>
      </div>

      {loading ? (
        <div className="text-slate-300">در حال بارگذاری…</div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">
              <div className="text-slate-300 text-sm mb-2">لینک اختصاصی شما</div>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                  value={inviteLink}
                  readOnly
                />
                <button onClick={copyLink} className="nv-btn nv-btn-primary">کپی</button>
              </div>
              <div className="text-slate-400 text-sm mt-2">
                افراد جدید با این لینک ثبت‌نام کنند → به کیف پول شما <b>۰.۵ USDT</b> اضافه می‌شود.
              </div>
              <div className="mt-4 text-slate-200">
                دعوت‌های موفق: <b>{inviteCount}</b>
              </div>
            </div>
            <img
              src={makeQrApiUrl(inviteLink, 180)}
              alt="QR"
              className="rounded-xl border border-white/10"
              width={180}
              height={180}
            />
          </div>
        </>
      )}
    </div>
  );
}