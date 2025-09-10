"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const CURRENCIES = [
  { key: "USDT", label: "USDT (TRC20)", network: "TRC20" },
  { key: "TRX",  label: "TRON (TRX)",   network: "TRON"  },
];

export default function WalletPage() {
  const [tab, setTab] = useState("deposit"); // deposit | withdraw
  const [currency, setCurrency] = useState("USDT");
  const [destUSDT, setDestUSDT] = useState("");
  const [destTRX,  setDestTRX]  = useState("");

  const [amount, setAmount] = useState("");
  const [userWallet, setUserWallet] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(true);

  // خواندن تنظیمات مقصد و پروفایل
  useEffect(() => {
    let alive = true;
    (async () => {
      const [settings, prof, userR] = await Promise.all([
        supabase.from("deposit_settings").select("currency,destination_wallet"),
        supabase.from("profiles").select("usdt_wallet_addr, tron_wallet_addr").single().throwOnError(false),
        supabase.auth.getUser()
      ]);
      if (!alive) return;

      // مقصدها
      (settings.data || []).forEach(s => {
        if (s.currency === "USDT") setDestUSDT(s.destination_wallet || "");
        if (s.currency === "TRX")  setDestTRX(s.destination_wallet || "");
      });

      // کیف پول کاربر (پیش‌فرض برای فیلد)
      const p = prof.data || {};
      if (currency === "USDT" && p.usdt_wallet_addr) setUserWallet(p.usdt_wallet_addr);
      if (currency === "TRX"  && p.tron_wallet_addr) setUserWallet(p.tron_wallet_addr);

      setLoading(false);
    })();
    return () => { alive = false; };
  }, [currency]);

  function destAddr() {
    return currency === "USDT" ? destUSDT : destTRX;
  }

  async function submitDeposit() {
    if (!amount) return alert("مبلغ را وارد کنید.");
    if (!txHash && !userWallet) return alert("حداقل یکی از فیلدهای «TxHash» یا «آدرس ولت شما» الزامی است.");

    const { data: { user } } = await supabase.auth.getUser();
    const row = {
      user_id: user.id,
      currency,
      network: currency === "USDT" ? "TRC20" : "TRON",
      amount: Number(amount),
      user_wallet_addr: userWallet || null,
      tx_hash: txHash || null,
      dest_wallet_addr: destAddr() || null,
      status: "pending",
    };
    const { error } = await supabase.from("deposits").insert(row);
    if (error) {
      console.error(error);
      alert("خطا در ثبت واریز.");
    } else {
      alert("ثبت شد. پس از تایید ادمین، به موجودی افزوده می‌شود.");
      setAmount(""); setTxHash("");
    }
  }

  return (
    <div className="card glass p-4">
      <div className="flex" style={{gap:12, marginBottom:16}}>
        <button className={`nv-btn ${tab==="deposit"?"nv-btn-primary":""}`} onClick={()=>setTab("deposit")}>واریز</button>
        <button className={`nv-btn ${tab==="withdraw"?"nv-btn-primary":""}`} onClick={()=>setTab("withdraw")}>برداشت</button>
      </div>

      {tab === "deposit" ? (
        <>
          <div className="grid" style={{gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
            {CURRENCIES.map(c=>(
              <button key={c.key}
                className={`nv-btn ${currency===c.key?"nv-btn-primary":""}`}
                onClick={()=>setCurrency(c.key)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <div className="label">آدرس مقصد ({currency}):</div>
            <div className="mono-box">{destAddr() || "— توسط ادمین تنظیم نشده —"}</div>
          </div>

          <div className="grid mt-3" style={{gap:12}}>
            <div>
              <div className="label">مقدار</div>
              <input className="input ltr" value={amount} onChange={e=>setAmount(e.target.value)} placeholder={currency==="USDT"?"مثلاً 50.0":"مثلاً 120.0"} />
            </div>
            <div>
              <div className="label">آدرس ولت شما (اختیاری، یکی از این یا TxHash الزامی)</div>
              <input className="input ltr" value={userWallet} onChange={e=>setUserWallet(e.target.value)} placeholder="TSu..." />
            </div>
            <div>
              <div className="label">Tx Hash (اختیاری، یکی از این یا آدرس ولت الزامی)</div>
              <input className="input ltr" value={txHash} onChange={e=>setTxHash(e.target.value)} placeholder="مثلاً: 0x..." />
            </div>
          </div>

          <div className="mt-4">
            <button className="nv-btn nv-btn-primary" onClick={submitDeposit} disabled={loading}>ثبت واریز</button>
          </div>
        </>
      ) : (
        <div className="muted">برداشت: به‌زودی (پس از فعال‌سازی توسط ادمین).</div>
      )}
    </div>
  );
}