"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();

  // فرم
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // ریفرال
  const [refCode, setRefCode] = useState(null);

  // وضعیت
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  // ref را از URL بخوان (بدون useSearchParams تا در بیلد گیر نده)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) setRefCode(ref.trim());
    } catch {}
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      // 1) ثبت نام
      const { data: sign, error: e1 } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || null } },
      });
      if (e1) throw e1;

      // ممکنه ایمیل‌وریفای لازم باشه – ولی ما ادامه می‌دیم و اگر کاربر لاگین شد، ریفرال را ثبت می‌کنیم
      const { data: ures } = await supabase.auth.getUser();
      const newUser = ures?.user || null;

      // 2) اگر refCode داریم و کاربر لاگین شد → ریفرال + جایزه ۰.۵ USDT
      if (newUser && refCode) {
        // 2-1) پیدا کردن صاحب کد معرف
        const { data: ownerRow, error: e2 } = await supabase
          .from("referral_codes")                // ← اگر اسم جدول‌تان فرق دارد، اینجا را عوض کنید
          .select("user_id")
          .eq("code", refCode)
          .maybeSingle();
        if (e2) throw e2;

        if (ownerRow?.user_id && ownerRow.user_id !== newUser.id) {
          const inviterId = ownerRow.user_id;

          // 2-2) ثبت ردیف در referrals
          const { error: e3 } = await supabase.from("referrals").insert({
            referrer_id: inviterId,
            invitee_id: newUser.id,
            referral_code: refCode,
          });
          if (e3) {
            // اگر محدودیت یکتا دارید و قبلاً ثبت شده بود، از خطا رد شویم
            if (String(e3.message || "").toLowerCase().includes("duplicate")) {
              // ignore
            } else {
              console.warn("referrals insert error:", e3);
            }
          }

          // 2-3) افزایش موجودی inviter به میزان 0.5 USDT
          // تلاش برای آپدیت؛ اگر نبود، اینسرت
          const { data: balRow, error: balErr } = await supabase
            .from("user_balances")               // ← اگر اسم جدول متفاوت است، عوض کنید
            .select("amount")
            .eq("user_id", inviterId)
            .eq("currency", "USDT")
            .maybeSingle();

          if (!balErr) {
            if (balRow) {
              // آپدیت
              const { error: updErr } = await supabase
                .from("user_balances")
                .update({ amount: Number(balRow.amount || 0) + 0.5 })
                .eq("user_id", inviterId)
                .eq("currency", "USDT");
              if (updErr) console.warn("balance update error:", updErr);
            } else {
              // اینسرت
              const { error: insErr } = await supabase.from("user_balances").insert({
                user_id: inviterId,
                currency: "USDT",
                amount: 0.5,
              });
              if (insErr) console.warn("balance insert error:", insErr);
            }
          }
        }
      }

      setOk("ثبت‌نام انجام شد. در حال انتقال به داشبورد…");
      router.push("/dashboard");
    } catch (e) {
      setErr(e?.message || "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nv-container" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 460,
          padding: 24,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(16,18,30,.55)",
          backdropFilter: "blur(10px) saturate(140%)",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          direction: "rtl",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Link href="/" className="nv-brand-link" style={{ gap: 8, alignItems: "center", textDecoration: "none" }}>
            <span aria-hidden>🏠</span>
            <strong className="nv-brand-title" style={{ color: "#E5E7EB" }}>NovaInvest</strong>
          </Link>
          <div className="chip">{refCode ? `کد معرف: ${refCode}` : "ثبت‌نام"}</div>
        </div>

        <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.4 }}>ساخت حساب کاربری</h2>
        <p className="muted" style={{ marginTop: 6, marginBottom: 18 }}>
          ایمیل و رمز عبور خود را وارد کنید.
        </p>

        {err ? (
          <div
            style={{
              background: "rgba(244,63,94,.12)",
              border: "1px solid rgba(244,63,94,.35)",
              color: "#fecaca",
              padding: "8px 10px",
              borderRadius: 10,
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {err}
          </div>
        ) : null}

        {ok ? (
          <div
            style={{
              background: "rgba(34,197,94,.12)",
              border: "1px solid rgba(34,197,94,.35)",
              color: "#bbf7d0",
              padding: "8px 10px",
              borderRadius: 10,
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {ok}
          </div>
        ) : null}

        <form onSubmit={handleSignup} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#cbd5e1" }}>نام و نام‌خانوادگی (اختیاری)</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثلاً علی رضایی"
              className="nv-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#cbd5e1" }}>ایمیل</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="nv-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#cbd5e1" }}>رمز عبور</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              className="nv-input"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            className="nv-btn nv-btn-primary"
            disabled={loading}
            style={{ height: 44 }}
          >
            {loading ? "درحال ساخت حساب…" : "ثبت‌نام"}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 14 }}>
          <Link href="/login" className="nv-link">ورود</Link>
          <Link href="/forgot" className="nv-link">فراموشی رمز</Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 44,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.18)",
  background: "rgba(255,255,255,.06)",
  color: "#e5e7eb",
  outline: "none",
  padding: "0 12px",
};