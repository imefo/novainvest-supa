"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("id, title, message, category, priority, user_id, created_at, admin_reply")
      .order("created_at", { ascending: false });
    if (!error) setTickets(data);
  };

  const handleReply = async (id, reply) => {
    const { error } = await supabase
      .from("tickets")
      .update({ admin_reply: reply })
      .eq("id", id);

    if (!error) {
      alert("پاسخ ارسال شد ✅");
      fetchTickets();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">مدیریت تیکت‌ها 🎫</h1>

      {tickets.length === 0 && (
        <p className="text-gray-400">هیچ تیکتی یافت نشد.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-700 hover:shadow-purple-500/30 transition"
          >
            {/* عنوان */}
            <h2 className="text-xl font-semibold text-white mb-2">{ticket.title}</h2>

            {/* دسته و اولویت */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 text-xs rounded bg-purple-600 text-white">
                {ticket.category}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  ticket.priority === "high"
                    ? "bg-red-600"
                    : ticket.priority === "normal"
                    ? "bg-yellow-500"
                    : "bg-green-600"
                } text-white`}
              >
                {ticket.priority}
              </span>
            </div>

            {/* پیام کاربر */}
            <p className="text-gray-300 text-sm mb-3 whitespace-pre-line">
              {ticket.message}
            </p>

            {/* اطلاعات کاربر و زمان */}
            <div className="text-xs text-gray-400 mb-4">
              <p>👤 کاربر: {ticket.user_id}</p>
              <p>🕒 {new Date(ticket.created_at).toLocaleString("fa-IR")}</p>
            </div>

            {/* پاسخ ادمین */}
            <div>
              <textarea
                placeholder="پاسخ ادمین..."
                defaultValue={ticket.admin_reply || ""}
                className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 focus:border-purple-500"
                onBlur={(e) => handleReply(ticket.id, e.target.value)}
              />
              <p className="text-xs text-green-400 mt-1">
                {ticket.admin_reply ? "✅ پاسخ داده شده" : "⏳ منتظر پاسخ"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}