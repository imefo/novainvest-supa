"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="nv-rtl">
      {/* HERO */}
      <section className="home-hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="badge" style={{background:"rgba(124,58,237,.18)", border:"1px solid #7c3aed55"}}>
                پلتفرم سرمایه‌گذاری هوشمند
              </span>
              <h1 className="home-title">
                NovaInvest — <span style={{color:"#b794f4"}}>شفاف</span>، <span style={{color:"#93c5fd"}}>سریع</span>، <span style={{color:"#c4b5fd"}}>ایمن</span>
              </h1>
              <p className="home-sub">
                پلن‌های متنوع «امن / متعادل / ریسکی» با مدیریت ساده، گزارش شفاف، و تسویه‌ی سریع.
              </p>
              <div className="hero-cta">
                <Link href="/plans" className="btn btn-primary">مشاهده پلن‌ها</Link>
                <Link href="/signup" className="btn">شروع رایگان</Link>
              </div>
            </div>

            {/* فرم کوتاه */}
            <form className="hero-form card" onSubmit={(e)=>e.preventDefault()}>
              <h3>ثبت‌نام سریع</h3>
              <div className="form-row">
                <input className="input" placeholder="ایمیل"/>
                <input className="input" placeholder="نام و نام خانوادگی"/>
              </div>
              <div className="form-row">
                <input className="input" placeholder="رمز عبور" type="password"/>
                <input className="input" placeholder="تکرار رمز" type="password"/>
              </div>
              <button className="btn btn-primary" style={{width:"100%",marginTop:10}}>ثبت‌نام</button>
              <div className="muted" style={{fontSize:12,marginTop:6}}>با ثبت‌نام، قوانین و حریم خصوصی را می‌پذیرید.</div>
            </form>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">چرا NovaInvest؟</h2>
          <div className="features">
            <div className="card feature">
              <div className="icon">⚡</div>
              <strong>سرعت</strong>
              <p className="muted">ثبت‌نام و تسویه‌ی سریع با کمترین پیچیدگی.</p>
            </div>
            <div className="card feature">
              <div className="icon">🔒</div>
              <strong>امنیت</strong>
              <p className="muted">حفاظت چندلایه‌ی حساب و تراکنش‌ها.</p>
            </div>
            <div className="card feature">
              <div className="icon">📊</div>
              <strong>گزارش‌گیری</strong>
              <p className="muted">نمایش شفاف سود، شارژ و برداشت.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}