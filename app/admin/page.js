"use client";

import Link from "next/link";
import { useMemo } from "react";

const cards = [
  {
    href: "/admin/transactions",
    title: "تراکنش‌ها",
    desc: "واریز/برداشت‌ها و وضعیت‌ها",
    icon: "💳",
    cta: "رفتن به تراکنش‌ها",
  },
  {
    href: "/admin/users",
    title: "کاربران",
    desc: "مشاهده/مسدودسازی/تغییر موجودی + جزئیات",
    icon: "👤",
    cta: "رفتن به کاربران",
  },
  {
    href: "/admin/plans",
    title: "پلن‌ها",
    desc: "ایجاد/ویرایش/حذف پلن + فعال/غیرفعال",
    icon: "📈",
    cta: "رفتن به پلن‌ها",
  },
  {
    href: "/admin/deposit",
    title: "واریز/برداشت",
    desc: "تنظیم ارز و آدرس ولت + تایید دستی واریز/برداشت",
    icon: "💰",
    cta: "رفتن به واریز/برداشت",
  },
  {
    href: "/admin/kyc",
    title: "KYC",
    desc: "تایید/رد احراز هویت کاربران",
    icon: "🪪",
    cta: "رفتن به KYC",
  },
  {
    href: "/admin/tickets",
    title: "تیکت‌ها",
    desc: "پاسخگویی به تیکت‌ها و بستن گفتگو",
    icon: "🎧",
    cta: "رفتن به تیکت‌ها",
  },
];

export default function AdminHome() {
  const grid = useMemo(() => cards, []);

  return (
    <div className="space-y-6">
      {/* هدر بنفش نرم */}
      <div className="card p-6 bg-gradient-to-r from-purple-700/30 to-indigo-700/30 border border-purple-700/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">نمای کلی</h2>
            <p className="text-sm text-gray-300 mt-1">
              همه‌ی ابزارهای مدیریت در قالب کارت‌های زیر در دسترس هستند.
            </p>
          </div>
          <Link href="/dashboard" className="btn btn-primary">بازگشت به داشبورد کاربر</Link>
        </div>
      </div>

      {/* گرید کارت‌ها – بدون سایدبار */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((c) => (
          <Link key={c.href} href={c.href} className="card group">
            <div className="flex items-start justify-between">
              <div className="text-3xl">{c.icon}</div>
              <span className="text-xs px-2 py-1 rounded-md bg-gray-700/60 text-gray-300 border border-gray-600">
                مدیریت
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
            <p className="mt-1 text-sm text-gray-300">{c.desc}</p>
            <div className="mt-4">
              <span className="btn btn-primary inline-block">
                {c.cta} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}