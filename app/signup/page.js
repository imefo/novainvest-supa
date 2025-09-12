"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const params = useSearchParams();
  const refParam = params.get("ref") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [refCode, setRefCode] = useState(refParam);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // اگر از لینک دعوت اومده بود، فیلد رو پر کن
  useEffect(() => {
    if (refParam) setRefCode(refParam);
  }, [refParam]);

  // +0.5 USDT به موجودی referrer اضافه می‌کند (ایمن به‌صورت select+update)
  const awardReferralBonus = async (referrerId) => {
    const { data: bal } = await supabase
      .from("user_balances")
      .select("amount")
      .eq("user_id", referrerId)
      .eq("currency", "USDT")
      .maybeSingle();

    const current = Number(bal?.amount || 0);
    const next = current + 0.5;

    // upsert یا update
    if (bal) {
      await supabase
        .from("user_balances")
        .update({ amount: next })
        .eq("user_id", referrerId)
        .eq("currency", "USDT");
    } else {
      await supabase
        .from("user_balances")
        .upsert({ user_id: referrerId, currency: "USDT", amount: next });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.");

      // ساخت کد یکتا از user.id
      const myCode = user.id.slice(0, 8);

      // ثبت پروفایل خود کاربر
      await supabase.from("profiles").upsert({
        user_id: user.id,
        email,
        referral_code: myCode,
      }, { onConflict: "user_id" });

      // اگر refCode وارد شده بود، دعوت را ثبت و پاداش بده
      if (refCode) {
        const { data: referrer } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("referral_code", refCode)
          .maybeSingle();

        if (referrer?.user_id) {
          // ثبت دعوت (unique روی invitee_id از دوباره‌نویسی جلوگیری می‌کند)
          await supabase.from("referrals").insert({
            referrer_id: referrer.user_id,
            invitee_id: user.id,
          }).catch(() => { /* اگر قبلاً ثبت شده بود */ });

          // پاداش
          await awardReferralBonus(referrer.user_id);
        }
      }

      setMsg("ثبت‌نام موفق! لطفاً ایمیل خود را تایید کنید.");
      router.replace("/login");
    } catch (err) {
      setMsg(err.message || "خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nv-container" style={{ maxWidth: 520 }}>
      <h2 style={{ marginBottom: 12 }}>ثبت‌نام</h2>
      <p className="muted" style={{ marginBottom: 16 }}>
        اگر کد معرف دارید وارد کنید تا دعوت‌کننده شما 0.50 USDT پاداش بگیرد.
      </p>

      {msg && <div className="notice">{msg}</div>}

      <form onSubmit={handleSignup} className="card" style={{ display: "grid", gap: 10 }}>
        <input type="email" placeholder="ایمیل" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input type="password" placeholder="رمز عبور" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <input type="text" placeholder="کد معرف (اختیاری)" value={refCode} onChange={(e)=>setRefCode(e.target.value)} />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "در حال ثبت…" : "ثبت‌نام"}
        </button>
      </form>
    </div>
  );
}