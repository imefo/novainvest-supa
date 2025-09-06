"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;

      // اگر لاگین نیست → به login
      if (!uid) {
        router.replace("/login?next=/admin");
        if (alive) setChecking(false);
        return;
      }

      // چک ادمین با timeout
      const timer = setTimeout(() => {
        if (alive) {
          setAllowed(false);
          setChecking(false);
          router.replace("/dashboard"); // گیر نکنه
        }
      }, 4000);

      try {
        const ok = await isAdminFast(uid);
        if (alive) {
          setAllowed(!!ok);
          setChecking(false);
          if (!ok) router.replace("/dashboard");
        }
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="nv-container" style={{ paddingTop: 40 }}>
        <div className="card">در حال بررسی دسترسی ادمین…</div>
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}