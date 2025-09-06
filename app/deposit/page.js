"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const WALLETS = {
  "USDT-TRC20": "TUXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // آدرس ترون شما
  "USDT-ERC20": "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // آدرس اتریوم شما
  "BTC": "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // اگر لازم شد
};

// حداقل یکی از این‌ها باید باشه: tx_hash یا screenshot یا user_wallet
function hasAtLeastOneProof({ tx_hash, screenshotFile, user_wallet }) {
  return Boolean((tx_hash && tx_hash.trim()) || screenshotFile || (user_wallet && user_wallet.trim()));
}

export default function DepositPage() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [userWallet, setUserWallet] = useState("");
  const [txHash, setTxHash] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const key = `${currency}-${network}`;
  const targetAddress = WALLETS[key] || "";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!user) {
      setMsg("لطفاً ابتدا وارد شوید.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setMsg("مبلغ معتبر وارد کنید.");
      return;
    }
    if (!targetAddress) {
      setMsg("برای این ارز/شبکه، آدرس والت تنظیم نشده است.");
      return;
    }
    if (!hasAtLeastOneProof({ tx_hash: txHash, screenshotFile, user_wallet: userWallet })) {
      setMsg("حداقل یکی از این موارد الزامی است: Tx Hash یا Screenshot یا آدرس والت شما.");
      return;
    }

    setLoading(true);
    try {
      // 1) آپلود اسکرین‌شات (اگر هست)
      let screenshot_url = null;
      if (screenshotFile) {
        const filePath = `${user.id}/${Date.now()}-${screenshotFile.name}`;
        const { data: up, error: upErr } = await supabase.storage
          .from("deposit-screens")
          .upload(filePath, screenshotFile, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from("deposit-screens").getPublicUrl(filePath);
        screenshot_url = pub?.publicUrl || null;
      }

      // 2) ساخت رکورد Pending
      const { error: insErr } = await supabase.from("manual_deposits").insert({
        user_id: user.id,
        amount: Number(amount),
        currency,
        network,
        user_wallet: userWallet || null,
        tx_hash: txHash || null,
        screenshot_url,
        note: `Manual deposit request on ${currency}-${network} to ${targetAddress}`
      });
      if (insErr) throw insErr;

      setMsg("درخواست شما ثبت شد. پس از بررسی ادمین تایید می‌شود.");
      setAmount("");
      setUserWallet("");
      setTxHash("");
      setScreenshotFile(null);
    } catch (e) {
      console.error(e);
      setMsg(e.message || "خطا در ثبت درخواست");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nv-container" style={{ maxWidth: 720 }}>
      <h2 style={{ marginBottom: 12 }}>واریز دستی کریپتو</h2>

      <div className="card" style={{ padding: 16, borderRadius: 16 }}>
        <form onSubmit={onSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>ارز</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input" style={{ width: "100%", height: 44, borderRadius: 10 }}>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
              </select>
            </div>
            <div>
              <label>شبکه</label>
              <select value={network} onChange={(e) => setNetwork(e.target.value)} className="input" style={{ width: "100%", height: 44, borderRadius: 10 }}>
                <option value="TRC20">TRC20</option>
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>آدرس والت مقصد (برای پرداخت)</label>
            <div className="card" style={{ padding: 12, borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <code style={{ direction: "ltr" }}>{targetAddress || "— لطفاً WALLETS را تنظیم کنید —"}</code>
              <button type="button" className="nv-btn" onClick={() => navigator.clipboard.writeText(targetAddress)} disabled={!targetAddress}>
                کپی
              </button>
            </div>
            <small className="muted">اول مبلغ را وارد کنید و از والت خود به این آدرس ارسال کنید؛ سپس یکی از مدارک زیر را بارگذاری کنید.</small>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>مبلغ (دلاری)</label>
            <input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="مثلاً 100" style={{ width: "100%", height: 44, borderRadius: 10 }} />
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Tx Hash (اختیاری)</label>
              <input className="input" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="هش تراکنش" style={{ width: "100%", height: 44, borderRadius: 10 }} />
            </div>
            <div>
              <label>آدرس والت شما (اختیاری)</label>
              <input className="input" value={userWallet} onChange={(e) => setUserWallet(e.target.value)} placeholder="مثلاً Txxxxxxxx..." style={{ width: "100%", height: 44, borderRadius: 10 }} />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>اسکرین‌شات واریزی (اختیاری)</label>
            <input type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)} />
            <small className="muted">حداقل یکی از این سه مورد الزامی است: Tx Hash یا Screenshot یا آدرس والت شما.</small>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="nv-btn nv-btn-primary" disabled={loading || !user}>
              {loading ? "در حال ارسال..." : "ثبت درخواست بررسی"}
            </button>
            {!user && <span style={{ color: "#fca5a5" }}>برای ثبت، ابتدا وارد شوید.</span>}
          </div>
        </form>

        {msg && <p style={{ marginTop: 12, color: "#eab308" }}>{msg}</p>}
      </div>
    </div>
  );
}