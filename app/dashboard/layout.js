"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function SidebarLink({ href, children }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`block w-full text-center nv-btn ${active ? "nv-btn-primary" : ""}`}
    >
      {children}
    </Link>
  );
}

export default function DashboardLayout({ children }) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email);
    });
  }, []);

  return (
    <div className="nv-container">
      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        {/* Sidebar */}
        <aside className="glass rounded-xl p-4 h-fit">
          <div className="text-slate-200 font-extrabold text-lg mb-1">NovalInvest</div>
          <div className="text-slate-400 text-sm mb-4">{email}</div>

          <ul className="space-y-2">
            <li><SidebarLink href="/dashboard">داشبورد</SidebarLink></li>
            <li><SidebarLink href="/dashboard/transactions">تراکنش‌ها</SidebarLink></li>
            <li><SidebarLink href="/plans">پلن‌ها</SidebarLink></li>
            <li><SidebarLink href="/dashboard/wallet">واریز/برداشت</SidebarLink></li>
            <li><SidebarLink href="/dashboard/support">پشتیبانی</SidebarLink></li>
            <li><SidebarLink href="/dashboard/profile">پروفایل</SidebarLink></li>
            <li><SidebarLink href="/logout">خروج</SidebarLink></li>
          </ul>
        </aside>

        {/* Content */}
        <main className="min-h-[60vh]">
          {children}
        </main>
      </div>
    </div>
  );
}