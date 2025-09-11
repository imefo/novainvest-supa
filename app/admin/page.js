"use client";
import Link from "next/link";

export default function AdminDashboard() {
  const cards = [
    {
      title: "کاربران 👥",
      desc: "مدیریت کاربران، تغییر موجودی، مسدودسازی و جزئیات کامل",
      href: "/admin/users",
    },
    {
      title: "پلن‌ها 📊",
      desc: "مدیریت پلن‌های سرمایه‌گذاری (افزودن / حذف / فعال / غیرفعال)",
      href: "/admin/plans",
    },
    {
      title: "تراکنش‌ها 💸",
      desc: "مشاهده و تایید واریز و برداشت کاربران",
      href: "/admin/transactions",
    },
    {
      title: "KYC 🪪",
      desc: "مدیریت احراز هویت کاربران (تایید / رد)",
      href: "/admin/kyc",
    },
    {
      title: "تیکت‌ها 🎫",
      desc: "پاسخ به تیکت‌های پشتیبانی کاربران",
      href: "/admin/tickets",
    },
    {
      title: "واریز/برداشت 💵",
      desc: "تنظیم ارز و آدرس ولت + تایید دستی واریز و برداشت",
      href: "/admin/deposit",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <h1 className="text-3xl font-bold text-center text-white mb-10">
        🎛️ پنل مدیریت
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 
              hover:from-indigo-700 hover:to-purple-700 transition-all
              rounded-xl shadow-lg p-6 text-white flex flex-col justify-between"
          >
            <h2 className="text-xl font-bold mb-3">{card.title}</h2>
            <p className="text-sm text-gray-200 mb-4">{card.desc}</p>
            <span className="mt-auto text-right text-sm font-semibold">
              ➝ ورود
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}