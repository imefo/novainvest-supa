"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReferralCard() {
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<string>("");
  const [count, setCount] = useState<number>(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLink(""); return; }

        // دریافت/ایجاد کُد
        const { data: codeRow, error: e1 } = await supabase
          .from("referral_codes")
          .select("code")
          .eq("user_id", user.id)
          .maybeSingle();
        if (e1) throw e1;

        let code = codeRow?.code;
        if (!code) {
          const rnd = Math.random().toString(36).slice(2, 8);
          code = `${user.id.slice(0, 6)}-${rnd}`.toUpperCase();
          const { error: eIns } = await supabase.from("referral_codes").insert({ user_id: user.id, code });
          if (eIns) throw eIns;
        }

        // تعداد دعوت‌های تأییدشده
        const { count } = await supabase
          .from("referrals")
          .select("*", { count: "exact", head: true })
          .eq("referrer_id", user.id)
          .eq("accepted", true);

        // ساخت لینک
        const base = typeof window !== "undefined" ? window.location.origin : "https://novainvest-supa3.vercel.app";
        const url = new URL(base);
        url.pathname = "/signup";
        url.searchParams.set("ref", code);

        if (!alive) return;
        setLink(url.toString());
        setCount(count ?? 0);
      } catch (e:any) {
        console.error(e);
        setErr("خطا در بارگذاری لینک دعوت");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="card">
      <div className="card-head">
        <span>🎁 لینک دعوت</span>
        <span className="muted">پاداش هر دعوت موفق: 0.50 USDT</span>
      </div>

      {err && <div className="alert error">{err}</div>}

      {loading ? (
        <div className="muted">در حال بارگذاری…</div>
      ) : (
        <>
          <div className="invite-row">
            <input className="invite-input" value={link} readOnly />
            <button className="nv-btn nv-btn-primary" onClick={() => navigator.clipboard.writeText(link)}>کپی</button>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            دعوت‌های تأییدشده: {count}
          </div>
        </>
      )}
    </div>
  );
}