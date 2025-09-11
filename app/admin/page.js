"use client";

import Link from "next/link";

const cards = [
  {
    href: "/admin/users",
    title: "کاربران",
    desc: "مشاهده/مسدودسازی/تغییر موجودی + جزئیات کاربر",
    icon: "👤",
  },
  {
    href: "/admin/plans",
    title: "پلن‌ها",
    desc: "ایجاد/ویرایش/حذف پلن + فعال/غیرفعال",
    icon: "📈",
  },
  {
    href: "/admin/transactions",
    title: "تراکنش‌ها",
    desc: "واریز/برداشت کاربران و وضعیت‌ها",
    icon: "💳",
  },
  {
    href: "/admin/deposit",
    title: "واریز/برداشت",
    desc: "تنظیم ارز و آدرس ولت + تایید دستی واریز/برداشت",
    icon: "💰",
  },
  {
    href: "/admin/kyc",
    title: "KYC",
    desc: "تایید/رد احراز هویت کاربران",
    icon: "🪪",
  },
  {
    href: "/admin/tickets",
    title: "تیکت‌ها",
    desc: "پاسخگویی به تیکت‌ها و بستن گفتگو",
    icon: "🎫",
  },
];

export default function AdminHome() {
  return (
    <div className="ad-cards">
      {cards.map(c => (
        <Link key={c.href} href={c.href} className="ad-card">
          <div className="ad-card-icon">{c.icon}</div>
          <h3 className="ad-card-title">{c.title}</h3>
          <p className="ad-card-desc">{c.desc}</p>
          <div className="ad-card-cta">رفتن به {c.title} →</div>
        </Link>
      ))}
    </div>
  );
}