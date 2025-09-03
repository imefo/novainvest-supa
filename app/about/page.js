// app/about/page.js
"use client";

export default function AboutPage() {
  return (
    <section className="container" style={{ padding: "40px 0" }}>
      <h1>درباره نوااینوست</h1>
      <p className="muted">
        نوااینوست با تمرکز بر سادگی، شفافیت و امنیت ساخته شده است. هدف ما
        ارائه‌ی ابزارهای سرمایه‌گذاری قابل فهم برای همه است.
      </p>
      <ul>
        <li>پلن‌های روشن و شفاف</li>
        <li>داشبورد سریع و پاسخگو</li>
        <li>حریم خصوصی و امنیت داده‌ها</li>
      </ul>
    </section>
  );
}