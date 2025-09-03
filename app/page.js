cat > app/page.js << 'EOF'
// app/page.js
"use client";

import Link from "next/link";

export default function HomePage() {
  const handleSignup = (e) => {
    e.preventDefault();
    alert("ثبت‌نام سریع فعلاً دمو است ✌️");
  };

  return (
    <>
      {/* HERO */}
      <section className="home-hero-v2">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="chip">نسل جدید سرمایه‌گذاری</p>
            <h1>
              NovaInvest — <span className="accent">هوشمند، شفاف، سریع</span>
            </h1>
            <p className="muted">
              پلن‌های روشن، داشبورد سریع و امنیت درجه‌یک — تجربه‌ای جذاب برای موبایل و دسکتاپ.
            </p>

            <div className="hero-cta">
              <Link href="/plans" className="btn btn-primary">مشاهده پلن‌ها</Link>
              <Link href="/login" className="btn">ورود / ثبت‌نام</Link>
            </div>

            <ul className="hero-bullets">
              <li>سودآوری پایدار و قابل‌پیگیری</li>
              <li>شفافیت کامل و گزارش‌گیری لحظه‌ای</li>
              <li>حریم خصوصی و امنیت داده‌ها</li>
            </ul>
          </div>

          <form className="hero-form-v2" onSubmit={handleSignup}>
            <h3>ثبت‌نام سریع</h3>
            <div className="form-row">
              <input type="text" placeholder="نام" required />
              <input type="text" placeholder="نام خانوادگی" required />
            </div>
            <input type="email" placeholder="ایمیل" required />
            <input type="password" placeholder="رمز عبور" required />
            <button type="submit" className="btn btn-primary">شروع کن</button>
            <p className="muted tiny">با ورود یا ثبت‌نام، شرایط استفاده را می‌پذیرید.</p>
          </form>
        </div>

        <div aria-hidden className="hero-glow glow-1" />
        <div aria-hidden className="hero-glow glow-2" />
      </section>

      {/* LOGOS */}
      <section className="logos">
        <div className="container logos-row">
          <span className="logo-pill">SecurePay</span>
          <span className="logo-pill">BlockAlpha</span>
          <span className="logo-pill">QuantEdge</span>
          <span className="logo-pill">AstraBank</span>
          <span className="logo-pill">NovaLabs</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="page-section">
        <div className="container">
          <h2 className="section-title">چرا نوااینوست؟</h2>
          <div className="features-grid">
            <article className="card feature">
              <div className="icon"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2l9 4-9 4-9-4 9-4zm9 7l-9 4-9-4v6l9 4 9-4V9z"/></svg></div>
              <h3>ساختار شفاف</h3><p className="muted">کارمزدها مشخص، گزارش‌ها واضح.</p>
            </article>
            <article className="card feature">
              <div className="icon"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 3a9 9 0 100 18 9 9 0 000-18zm1 9h4v2h-6V7h2v5z"/></svg></div>
              <h3>داشبورد بلادرنگ</h3><p className="muted">نمودارها و آمار لحظه‌ای.</p>
            </article>
            <article className="card feature">
              <div className="icon"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 1l3 5 6 .9-4.5 4.1L17 18l-5-2.7L7 18l1.5-6.9L4 6.9 10 6l2-5z"/></svg></div>
              <h3>امنیت جدی</h3><p className="muted">رمزنگاری و احراز هویت امن.</p>
            </article>
            <article className="card feature">
              <div className="icon"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 13h2v-2H3v2zm4 0h14v-2H7v2z"/></svg></div>
              <h3>پلن‌های منعطف</h3><p className="muted">از امن تا پرریسک.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
EOF