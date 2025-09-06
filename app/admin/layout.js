// app/admin/layout.js
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

export default function AdminLayout({ children }) {
  const r = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id || null;
      if (!uid) {
        r.replace("/login?next=" + encodeURIComponent(pathname));
        return;
      }
      const admin = await isAdminFast(uid);
      if (!admin) {
        r.replace("/dashboard");
        return;
      }
      if (alive) setOk(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      const u = sess?.user;
      if (!u) r.replace("/login");
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, [r, pathname]);

  // نکته: هیچ متن طولانی لودینگ نشون نمی‌دیم
  if (!ok) return null;

  return (
    <section className="nv-admin-wrap">
      {children}
    </section>
  );
}