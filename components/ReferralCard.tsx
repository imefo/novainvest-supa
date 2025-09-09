"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CodeRow = { id: string; user_id: string; code: string; created_at: string };
const site = typeof window !== "undefined" ? window.location.origin : "https://novainvest-supa3.vercel.app";

export default function ReferralCard() {
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<string>("");
  const [count, setCount] = useState<number>(0);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // 1) کاربر
        const { data: userData, error: eUser } = await supabase.auth.getUser();
        if (eUser) throw eUser;
        const user = userData.user;
        if (!user) {
          setErr("ابتدا وارد حساب شوید.");
          return;
        }

        // 2) کد دعوت: اگر نبود بساز
        const { data: codeRow, error: e1 } = await supabase
          .from("referral_codes")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle<CodeRow>();
        if (e1) throw e1;

        let code = codeRow?.code;
        if (!code) {
          // تولید کد کوتاه و پایدار
          const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
          code = `${user.id.slice(0, 6)}-${rnd}`;
          const { error: eIns } = await supabase.from("referral_codes").insert({
            user_id: user.id,
            code,
          });
          if (eIns) throw eIns;
        }

        // 3) تعداد دعوت‌های تأییدشده
        const { count: c, error: eCnt } = await supabase
          .from("referrals")
          .select("*", { count: "exact", head: true })
          .eq("referrer_user_id", user.id)
          .eq("status", "approved");
        if (eCnt) throw eCnt;

        if (!alive) return;
        setLink(`${site}/signup?ref=${encodeURIComponent(code)}`);
        setCount(c ?? 0);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "خطا در بارگذاری لینک دعوت");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="card glass">
      <div className="card-head">
        <span>🎁 لینک دعوت</span>
        <small className="muted">پاداش هر دعوت موفق: 0.50 USDT</small>
      </div>

      {loading ? (
        <div className="skeleton h-10" />
      ) : err ? (
        <div className="alert error">{err}</div>
      ) : (
        <>
          <div className="row">
            <input className="input mono" value={link} readOnly />
            <button
              className="btn"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  alert("کپی شد ✅");
                } catch {
                  alert("کپی نشد؛ دستی کپی کنید.");
                }
              }}
            >
              کپی
            </button>
          </div>
          <div className="muted">دعوت‌های تأییدشده: {count}</div>
        </>
      )}
    </div>
  );
}