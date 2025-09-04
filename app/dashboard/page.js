"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/role";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    balance: 0,
    deposits: 0,
    withdrawals: 0,
    kyc: "نامشخص",
  });
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  // محافظت + لود داده‌ها
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      // اگر ادمین است، اینجا می‌تونی بفرستیش پنل ادمین
      if (await isAdmin(user)) {
        // اگر می‌خوای ادمین‌ها هم همین داشبورد کاربری رو ببینن، این خط رو کامنت کن
        router.replace("/admin"); 
        return;
      }

      setUser(user);

      // تلاش برای خواندن پروفایل (اختیاری: اگر جدول داری)
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, kyc_status, balance_total, deposits_total, withdrawals_total")
          .eq("id", user.id)
          .maybeSingle();

        if (prof) {
          setProfile(prof);
          setStats({
            balance: prof.balance_total ?? 0,
            deposits: prof.deposits_total ?? 0,
            withdrawals: prof.withdrawals_total ?? 0,
            kyc: prof.kyc_status ?? "نامشخص",
          });
        }
      } catch { /* جدول نداشتی → مشکلی نیست */ }

      // آخرین تراکنش‌ها (اگر جدول داری)
      try {
        const { data: list } = await supabase
          .from("transactions")
          .select("id, type, amount, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        setTxs(list || []);
      } catch { setTxs([]); }

      setLoading(false);
    })();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <section className="section" style={{ minHeight:"calc(100dvh - 64px - 80px)", display:"grid", placeItems:"center" }}>
        <div className="card">در حال بارگذاری داشبورد…</div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container" style={{ display: "grid", gap: 16 }}>
        {/* سلام و خوش‌آمد */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>
                سلام {profile?.full_name ? `، ${profile.full_name}` : ""} 👋
              </h2>
              <p className="muted" style={{ marginTop: 4 }}>
                {user?.email}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/plans" className="btn btn-gold">خرید پلن</Link>
              <button className="btn" onClick={signOut}>خروج</button>
            </div>
          </div>
        </div>

        {/* آمار کلیدی */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <StatCard title="بالانس" value={money(stats.balance)} hint="ریال" />
          <StatCard title="واریزی کل" value={money(stats.deposits)} hint="ریال" />
          <StatCard title="برداشتی کل" value={money(stats.withdrawals)} hint="ریال" />
          <StatCard title="وضعیت KYC" value={stats.kyc} hint="احراز هویت" />
        </div>

        {/* اکشن‌های سریع */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>اقدام‌های سریع</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/dashboard/deposit" className="btn btn-primary">واریز</Link>
            <Link href="/dashboard/withdraw" className="btn">برداشت</Link>
            <Link href="/plans" className="btn">انتخاب پلن</Link>
            <Link href="/contact" className="btn">پشتیبانی</Link>
          </div>
        </div>

        {/* آخرین تراکنش‌ها */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>آخرین تراکنش‌ها</h3>
            <Link href="/dashboard/transactions" className="btn btn-ghost">مشاهده همه</Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>نوع</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 18 }} className="muted">
                      تراکنشی ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  txs.map((t) => (
                    <tr key={t.id}>
                      <td>{fmtDate(t.created_at)}</td>
                      <td>{mapType(t.type)}</td>
                      <td>{money(t.amount)}</td>
                      <td>{mapStatus(t.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ---------- اجزای کمکی ---------- */

function StatCard({ title, value, hint }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="muted" style={{ fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {hint && <div className="tiny" style={{ marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function money(n) {
  if (typeof n !== "number") return "-";
  try {
    return n.toLocaleString("fa-IR");
  } catch {
    return String(n);
  }
}

function fmtDate(str) {
  try {
    const d = new Date(str);
    return d.toLocaleString("fa-IR");
  } catch {
    return str ?? "-";
  }
}

function mapType(t) {
  switch (t) {
    case "deposit": return "واریز";
    case "withdraw": return "برداشت";
    case "profit": return "سود";
    default: return t ?? "-";
  }
}

function mapStatus(s) {
  switch (s) {
    case "pending": return "در انتظار";
    case "approved": return "تأیید شد";
    case "rejected": return "رد شد";
    case "done": return "انجام شد";
    default: return s ?? "-";
  }
}