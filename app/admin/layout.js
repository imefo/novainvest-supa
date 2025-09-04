"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/role";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      if (!(await isAdmin(user))) { router.replace("/dashboard"); return; }
      setOk(true);
    })();
  }, [router]);

  if (!ok) {
    return (
      <section className="section" style={{ minHeight:"calc(100dvh - 64px - 80px)", display:"grid", placeItems:"center" }}>
        <div className="card">بررسی دسترسی ادمین…</div>
      </section>
    );
  }

  return <>{children}</>;
}