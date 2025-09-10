"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [usdtAddr, setUsdtAddr] = useState("");
  const [tronAddr, setTronAddr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href="/login"; return; }
      if (alive) setEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, usdt_wallet_addr, tron_wallet_addr")
        .eq("user_id", user.id)
        .maybeSingle();

      if (alive) {
        setFullName(data?.full_name || "");
        setUsdtAddr(data?.usdt_wallet_addr || "");
        setTronAddr(data?.tron_wallet_addr || "");
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function save() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("profiles").upsert({
      user_id: user.id,
      full_name: fullName || null,
      usdt_wallet_addr: usdtAddr || null,
      tron_wallet_addr: tronAddr || null,
    }, { onConflict: "user_id" });
    setLoading(false);
    alert("پروفایل ذخیره شد.");
  }

  return (
    <div className="card glass p-4">
      <h2 className="h2 mb-3">پروفایل</h2>
      <div className="grid" style={{gap:12}}>
        <div>
          <div className="label">ایمیل</div>
          <input className="input" value={email} disabled />
        </div>
        <div>
          <div className="label">نام و نام خانوادگی</div>
          <input className="input" value={fullName} onChange={e=>setFullName(e.target.value)} />
        </div>
        <div>
          <div className="label">آدرس ولت تتر (TRC20)</div>
          <input className="input ltr" placeholder="TSu... (TRC20)" value={usdtAddr} onChange={e=>setUsdtAddr(e.target.value)} />
        </div>
        <div>
          <div className="label">آدرس ولت ترون (TRX)</div>
          <input className="input ltr" placeholder="TSu... (TRX)" value={tronAddr} onChange={e=>setTronAddr(e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <button className="nv-btn nv-btn-primary" onClick={save} disabled={loading}>
          {loading ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </div>
    </div>
  );
}