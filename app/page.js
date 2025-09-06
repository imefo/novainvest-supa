"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="nv-hero">
      <div className="nv-hero-bg" />
      <div className="nv-container nv-rtl">
        <header className="nv-hero-head">
          <h1>
            سرمایه‌گذاری هوشمند با <span className="brand">NovaInvest</span>
          </h1>
          <p className="muted">
            سرمایه‌ی تیره و بنفش کاربرانی + طلایی؛ شفاف، سریع و یکپارچه — پلن‌های امن،
            متعادل و ریسکی با داشبورد پاسخگو و تمرکز بر امنیت.
          </p>
          <div className="nv-cta">
            <Link className="btn btn-primary" href="/plans">شروع کنید</Link>
            <Link className="btn" href="/about">درباره ما</Link>
          </div>
        </header>

        <section className="nv-card nv-signup">
          <h3>ثبت‌نام سریع</h3>
          <p className="tiny muted">کمتر از یک دقیقه حساب بسازید</p>
          <form onSubmit={(e)=>e.preventDefault()}>
            <input placeholder="نام و نام خانوادگی" />
            <input placeholder="ایمیل" type="email" />
            <input placeholder="رمز عبور" type="password" />
            <button className="btn btn-primary" type="submit">ادامه</button>
            <p className="tiny muted">با ورود یا ثبت‌نام، شرایط استفاده را می‌پذیرید.</p>
          </form>
        </section>

        <section className="nv-feats">
          <h2>چرا NovaInvest؟</h2>
          <ul>
            <li>🔐 امنیت — حساب و تراکنش‌ها با پروتکل‌های روز محافظت می‌شوند.</li>
            <li>📊 شفافیت — سودها و برداشت‌ها شفاف و قابل بررسی‌اند.</li>
            <li>⚡ سرعت — واریز و برداشت آنی، بدون معطلی.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}