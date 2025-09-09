"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="nv-container hero">
      <div className="hero-grid">
        <div className="hero-left">
          <h1>سرمایه‌گذاری هوشمند — سریع، شفاف، مطمئن</h1>
          <p className="muted">
            برداشت و واریز شفاف • پلن‌های فعال فقط برای عموم نمایش داده می‌شوند • پنل ادمین کامل (کاربران، تراکنش‌ها، پلن‌ها، KYC)
          </p>

          <div className="form glass">
            <div className="row gap">
              <input className="input" placeholder="نام و نام خانوادگی" />
              <input className="input ltr" placeholder="ایمیل" />
            </div>
            <div className="row gap">
              <input className="input ltr" type="password" placeholder="رمز عبور" />
              <Link href="/signup" className="btn primary">ایجاد حساب</Link>
            </div>
            <div className="row between">
              <Link href="/login" className="link">حساب دارید؟ ورود</Link>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="card glass">
            <div className="card-head">چرا NovalInvest؟</div>
            <ul className="list">
              <li>کنترل کامل ادمین روی تراکنش‌ها و KYC</li>
              <li>پلن‌های شفاف و قابل ارزیابی</li>
              <li>تراکنش‌های ثبت‌شده و قابل پیگیری</li>
            </ul>
            <Link href="/plans" className="btn">دیدن پلن‌ها</Link>
          </div>
        </div>
      </div>
    </div>
  );
}