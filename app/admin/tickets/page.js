"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    setTickets(data || []);
  }

  async function sendReply(ticketId) {
    if (!reply) return;
    await supabase.from("tickets").update({ admin_reply: reply }).eq("id", ticketId);
    setReply("");
    fetchTickets();
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">مدیریت تیکت‌ها | پشتیبانی</h1>

      {tickets.map((t) => (
        <div key={t.id} className="bg-gray-800 rounded-lg p-5 mb-4 shadow-lg">
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <p className="mt-2">{t.message}</p>
          <p className="text-sm text-gray-400 mt-1">
            👤 {t.user_id} | 📌 {t.category} | 🔑 {t.priority}
          </p>

          {t.admin_reply && (
            <div className="mt-3 p-3 rounded-md bg-green-800 text-sm">
              <strong>✦ پاسخ ادمین:</strong> {t.admin_reply}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="پاسخ ادمین..."
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <button
              onClick={() => sendReply(t.id)}
              className="bg-purple-600 px-4 py-2 rounded hover:opacity-90 transition"
            >
              ارسال
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}