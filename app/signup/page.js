"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  // حتماً useSearchParams داخل یک کامپوننتی باشد که زیر <Suspense> رندر می‌شود
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2">
            <Link href="/" className="nv-brand-link">
              <span className="nv-brand-home">🏠</span>
              <span className="nv-brand-title">NovaInvest</span>
            </Link>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">ساخت حساب</h1>
          <p className="text-sm text-gray-400">با ایمیل ثبت‌نام کنید</p>
        </div>

        <Suspense fallback={<div className="text-gray-400">در حال بارگذاری…</div>}>
          <SignupFormInner />
        </Suspense>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/login" className="nv-link">ورود</Link>
          <Link href="/forgot" className="nv-link">فراموشی رمز</Link>
        </div>
      </div>
    </div>
  );
}

function SignupFormInner() {
  const searchParams = useSearchParams(); // الان داخل مرز Suspense است
  const ref = searchParams.get("ref") || undefined;

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // اگر ref در URL بود می‌تونیم ذخیره‌اش کنیم (اختیاری)
    if (ref) {
      try {
        document.cookie = `ref=${ref};path=/;max-age=${60 * 60 * 24 * 30}`;
      } catch {}
    }
  }, [ref]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: {
          data: { invited_by: ref || null },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : undefined,
        },
      });
      if (error) throw error;
      // موفق: هدایت به لاگین
      window.location.href = "/login?signup=ok";
    } catch (e) {
      setErr(e.message || "خطای نامشخص");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {ref && (
        <div className="text-xs rounded-md border border-purple-400/30 bg-purple-500/10 text-purple-200 p-2">
          کد معرف: <b>{ref}</b>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm text-gray-300">ایمیل</label>
        <input
          type="email"
          required
          className="w-full h-11 rounded-lg bg-white/5 border border-white/15 px-3 text-white outline-none"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-300">رمز عبور</label>
        <input
          type="password"
          required
          minLength={6}
          className="w-full h-11 rounded-lg bg-white/5 border border-white/15 px-3 text-white outline-none"
          placeholder="حداقل ۶ کاراکتر"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      {err && (
        <div className="text-xs rounded-md border border-red-400/30 bg-red-500/10 text-red-200 p-2">
          {err}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium hover:from-purple-500 hover:to-indigo-400 transition disabled:opacity-60"
      >
        {loading ? "در حال ایجاد حساب…" : "ثبت‌نام"}
      </button>
    </form>
  );
}