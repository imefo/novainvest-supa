"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("min_amount_usdt", { ascending: true });

        if (error) {
          console.error("Error fetching plans:", error.message);
        } else if (alive) {
          setPlans(data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching plans:", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        پلن‌های سرمایه‌گذاری
      </h1>
      {plans.length === 0 ? (
        <div className="text-center text-gray-400">
          هیچ پلنی فعال نیست.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-gray-700 bg-gray-900/60 p-6 shadow-lg hover:shadow-purple-500/20 transition"
            >
              <h2 className="text-xl font-semibold text-white mb-2">
                {plan.name}
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                {plan.description || "بدون توضیحات"}
              </p>
              <ul className="text-gray-300 text-sm space-y-1 mb-4">
                <li>مدت: {plan.duration_days} روز</li>
                <li>سود: {plan.profit_percent}%</li>
                <li>حداقل سرمایه: {plan.min_amount_usdt} تتر</li>
              </ul>
              <Link
                href={`/deposit?planId=${plan.id}`}
                className="block text-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 text-white py-2 px-4 font-medium hover:from-purple-500 hover:to-indigo-400 transition"
              >
                سرمایه‌گذاری
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}