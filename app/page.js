"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          {/* متن معرفی (راست) */}
          <div className="reveal">
            <h1>
              سرمایه‌گذاری هوشمند با <span className="accent">NovaInvest</span>
            </h1>
            <p className="muted">
              شفاف، سریع و یکپارچه — پلن‌های امن، متعادل و ریسکی؛ با داشبورد
              پاسخگو و تمرکز بر امنیت و حریم خصوصی.
            </p>

            <ul className="bullets">
              <li>پلن‌های روشن و قابل فهم</li>
              <li>واریز و برداشت سریع</li>
              <li>گزارش‌دهی شفاف و لحظه‌ای</li>
            </ul>

            <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
              <Link href="/plans" className="btn btn-primary">شروع کنید</Link>
              <Link href="/about" className="btn">درباره ما</Link>
            </div>
          </div>

          {/* فرم شیشه‌ای (چپ) */}
          <div className="glass reveal">
            <h3 style={{ margin: 0, marginBottom: 8 }}>ثبت‌نام سریع</h3>
            <p className="muted" style={{ marginTop: 0 }}>در کمتر از یک دقیقه حساب بسازید</p>

            <form onSubmit={e => e.preventDefault()}>
              <input type="text" placeholder="نام و نام خانوادگی" />
              <input type="email" placeholder="ایمیل" />
              <input type="password" placeholder="رمز عبور" />
              <button className="btn btn-primary btn-block" type="submit">ادامه</button>
              <p className="tiny" style={{ marginTop: 10 }}>
                با ورود یا ثبت‌نام، شرایط استفاده را می‌پذیرید.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* فیچرها */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">چرا ما؟</h2>

          <div className="features">
            <div className="card feature reveal">
              <div className="icon">🔒</div>
              <h3>امنیت</h3>
              <p className="muted">حساب و تراکنش‌ها با پروتکل‌های جدید محافظت می‌شوند.</p>
            </div>
            <div className="card feature reveal">
              <div className="icon">📊</div>
              <h3>شفافیت</h3>
              <p className="muted">سودها و برداشت‌ها شفاف و قابل بررسی هستند.</p>
            </div>
            <div className="card feature reveal">
              <div className="icon">⚡</div>
              <h3>سرعت</h3>
              <p className="muted">واریز و برداشت آنی، بدون معطلی.</p>
            </div>
          </div>
        </div>
      </section>

      {/* فوتر ساده */}
      <footer className="site-footer">
        <div className="container inner">
          <div className="muted">© NovaInvest 2025 — همه حقوق محفوظ است.</div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/contact" className="btn btn-ghost">تماس</Link>
            <Link href="/plans" className="btn">پلن‌ها</Link>
          </div>
        </div>
      </footer>
    </>
  );
}