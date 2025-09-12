import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const features = [
    { t: "پرداخت USDT (TRC20)", d: "شارژ آسان و سریع کیف‌پول.", i: "💎" },
    { t: "پلن‌های منعطف", d: "امن، متعادل، ریسکی—انتخاب با شما.", i: "📦" },
    { t: "سود شفاف", d: "نمایش لحظه‌ای بازده و گزارش کامل.", i: "📈" },
    { t: "دعوت و پاداش", d: "هر دعوت موفق 0.50 USDT پاداش.", i: "🎁" },
    { t: "پشتیبانی تیکتی", d: "سریع، منظم، قابل پیگیری.", i: "🎧" },
    { t: "امنیت بالا", d: "بهترین پرکتیس‌ها و کنترل دسترسی.", i: "🔒" },
  ];

  const testimonials = [
    { name: "آرش .م", role: "کاربر پلن متعادل", quote: "رابط کاربری خیلی روونه، شارژ با تتر سریع انجام شد و سودها واضحه." },
    { name: "مریم .ک", role: "کاربر پلن امن", quote: "حس شفافیت و نظم می‌ده. پشتیبانی تیکتی هم واقعا جواب می‌ده." },
    { name: "سینا .ر", role: "کاربر ریسکی", quote: "پلن‌ها انعطاف دارن، گزارش سود خواناست. برای من عالی بود." },
  ];

  const faqs = [
    { q: "چطور واریز انجام بدم؟", a: "از داشبورد > کیف‌پول، شبکه TRON (TRC20) و آدرس تتر نمایش داده می‌شود؛ مبلغ را واریز کنید و اطلاعات تراکنش را ثبت کنید." },
    { q: "پلن‌ها چطور کار می‌کنند؟", a: "از صفحه پلن‌ها، پلن دلخواه را انتخاب کنید. پس از فعال‌سازی، گزارش سود در داشبورد نمایش داده می‌شود." },
    { q: "دعوت دوستان چه مزیتی دارد؟", a: "هر دعوت موفق 0.50 USDT پاداش به کیف‌پول شما اضافه می‌کند. لینک دعوت در داشبورد بخش Referral است." },
  ];

  return (
    <>
      {/* HERO */}
      <section className="homev4-hero">
        <div className="homev4-bg a1" />
        <div className="homev4-bg a2" />
        <div className="homev4-inner">
          <span className="badge">NovaInvest • هوشمند، شفاف، سریع</span>
          <h1>
            سرمایه‌گذاری لوکس با <span className="grad">USDT</span>
            <br /> شیشه‌ای، تند، بی‌دردسر
          </h1>
          <p className="sub">
            پلن‌های متنوع، واریز تتر روی TRON، دعوت دوستان و پاداش—همه در یک داشبوردِ
            مدرن و روان.
          </p>
          <div className="cta">
            <Link href="/signup" className="nv-btn nv-btn-primary">شروع سریع</Link>
            <Link href="/plans" className="nv-btn">مشاهده پلن‌ها</Link>
          </div>
          <div className="kpis">
            <div className="kpi"><b>⚡</b><div><strong>واریز لحظه‌ای</strong><small>USDT / TRC20</small></div></div>
            <div className="kpi"><b>🎯</b><div><strong>پلن‌های متنوع</strong><small>امن / متعادل / ریسکی</small></div></div>
            <div className="kpi"><b>🔒</b><div><strong>امن و شفاف</strong><small>گزارش دقیق سود</small></div></div>
          </div>
        </div>
      </section>

      {/* TRUST / LOGOS */}
      <section className="homev4-logos">
        <div className="homev4-inner logos-row">
          <span className="logo-pill">TRON • TRC20</span>
          <span className="logo-pill">USDT</span>
          <span className="logo-pill">Glass UI</span>
          <span className="logo-pill">Secure Access</span>
          <span className="logo-pill">Modern Next.js</span>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="homev4-strip">
        <div className="homev4-inner strip-row">
          <div><strong>+99.9%</strong><small>در دسترس‌بودن</small></div>
          <div><strong>0.50 USDT</strong><small>پاداش هر دعوت</small></div>
          <div><strong>3 نوع پلن</strong><small>امن / متعادل / ریسکی</small></div>
          <div><strong>تیکت سریع</strong><small>پشتیبانی پاسخ‌گو</small></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="homev4-section">
        <div className="homev4-inner">
          <h2 className="title">چرا NovaInvest؟</h2>
          <div className="grid">
            {features.map((f, i) => (
              <div className="card" key={i}>
                <div className="card-ic">{f.i}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS TEASER */}
      <section className="homev4-section alt">
        <div className="homev4-inner">
          <div className="plans-head">
            <div>
              <h2 className="title">پلن‌های فعال</h2>
              <p className="muted">پلن‌های فعال ادمین برای عموم نمایش داده می‌شود. هر زمان قابل تغییر است.</p>
            </div>
            <div className="actions">
              <Link href="/plans" className="nv-btn nv-btn-primary">دیدن پلن‌ها</Link>
              <Link href="/login" className="nv-btn">ورود / ثبت‌نام</Link>
            </div>
          </div>
          <div className="plans-note">بعد از ثبت‌نام از داشبورد می‌توانید کیف‌پول تتر را شارژ و سرمایه‌گذاری را شروع کنید.</div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="homev4-section">
        <div className="homev4-inner">
          <h2 className="title">کاربران چی میگن؟</h2>
          <div className="grid t3">
            {testimonials.map((t, i) => (
              <div className="tcard" key={i}>
                <div className="avatar">{t.name.slice(0,1)}</div>
                <div className="tmeta">
                  <strong>{t.name}</strong>
                  <small className="muted">{t.role}</small>
                </div>
                <p className="tquote">“{t.quote}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REFERRAL CTA */}
      <section className="homev4-final">
        <div className="homev4-inner final-box">
          <h2>با دعوت دوستان پاداش بگیر</h2>
          <p className="muted">برای هر دعوت موفق، 0.50 USDT به کیف‌پول شما اضافه می‌شود. لینک دعوت در داشبورد.</p>
          <div className="cta">
            <Link href="/signup" className="nv-btn nv-btn-primary">همین حالا شروع کن</Link>
            <Link href="/dashboard" className="nv-btn">رفتن به داشبورد</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="homev4-section alt">
        <div className="homev4-inner">
          <h2 className="title">سوالات پرتکرار</h2>
          <div className="faq">
            {faqs.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}