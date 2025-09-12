"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupForm() {
  const sp = useSearchParams();
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // نمونه فرم ساده؛ فیلدها را با فرم واقعی‌تان جایگزین کنید
  const [fullName, setFullName] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const r = sp.get("ref");
    if (r) setRef(r);
  }, [sp]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      // 1) ثبت‌نام Supabase Auth
      const { data: sign, error: e1 } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (e1) throw e1;

      const user = sign.user;
      if (!user) throw new Error("ثبت‌نام انجام نشد");

      // 2) اگر ref در URL بود، ثبتِ ارجاع
      if (ref) {
        // ذخیره رفرنس در کوکی/لوکال یا جدول referrals (با سیاست‌هایی که قبلاً ساختید)
        await supabase.from("referrals").insert({
          referrer_code: ref,      // یا اگر کد مستقیمه
          referred_id: user.id,    // کاربر جدید
          amount: 0.5,             // پاداش بالقوه (اختیاری)
          status: "pending",       // تا زمان واریز/تأیید
        }).select().single().catch(() => {});
      }

      alert("ثبت‌نام انجام شد. لطفاً ایمیل‌تان را بررسی کنید.");
    } catch (e) {
      setErr(e.message || "خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {err ? <div className="text-red-400">{err}</div> : null}

      <div className="grid gap-3">
        <input
          className="input"
          placeholder="نام و نام‌خانوادگی"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="ایمیل"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="رمز عبور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* نمایش کد معرف (اختیاری) */}
        {ref ? (
          <div className="text-sm opacity-80">
            کد معرف شناسایی شد: <b>{ref}</b>
          </div>
        ) : null}
      </div>

      <button className="btn-primary" disabled={loading}>
        {loading ? "در حال ثبت…" : "ایجاد حساب"}
      </button>
    </form>
  );
}