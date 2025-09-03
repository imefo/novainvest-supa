// app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
      } else if (mounted) {
        setUserEmail(data.user.email ?? null);
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) return null;

  return (
    <section className="container" style={{ padding: "40px 0" }}>
      <h1>Dashboard</h1>
      <p>به داشبورد خوش آمدید{userEmail ? `، ${userEmail}` : ""}.</p>
    </section>
  );
}