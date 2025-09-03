"use client";
import Link from "next/link";

export default function HomePage() {
  const submit = (e) => { e.preventDefault(); alert("ثبت‌نام دمو ✨"); };

  return (
    <>
      <section className="home-hero">
        <div className="container hero-grid" dir="rtl">
          <div className="hero-copy">
            <div className="chips">
              <span className="chip">نسل جدید سرمایه‌گذاری</span>
              <span className="chip">امن و شفاف</span>
            </div>
            <h1>
              NovaInvest — <span className="accent">هوشمند، شفاف، سریع</span>
            </h1>
            <p className="muted">
              پلن‌های روشن، داشبورد سریع و امنیت جدی — تجربه‌ای جذاب برای موبایل و دسکتاپ.
            </p>

            <div className="hero-cta">
              <Link className="glass-btn glass-btn--primary" href="/plans">مشاهده پلن‌ها</Link>
              <Link className="glass-btn glass-btn--ghost" href="/login">ورود / ثبت‌نام</Link>
            </div>
          </div>

          <form onSubmit={submit} className="glass-card hero-form" dir="rtl">
            <h3 style={{marginTop:0}}>ثبت‌نام سریع</h3>
            <div className="row">
              <input placeholder="نام" required />
              <input placeholder="نام خانوادگی" required />
            </div>
            <input type="email" placeholder="ایمیل" required />
            <input type="password" placeholder="رمز عبور" required />
            <button className="glass-btn glass-btn--primary">شروع کن</button>
            <p className="muted" style={{fontSize:12,marginTop:8}}>با ورود یا ثبت‌نام، شرایط استفاده را می‌پذیرید.</p>
          </form>
        </div>

        {/* رنگ‌های نورانی پس‌زمینه */}
        <div aria-hidden className="hero-glow glow-1" />
        <div aria-hidden className="hero-glow glow-2" />
      </section>

      <section className="section">
        <div className="container" dir="rtl">
          <h2 className="section-title">چرا نوااینوست؟</h2>
          <div className="grid-3">
            <article className="glass-card" style={{padding:16}}>
              <div className="badge">شفاف</div>
              <h3>گزارش‌دهی روشن</h3>
              <p className="muted">کارمزد مشخص، آمار قابل‌پیگیری و درک‌پذیر.</p>
            </article>
            <article className="glass-card" style={{padding:16}}>
              <div className="badge">سریع</div>
              <h3>داشبورد بلادرنگ</h3>
              <p className="muted">نمودارها و وضعیت پلن‌ها با به‌روزرسانی لحظه‌ای.</p>
            </article>
            <article className="glass-card" style={{padding:16}}>
              <div className="badge">امن</div>
              <h3>امنیت جدی</h3>
              <p className="muted">رمزنگاری، احراز هویت امن و حریم خصوصی واقعی.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}