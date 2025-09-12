"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    referral: "",
    accept: true,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // خواندن کد دعوت از URL یا کوکی/لوکال‌استوریج
  useEffect(() => {
    try {
      const qp = new URLSearchParams(window.location.search);
      const ref = qp.get("ref") || qp.get("code");
      const cookieRef =
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("ref="))
          ?.split("=")[1] || "";
      const lsRef = localStorage.getItem("ref") || "";
      const picked = ref || cookieRef || lsRef;
      if (picked) {
        setForm((f) => ({ ...f, referral: picked }));
        // برای بعداً هم نگه داریم
        localStorage.setItem("ref", picked);
        document.cookie = `ref=${picked};path=/;max-age=${30 * 24 * 3600}`;
      }
    } catch {}
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  async function handleSignup(e) {
    e.preventDefault();
    setMsg("");
    if (!form.accept) {
      setMsg("لطفاً قوانین را بپذیرید.");
      return;
    }
    if (!form.email || !form.password || !form.full_name) {
      setMsg("همه‌ی فیلدهای ضروری را پر کنید.");
      return;
    }
    setLoading(true);
    try {
      // ثبت‌نام کاربر
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { full_name: form.full_name.trim() } },
      });
      if (error) throw error;

      // اگر کد معرف وارد شده بود، ثبت رفرال
      const userId = data.user?.id;
      const code = form.referral?.trim();
      if (userId && code) {
        try {
          // تبدیل کد → referrer_id
          const { data: rc } = await supabase
            .from("referral_codes")
            .select("user_id, code")
            .eq("code", code)
            .maybeSingle();

          if (rc?.user_id) {
            await supabase.from("referrals").insert({
              referrer_id: rc.user_id,
              referred_user_id: userId,
              referral_code: code,
              status: "pending",
            });
          }
        } catch {
          // اگر RLS یا جدول آماده نبود، سایلنت رد می‌شه تا ثبت‌نام کاربر خراب نشه
        }
      }

      setMsg(
        "ثبت‌نام انجام شد. اگر ایمیل تایید لازم باشد، به صندوق ایمیل سر بزنید."
      );
      // اگر ایمیل تایید ندارید، مستقیماً ببرید داخل داشبورد:
      window.location.href = "/dashboard";
    } catch (err) {
      setMsg(err.message || "خطا در ثبت‌نام.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card glass">
        <div className="auth-head">
          <div className="auth-badge">ثبت‌نام</div>
          <h1>ایجاد حساب در NovaInvest</h1>
          <p className="muted">لوکس، سریع و امن — شروع سرمایه‌گذاری با USDT</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-row">
            <label>نام و نام‌خانوادگی</label>
            <input
              name="full_name"
              placeholder="مثلاً: آرمان رضایی"
              value={form.full_name}
              onChange={onChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-row">
            <label>ایمیل</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-row">
            <label>رمز عبور</label>
            <input
              type="password"
              name="password"
              placeholder="حداقل ۸ کاراکتر"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-row">
            <label>
              کد معرف <span className="muted">(اختیاری)</span>
            </label>
            <input
              name="referral"
              placeholder="مثلاً: NOVA-7H9X"
              value={form.referral}
              onChange={onChange}
            />
            <p className="tiny muted">
              اگر کدی دارید وارد کنید؛ برای هر دعوت موفق، ۰.۵ USDT پاداش می‌گیرید.
            </p>
          </div>

          <label className="check">
            <input
              type="checkbox"
              name="accept"
              checked={form.accept}
              onChange={onChange}
            />
            <span>
              قوانین و شرایط NovaInvest را می‌پذیرم.
            </span>
          </label>

          {msg ? <div className="auth-msg">{msg}</div> : null}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "در حال ایجاد حساب…" : "ثبت‌نام"}
          </button>

          <div className="auth-footer">
            <Link href="/login" className="nv-link">
              حساب دارید؟ ورود →
            </Link>
            <Link href="/forgot" className="nv-link">
              فراموشی رمز عبور
            </Link>
          </div>
        </form>
      </div>

      <div className="auth-side glass">
        <div className="auth-side-hero">
          <div className="chip">ویژگی‌ها</div>
          <h3>دعوت دوستان = پاداش USDT</h3>
          <p className="muted">
            لینک دعوت مخصوص به خودتان را بسازید و از هر ثبت‌نام تاییدشده ۰.۵ USDT دریافت کنید.
          </p>
          <ul className="bullets">
            <li>امنیت بالا و شفافیت کامل</li>
            <li>پلن‌های متنوع (ریسکی/متعادل/ایمن)</li>
            <li>برداشت سریع و گزارش‌های دقیق</li>
          </ul>
        </div>
      </div>

      <div className="hero-glow glow-1" />
      <div className="hero-glow glow-2" />
    </div>
  );
}