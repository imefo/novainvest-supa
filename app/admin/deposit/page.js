"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDepositsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actMsg, setActMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      // فقط pending‌ها را بیاور
      const { data, error } = await supabase
        .from("manual_deposits")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (e) {
      console.error(e);
      setActMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(item) {
    setActMsg("");
    try {
      // 1) مارک به approved
      const { error: upErr } = await supabase
        .from("manual_deposits")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", item.id);
      if (upErr) throw upErr;

      // 2) ثبت تراکنش done (ادمین اجازه insert دارد)
      await supabase.from("transactions").insert({
        user_id: item.user_id,
        type: "deposit",
        amount: item.amount,
        currency: item.currency || "USD",
        status: "done",
        meta: { via: "manual", deposit_id: item.id, tx_hash: item.tx_hash || null }
      });

      // اگر ستون balance در profiles داری و می‌خواهی شارژ لحظه‌ای شود (اختیاری):
      // await supabase.rpc('increment_balance', { uid: item.user_id, delta: item.amount })
      // یا:
      // await supabase.from('profiles').update({ balance: sql`balance + ${item.amount}` }).eq('user_id', item.user_id)

      setActMsg("تأیید شد.");
      load();
    } catch (e) {
      console.error(e);
      setActMsg(e.message);
    }
  }

  async function reject(item) {
    setActMsg("");
    try {
      const { error: upErr } = await supabase
        .from("manual_deposits")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", item.id);
      if (upErr) throw upErr;
      setActMsg("رد شد.");
      load();
    } catch (e) {
      console.error(e);
      setActMsg(e.message);
    }
  }

  return (
    <div className="nv-container">
      <h2>درخواست‌های واریز دستی (Pending)</h2>
      {loading && <p>در حال بارگذاری...</p>}
      {actMsg && <p style={{ color: "#eab308" }}>{actMsg}</p>}

      {!loading && items.length === 0 && <p>موردی برای بررسی نیست.</p>}

      <div className="card" style={{ padding: 12, borderRadius: 12 }}>
        {items.map((x) => (
          <div key={x.id} className="card" style={{ padding: 12, marginBottom: 10, borderRadius: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <strong>کاربر:</strong> <div style={{ wordBreak: "break-all" }}>{x.user_id}</div>
                <strong>مبلغ:</strong> {x.amount} {x.currency}
                <div><strong>شبکه:</strong> {x.network}</div>
                <div><strong>ساخته‌شده:</strong> {new Date(x.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div><strong>Tx Hash:</strong> <div style={{ wordBreak: "break-all" }}>{x.tx_hash || "—"}</div></div>
                <div><strong>Wallet کاربر:</strong> <div style={{ wordBreak: "break-all" }}>{x.user_wallet || "—"}</div></div>
                <div><strong>یادداشت:</strong> {x.note || "—"}</div>
              </div>
              <div>
                <div><strong>Screenshot:</strong></div>
                {x.screenshot_url ? (
                  <a href={x.screenshot_url} target="_blank" className="nv-link">مشاهده</a>
                ) : <span>—</span>}
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="nv-btn nv-btn-primary" onClick={() => approve(x)}>تأیید</button>
                  <button className="nv-btn" onClick={() => reject(x)}>رد</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}