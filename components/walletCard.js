"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function WalletCard() {
  const [loading, setLoading] = useState(true);
  const [addr, setAddr] = useState("");
  const [net, setNet] = useState("TRC20"); // فقط نمایش؛ اگر بعداً خواستی ذخیره‌اش کنی، فیلد جدا بساز
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // آدرس کیف‌پول کاربر از profiles
        const { data, error } = await supabase
          .from("profiles")
          .select("usdt_wallet_addr")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (!alive) return;
        setAddr(data?.usdt_wallet_addr || "");
      } catch (e) {
        console.error(e);
        if (alive) setErr("خطا در بارگذاری کیف‌پول.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("کپی شد ✅");
    } catch {
      alert("کپی نشد. دستی کپی کنید.");
    }
  };

  return (
    <div className="lux-card wallet">
      <div className="lux-card-head">
        <div className="title">کیف‌پول تتر (USDT)</div>
        <div className="nets">
          <button
            className={`net ${net === "TRC20" ? "act" : ""}`}
            onClick={() => setNet("TRC20")}
            type="button"
          >
            TRC20
          </button>
          <button
            className={`net ${net === "ERC20" ? "act" : ""}`}
            onClick={() => setNet("ERC20")}
            type="button"
          >
            ERC20
          </button>
        </div>
      </div>

      {err && <div className="lux-alert" style={{marginTop:8}}>{err}</div>}

      <p className="muted" style={{marginTop:6}}>
        صَرفاً آدرس را کپی و ذخیره کنید. برای واریز، از دکمهٔ «صفحه واریز» استفاده کنید
        و بعد از انتقال، <b>TxHash</b> یا اسکرین‌شات را ثبت نمایید تا توسط ادمین تأیید و
        به کیف‌پول شما افزوده شود.
      </p>

      <div className="addr-row">
        {loading ? (
          <span className="skeleton" style={{width:260}} />
        ) : addr ? (
          <>
            <code className="addr">{addr}</code>
            <button className="lux-btn sm" onClick={() => copy(addr)} type="button">
              کپی
            </button>
          </>
        ) : (
          <div className="noaddr">
            هنوز آدرس کیف‌پول ثبت نشده است.
            <Link className="lux-btn sm" href="/deposit" style={{marginInlineStart:8}}>
              صفحه واریز
            </Link>
          </div>
        )}
      </div>

      <div className="tips">
        <div>نکته: شبکه را مطابق کیف‌پول مبدا انتخاب کنید.</div>
        <div>شبکهٔ فعلی: <b>{net}</b></div>
      </div>

      <div className="actions-bottom">
        <Link className="lux-btn primary" href="/deposit">صفحه واریز</Link>
        <Link className="lux-btn" href="/dashboard/transactions">تراکنش‌ها</Link>
      </div>
    </div>
  );
}