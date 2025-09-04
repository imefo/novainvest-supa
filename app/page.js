"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>NovaInvest 🚀</h1>
          <p className="muted">
            سرمایه‌گذاری هوشمند، شفاف و سریع – با پلن‌های امن، متعادل و ریسکی
          </p>
          <div style={{ marginTop: 24 }}>
            <Link href="/plans" className="btn btn-primary">شروع کنید</Link>
            <Link href="/about" className="btn" style={{ marginLeft: 12 }}>
              درباره ما
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container">
        <h2 className="section-title">چرا ما؟</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
          <div className="card">
            <h3>امنیت</h3>
            <p>حساب کاربری و تراکنش‌های شما با جدیدترین پروتکل‌ها محافظت می‌شوند.</p>
          </div>
          <div className="card">
            <h3>شفافیت</h3>
            <p>تمام سودها و برداشت‌ها شفاف و قابل بررسی توسط کاربر هستند.</p>
          </div>
          <div className="card">
            <h3>سرعت</h3>
            <p>واریز و برداشت آنی و سریع، بدون معطلی.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-final">
        <div className="container cta-inner">
          <h2>همین امروز شروع کنید</h2>
          <p className="muted">به خانواده NovaInvest بپیوندید و مسیر مالی خود را تغییر دهید.</p>
          <div style={{ marginTop: 20 }}>
            <Link href="/login" className="btn btn-primary">ورود / ثبت‌نام</Link>
          </div>
        </div>
      </section>
    </div>
  );
}