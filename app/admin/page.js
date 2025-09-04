"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [kyc, setKyc] = useState([]);

  // لود اولیه دیتا
  useEffect(() => {
    loadUsers();
    loadTransactions();
    loadKyc();
  }, []);

  async function loadUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (!error) setUsers(data);
  }

  async function loadTransactions() {
    const { data, error } = await supabase.from("v_transactions").select("*");
    if (!error) setTransactions(data);
  }

  async function loadKyc() {
    const { data, error } = await supabase.from("v_kyc").select("*");
    if (!error) setKyc(data);
  }

  // اقدامات روی کاربران
  async function blockUser(id) {
    await supabase.from("users").update({ status: "blocked" }).eq("id", id);
    loadUsers();
  }
  async function unblockUser(id) {
    await supabase.from("users").update({ status: "active" }).eq("id", id);
    loadUsers();
  }
  async function deleteUser(id) {
    await supabase.from("users").delete().eq("id", id);
    loadUsers();
  }

  // اقدامات روی KYC
  async function approveKyc(id) {
    await supabase.from("kyc_requests").update({ status: "approved" }).eq("id", id);
    loadKyc();
  }
  async function rejectKyc(id) {
    await supabase.from("kyc_requests").update({ status: "rejected" }).eq("id", id);
    loadKyc();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} dir="rtl">
      {/* Sidebar */}
      <aside style={{ width: 240, background: "rgba(255,255,255,.06)", padding: 20 }} className="glass-card">
        <h2 style={{ marginTop: 0 }}>مدیریت</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="glass-btn" onClick={() => setActiveTab("dashboard")}>داشبورد</button>
          <button className="glass-btn" onClick={() => setActiveTab("users")}>کاربران</button>
          <button className="glass-btn" onClick={() => setActiveTab("transactions")}>تراکنش‌ها</button>
          <button className="glass-btn" onClick={() => setActiveTab("kyc")}>احراز هویت</button>
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: 24 }}>
        {activeTab === "dashboard" && (
          <section>
            <h1>داشبورد</h1>
            <p>تعداد کاربران: {users.length}</p>
            <p>تعداد تراکنش‌ها: {transactions.length}</p>
            <p>درخواست‌های KYC: {kyc.length}</p>
          </section>
        )}

        {activeTab === "users" && (
          <section>
            <h1>کاربران</h1>
            <table className="glass-card" style={{ width: "100%", padding: 12 }}>
              <thead>
                <tr><th>ایمیل</th><th>وضعیت</th><th>اقدامات</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.status}</td>
                    <td>
                      <button className="glass-btn" onClick={() => blockUser(u.id)}>مسدود</button>
                      <button className="glass-btn" onClick={() => unblockUser(u.id)}>آنبلاک</button>
                      <button className="glass-btn" onClick={() => deleteUser(u.id)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "transactions" && (
          <section>
            <h1>تراکنش‌ها</h1>
            <table className="glass-card" style={{ width: "100%", padding: 12 }}>
              <thead>
                <tr><th>کاربر</th><th>مبلغ</th><th>نوع</th><th>وضعیت</th></tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.email}</td>
                    <td>{t.amount}</td>
                    <td>{t.type}</td>
                    <td>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "kyc" && (
          <section>
            <h1>احراز هویت</h1>
            {kyc.map(req => (
              <div key={req.id} className="glass-card" style={{ padding: 12, marginBottom: 10 }}>
                <p>کاربر: {req.email}</p>
                <p>مدرک: <a href={req.document_url} target="_blank">مشاهده</a></p>
                <p>وضعیت: {req.status}</p>
                <button className="glass-btn glass-btn--primary" onClick={() => approveKyc(req.id)}>تأیید</button>
                <button className="glass-btn glass-btn--ghost" onClick={() => rejectKyc(req.id)}>رد</button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}