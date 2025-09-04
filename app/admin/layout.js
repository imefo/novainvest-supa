"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      // چک نقش ادمین از طریق RPC
      const { data, error } = await supabase.rpc("is_admin", { uid: user.id });
      if (error || !data) { router.replace("/dashboard"); return; }

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