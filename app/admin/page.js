"use client";

import Link from "next/link";

const cards = [
  {
    title: "کاربران",
    description: "مشاهده / مسدودسازی / تغییر موجودی و جزئیات کاربر",
    icon: "👤",
    link: "/admin/users",
  },
  {
    title: "پلن‌ها",
    description: "مدیریت پلن‌های سرمایه‌گذاری",
    icon: "📄",
    link: "/admin/plans",
  },
  {
    title: "تراکنش‌ها",
    description: "مشاهده و بررسی تراکنش‌ها",
    icon: "💳",
    link: "/admin/transactions",
  },
  {
    title: "واریز و برداشت",
    description: "تأیید یا رد واریزها و برداشت‌ها",
    icon: "💰",
    link: "/admin/deposit",
  },
  {
    title: "KYC",
    description: "تأیید یا رد احراز هویت کاربران",
    icon: "🪪",
    link: "/admin/kyc",
  },
  {
    title: "تیکت‌ها",
    description: "پشتیبانی و پاسخگویی به کاربران",
    icon: "🎫",
    link: "/admin/tickets",
  },
  {
    title: "مسابقه",
    description: "مدیریت مسابقات و دعوتی‌ها",
    icon: "🏆",
    link: "/admin/competition",
  },
];

export default function AdminPage() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <Link
          key={i}
          href={card.link}
          className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-2xl transition"
        >
          <div className="text-4xl mb-4">{card.icon}</div>
          <h2 className="text-xl font-semibold">{card.title}</h2>
          <p className="text-gray-500 text-sm text-center mt-2">{card.description}</p>
        </Link>
      ))}
    </div>
  );
}