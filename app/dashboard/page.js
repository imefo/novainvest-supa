"use client";
import Link from "next/link";

export default function DashboardPage(){
  return (
    <section className="section" dir="rtl">
      <div className="container">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:18}}>
          <h1 className="section-title" style={{margin:0}}>داشبورد</h1>
          <Link className="glass-btn glass-btn--ghost" href="/">بازگشت به خانه</Link>
        </div>

        <div className="stats">
          <div className="glass-card stat">
            <span className="muted">ارزش پرتفوی</span>
            <strong>۳۴۰٬۰۰۰٬۰۰۰ تومان</strong>
          </div>
          <div className="glass-card stat">
            <span className="muted">سود ۳۰ روز</span>
            <strong>+۷.۸٪</strong>
          </div>
          <div className="glass-card stat">
            <span className="muted">پلن‌های فعال</span>
            <strong>۳</strong>
          </div>
          <div className="glass-card stat">
            <span className="muted">آخرین به‌روزرسانی</span>
            <strong>لحظه‌ای</strong>
          </div>
        </div>

        <div className="grid-3" style={{marginTop:18}}>
          <article className="glass-card" style={{padding:16}}>
            <h3 style={{marginTop:0}}>پلن امن</h3>
            <p className="muted">ریسک پایین، بازده پایدار.</p>
            <button className="glass-btn glass-btn--primary">افزایش موجودی</button>
          </article>
          <article className="glass-card" style={{padding:16}}>
            <h3 style={{marginTop:0}}>پلن متعادل</h3>
            <p className="muted">تناسب ریسک و بازده.</p>
            <button className="glass-btn">گزارش‌گیری</button>
          </article>
          <article className="glass-card" style={{padding:16}}>
            <h3 style={{marginTop:0}}>پلن رشد</h3>
            <p className="muted">بازده بالا با کنترل ریسک.</p>
            <button className="glass-btn">مدیریت</button>
          </article>
        </div>
      </div>
    </section>
  );
}