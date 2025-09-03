// app/page.tsx
"use client";
import React from "react";

export default function HomePage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <>
      <section className="home-hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>
              سرمایه‌گذاری هوشمند با <span className="accent">NovaInvest</span>
            </h1>
            <p className="muted">
              پلن‌های روشن و قابل‌فهم، داشبورد سریع و پاسخگو — با تمرکز بر امنیت و حریم خصوصی.
            </p>
          </div>

          <form className="hero-form" onSubmit={handleSubmit}>
            <h2>ثبت‌نام سریع</h2>
            <div className="form-row">
              <input type="text" placeholder="نام" required />
              <input type="text" placeholder="نام خانوادگی" required />
            </div>
            <input type="email" placeholder="ایمیل" required />
            <input type="password" placeholder="رمز عبور" required />
            <button className="btn btn-primary" type="submit">ادامه</button>
            <p className="muted tiny">با ورود یا ثبت‌نام، شرایط استفاده را می‌پذیرید.</p>
          </form>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2>پلن‌های فعال</h2>
          <p className="muted">دسته‌بندی: امن و پرریسک — به‌همراه مرتب‌سازی.</p>
        </div>
      </section>
    </>
  );
}