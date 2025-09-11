"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("id, title, message, category, priority, user_id, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data);
      }
      setLoading(false);
    };

    fetchTickets();
  }, []);

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">مدیریت تیکت‌ها 🎧</h1>
      {tickets.length === 0 ? (
        <p>هیچ تیکتی یافت نشد.</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 bg-gray-800 rounded-lg shadow-md"
            >
              <h2 className="text-lg font-semibold">{ticket.title}</h2>
              <p className="text-sm text-gray-400">{ticket.message}</p>
              <div className="mt-2 text-sm">
                <span className="mr-2">📂 {ticket.category}</span>
                <span className="mr-2">⚡ {ticket.priority}</span>
                <span className="mr-2">👤 {ticket.user_id}</span>
                <span className="mr-2">🕒 {new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}