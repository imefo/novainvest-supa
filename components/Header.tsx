// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type SUser = { id: string; email?: string | null };

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<SUser | null>(null);
  const [open, setOpen] = useState(false);

  // خواندن سشن فعلی + گوش‌دادن به تغییر وضعیت
  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user as SUser | null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user as SUser | null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.replace("/login");
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">NovaInvest</Link>

        {/* دکمه موبایل */}
        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <nav className={`nav ${open ? "open" : ""}`}>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/plans" onClick={() => setOpen(false)}>Plans</Link>

          {/* اگر لاگین نیست → Sign in */}
          {!user && (
            <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
          )}

          {/* اگر لاگین هست → Dashboard + Admin + خروج */}
          {user && (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>
              <button
                onClick={handleSignOut}
                style={{ background: "transparent", border: 0, cursor: "pointer" }}
              >
                Sign out
              </button>
            </>
          )}

          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        </nav>
      </div>
    </header>
  );
}