// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  if (!ready) return null;

  return (
    <section className="container" style={{ padding: "40px 0" }}>
      <h1>Dashboard</h1>
      <p>به داشبورد خوش آمدید.</p>
    </section>
  );
}