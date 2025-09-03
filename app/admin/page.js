"use client";
import Link from "next/link";

export default function AdminPage() {
  return (
    <section className="section" dir="rtl">
      <div className="container">
        {/* هدر صفحه ادمین */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:22}}>
          <h1 className="section-title" style={{margin:0}}>مدیریت سامانه</h1>
          <Link className="glass-btn glass-btn--ghost" href="/">بازگشت به خانه</Link>
        </div>

        {/* کارت‌های مدیریتی */}
        <div className="grid-3">
          <article className="glass-card" style={{padding:18}}>
            <h3 style={{marginTop:0}}>کاربران</h3>
            <p className="muted">مدیریت ثبت‌نام‌ها، نقش‌ها و دسترسی‌ها</p>
            <button className="glass-btn glass-btn--primary">مدیریت کاربران</button>
          </article>

          <article className="glass-card" style={{padding:18}}>
            <h3 style={{marginTop:0}}>پلن‌ها</h3>
            <p className="muted">افزودن، ویرایش یا حذف پلن‌های سرمایه‌گذاری</p>
            <button className="glass-btn">مدیریت پلن‌ها</button>
          </article>

          <article className="glass-card" style={{padding:18}}>
            <h3 style={{marginTop:0}}>گزارش‌ها</h3>
            <p className="muted">مشاهده آمار مالی و وضعیت کلی</p>
            <button className="glass-btn">گزارش‌گیری</button>
          </article>
        </div>

        {/* بخش لاگ‌ها */}
        <div className="glass-card" style={{padding:18,marginTop:22}}>
          <h3 style={{marginTop:0}}>لاگ‌های سیستم</h3>
          <p className="muted">آخرین فعالیت‌های سامانه:</p>
          <ul className="muted" style={{paddingInlineStart:18,margin:0}}>
            <li>کاربر جدید ثبت‌نام کرد (۲ دقیقه پیش)</li>
            <li>پلن "رشد" ویرایش شد (۱ ساعت پیش)</li>
            <li>مدیر سیستم وارد شد (دیروز)</li>
          </ul>
        </div>
      </div>
    </section>
  );
}