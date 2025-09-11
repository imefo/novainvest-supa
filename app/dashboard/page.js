"use client";

import Link from "next/link";

const cards = [
  {
    title: "کیف پول",
    description: "مدیریت موجودی و تراکنش‌های شما",
    icon: "👛",
    link: "/dashboard/wallet",
  },
  {
    title: "پلن‌ها",
    description: "انتخاب و سرمایه‌گذاری در پلن‌ها",
    icon: "📊",
    link: "/plans",
  },
  {
    title: "تراکنش‌ها",
    description: "پیگیری و مشاهده تراکنش‌های شما",
    icon: "💳",
    link: "/dashboard/transactions",
  },
  {
    title: "دعوتی‌ها",
    description: "کد معرف خود را به اشتراک بگذارید و پاداش بگیرید",
    icon: "🤝",
    link: "/dashboard/referrals",
  },
  {
    title: "پشتیبانی",
    description: "ثبت و پیگیری تیکت‌های پشتیبانی",
    icon: "🎫",
    link: "/dashboard/support",
  },
  {
    title: "مسابقه",
    description: "شرکت در مسابقه دعوتی و برنده شدن جایزه",
    icon: "🏆",
    link: "/dashboard/competition",
  },
  {
    title: "پروفایل",
    description: "مدیریت اطلاعات شخصی شما",
    icon: "👤",
    link: "/dashboard/profile",
  },
];

export default function DashboardPage() {
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