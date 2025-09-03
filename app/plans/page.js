"use client";
import Link from "next/link";

const plans = [
  { id:"safe", title:"امن", price:"۱۵٪ سالانه", points:["ریسک پایین","برداشت آسان","پشتیبانی ویژه"] },
  { id:"balanced", title:"متعادل", price:"۲۵٪ سالانه", points:["ریسک متوسط","تنظیم‌پذیر","گزارش دقیق"] },
  { id:"growth", title:"رشد", price:"۴۰٪ سالانه", points:["ریسک کنترل‌شده","بازده بالا","داشبورد حرفه‌ای"] },
  { id:"pro", title:"حرفه‌ای", price:"متغیر", points:["استراتژی‌های پیشرفته","SLA اختصاصی","سرویس مشاوره"] },
];

export default function PlansPage(){
  return (
    <section className="section" dir="rtl">
      <div className="container">
        <h1 className="section-title">پلن‌های قابل انتخاب</h1>
        <div className="grid-4">
          {plans.map(p => (
            <article key={p.id} className="glass-card plan">
              <div className="badge">{p.title}</div>
              <div className="price">{p.price}</div>
              <ul className="muted" style={{paddingInlineStart:18,margin:0}}>
                {p.points.map((t,i)=><li key={i}>• {t}</li>)}
              </ul>
              <Link className="glass-btn glass-btn--primary" href={`/plans/${p.id}`}>انتخاب پلن</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}