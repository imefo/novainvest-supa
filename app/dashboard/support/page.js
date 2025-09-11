// app/dashboard/support/page.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: "", category: "عمومی", priority: "معمولی", message: "" });

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    setTickets(data || []);
  }

  async function createTicket() {
    if (!newTicket.title || !newTicket.message) return alert("لطفا موضوع و پیام را پر کنید");
    await supabase.from("tickets").insert([newTicket]);
    setNewTicket({ title: "", category: "عمومی", priority: "معمولی", message: "" });
    fetchTickets();
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">پشتیبانی</h1>

      {/* نمایش تیکت‌ها */}
      <div className="space-y-4 mb-8">
        {tickets.map((t) => (
          <div key={t.id} className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-semibold">{t.title}</h2>
            <p className="text-gray-300 mt-2">{t.message}</p>
            <p className="text-sm text-gray-400 mt-1">
              📌 {t.category} | 🔑 {t.priority} | 🕒 {new Date(t.created_at).toLocaleString("fa-IR")}
            </p>
            {t.admin_reply && (
              <div className="mt-3 p-3 rounded-md bg-purple-900 text-sm">
                <strong>✦ پاسخ ادمین:</strong> {t.admin_reply}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ایجاد تیکت جدید */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">ایجاد تیکت جدید</h2>
        <input
          type="text"
          placeholder="موضوع"
          className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          value={newTicket.title}
          onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
        />
        <textarea
          placeholder="متن پیام"
          className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          value={newTicket.message}
          onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
        />
        <button
          onClick={createTicket}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-2 rounded-lg hover:opacity-90 transition"
        >
          ثبت تیکت
        </button>
      </div>
    </div>
  );
}