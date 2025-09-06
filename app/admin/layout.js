// app/admin/layout.js
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser, isAdminFast } from "@/lib/role";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const u = await getSessionUser(3500);
      if (!u?.id) {
        router.replace("/login?next=/admin");
        return;
      }

      const timer = setTimeout(() => {
        if (alive) {
          setOk(false);
          router.replace("/dashboard"); // جلوگیری از گیر
        }
      }, 4000);

      try {
        const admin = await isAdminFast(u.id, 3000);
        if (alive) {
          if (!admin) router.replace("/dashboard");
          else setOk(true);
        }
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  if (!ok) return null;
  return <section className="nv-admin-wrap">{children}</section>;
}