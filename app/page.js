"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isAdminFast } from "@/lib/role";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } = {} } = await supabase.auth.getUser().catch(() => ({}));
      if (!alive) return;
      setUser(user || null);
      if (user?.id) {
        const ok = await isAdminFast(user.id).catch(() => false);
        if (alive) setAdmin(!!ok);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="home-hero-v3 nv-rtl">
      {/* نورهای پس‌زمینه */}
      <div className="blob b1" />
      <div className="blob b2" />

      <div className="nv-container">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="chip">سرمایه‌گذاری هوشمند</span>
            <h1>
              NovaInvest — <span className="accent">سریع</span>، <span className="accent">شفاف</span>، مطمئن
            </h1>
            <p className="muted">
              پلن‌های امن، متعادل و ریسکی؛ هر کدام با سود و مدت‌زمان مشخص.
              همه‌چیز تحت کنترل شما و با مدیریت کامل ادمین.
            </p>

            <div className="hero-cta">
              {user ? (
                <>
                  <Link className="btn btn-primary" href={admin ? "/admin" : "/dashboard"}>
                    {admin ? "ورود به پنل ادمین" : "رفتن به داشبورد"}
                  </Link>
                  <Link className="btn" href="/plans">مشاهده پلن‌ها</Link>
                </>
              ) : (
                <>
                  <Link className="btn btn-primary" href="/signup">ثبت‌نام رایگان</Link>
                  <Link className="btn" href="/login">ورود</Link>
                  <Link className="btn" href="/plans">مشاهده پلن‌ها</Link>
                </>
              )}
            </div>

            <ul className="hero-bullets">
              <li>برداشت و واریز شفاف</li>
              <li>پلن‌های فعال فقط برای عموم نمایش داده می‌شود</li>
              <li>پنل ادمین کامل: کاربران، تراکنش‌ها، پلن‌ها، KYC</li>
            </ul>
          </div>

          <div className="hero-card glass-card">
            <h3>شروع سریع</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                location.href = "/signup";
              }}
            >
              <div className="form-row">
                <input type="text" placeholder="نام و نام خانوادگی" required />
                <input type="email" placeholder="ایمیل" required />
              </div>
              <input type="password" placeholder="رمز عبور" required style={{ marginTop: 12 }} />
              <button className="btn btn-primary" style={{ width: "100%", marginTop: 12 }}>
                ایجاد حساب
              </button>
              <div className="tiny muted" style={{ marginTop: 8 }}>
                با ایجاد حساب با قوانین موافقم.
              </div>
            </form>
          </div>
        </div>

        {/* لوگوهای اعتماد یا مزایا */}
        <div className="logos-row">
          <span className="logo-pill">امن</span>
          <span className="logo-pill">سریع</span>
          <span className="logo-pill">مقیاس‌پذیر</span>
          <span className="logo-pill">شفاف</span>
        </div>

        {/* سکشن پلن‌ها (تیزر) */}
        <section className="page-section">
          <h2 className="section-title">چرا NovaInvest؟</h2>
          <div className="features-grid">
            <div className="card feature">
              <div className="icon">🛡️</div>
              <strong>کنترل کامل</strong>
              <p className="muted">ادمین دسترسی کامل به مدیریت کاربران، تراکنش‌ها و KYC دارد.</p>
            </div>
            <div className="card feature">
              <div className="icon">📊</div>
              <strong>پلن‌های متنوع</strong>
              <p className="muted">امن، متعادل یا ریسکی — برای هر سلیقه و ریسک‌پذیری.</p>
            </div>
            <div className="card feature">
              <div className="icon">⚡</div>
              <strong>سرعت بالا</strong>
              <p className="muted">تجربه‌ی روان و سریع در وب و موبایل.</p>
            </div>
            <div className="card feature">
              <div className="icon">🔍</div>
              <strong>شفافیت</strong>
              <p className="muted">تمام سوابق تراکنش‌ها و وضعیت پلن‌ها مشخص است.</p>
            </div>
          </div>
        </section>

        {/* CTA پایانی */}
        <section className="cta-final">
          <div className="cta-inner">
            <h2>از همین امروز شروع کن</h2>
            <p className="muted">ثبت‌نام کمتر از یک دقیقه زمان می‌برد.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/signup">ثبت‌نام</Link>
              <Link className="btn" href="/plans">مشاهده پلن‌ها</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}