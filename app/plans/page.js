// app/plans/page.js
"use client";

const PLANS = [
  { id: "safe",   title: "پلن امن",     desc: "ریسک کم، بازده پایدار." },
  { id: "smart",  title: "پلن هوشمند",  desc: "تعادل ریسک و بازده." },
  { id: "risk",   title: "پلن پرریسک",  desc: "ریسک بالاتر، پتانسیل بازده بیشتر." },
];

export default function PlansPage() {
  return (
    <section className="container" style={{ padding: "40px 0" }}>
      <h1>پلن‌ها</h1>
      <p className="muted">یک پلن مناسب انتخاب کنید.</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16, marginTop: 16
      }}>
        {PLANS.map(p => (
          <article key={p.id} style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12, padding: 16
          }}>
            <h3 style={{ marginTop: 0 }}>{p.title}</h3>
            <p className="muted" style={{ marginTop: 8 }}>{p.desc}</p>
            <a href={`/plans/${p.id}`} className="btn">جزئیات</a>
          </article>
        ))}
      </div>
    </section>
  );
}