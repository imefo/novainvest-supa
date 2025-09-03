// app/contact/page.js
"use client";

export default function ContactPage() {
  return (
    <section className="container" style={{ padding: "40px 0" }}>
      <h1>تماس با ما</h1>
      <p className="muted">برای پرسش‌ها و همکاری‌ها فرم زیر را پر کنید.</p>

      <form onSubmit={(e) => e.preventDefault()} style={{ maxWidth: 520 }}>
        <input
          type="text"
          placeholder="نام و نام خانوادگی"
          required
          style={{ width: "100%", height: 44, marginBottom: 12, padding: "0 12px" }}
        />
        <input
          type="email"
          placeholder="ایمیل"
          required
          style={{ width: "100%", height: 44, marginBottom: 12, padding: "0 12px" }}
        />
        <textarea
          placeholder="پیام شما"
          rows={5}
          style={{ width: "100%", marginBottom: 12, padding: 12, borderRadius: 8 }}
        />
        <button className="btn btn-primary" type="submit">ارسال</button>
      </form>
    </section>
  );
}