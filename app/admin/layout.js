"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

export default function AdminLayout({ children }) {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }
        const admin = await isAdminFast(user.id);
        if (alive) setOk(!!admin);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">در حال بارگذاری پنل ادمین…</div>
      </div>
    );
  }

  if (!ok) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="text-red-400">دسترسی غیرمجاز</div>
        <Link href="/dashboard" className="btn btn-outline">بازگشت به داشبورد</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* هدر کوچک بالای صفحه */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">پنل ادمین</h1>
        <div className="flex gap-2">
          <Link href="/dashboard" className="btn btn-outline">بازگشت</Link>
          <Link href="/" className="btn btn-outline">صفحه اصلی</Link>
        </div>
      </div>

      {/* محتوای صفحات داخلی */}
      {children}
    </div>
  );
}