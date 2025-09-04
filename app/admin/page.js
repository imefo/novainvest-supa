"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [kyc, setKyc] = useState([]);
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    type: "safe",
    rules: "",
    profit_percent: "",
    duration_days: "",
  });

  useEffect(() => {
    loadUsers();
    loadTransactions();
    loadKyc();
    loadPlans();
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

  async function loadPlans() {
    const { data, error } = await supabase.from("plans").select("*");
    if (!error) setPlans(data);
  }

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

  async function approveKyc(id) {
    await supabase.from("kyc_requests").update({ status: "approved" }).eq("id", id);
    loadKyc();
  }
  async function rejectKyc(id) {
    await supabase.from("kyc_requests").update({ status: "rejected" }).eq("id", id);
    loadKyc();
  }

  async function addPlan(e) {
    e.preventDefault();
    await supabase.from("plans").insert([newPlan]);
    setNewPlan({ name: "", description: "", type: "safe", rules: "", profit_percent: "", duration_days: "" });
    loadPlans();
  }

  async function deletePlan(id) {
    await supabase.from("plans").delete().eq("id", id);
    loadPlans();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} dir="rtl">
      <aside style={{ width: 240, background: "rgba(255,255,255,.06)", padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>مدیریت</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setActiveTab("dashboard")}>داشبورد</button>
          <button onClick={() => setActiveTab("users")}>کاربران</button>
          <button onClick={() => setActiveTab("transactions")}>تراکنش‌ها</button>
          <button onClick={() => setActiveTab("kyc")}>احراز هویت</button>
          <button onClick={() => setActiveTab("plans")}>پلن‌ها</button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        {activeTab === "dashboard" && (
          <section>
            <h1>داشبورد</h1>
            <p>کاربران: {users.length}</p>
            <p>تراکنش‌ها: {transactions.length}</p>
            <p>KYC‌ها: {kyc.length}</p>
            <p>پلن‌ها: {plans.length}</p>
          </section>
        )}

        {activeTab === "plans" && (
          <section>
            <h1>مدیریت پلن‌ها</h1>
            <form onSubmit={addPlan} style={{ marginBottom: 20 }}>
              <input placeholder="نام پلن" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} required />
              <input placeholder="توضیحات" value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} />
              <select value={newPlan.type} onChange={e => setNewPlan({...newPlan, type: e.target.value})}>
                <option value="safe">امن</option>
                <option value="balanced">متعادل</option>
                <option value="risky">ریسکی</option>
              </select>
              <input placeholder="قوانین" value={newPlan.rules} onChange={e => setNewPlan({...newPlan, rules: e.target.value})} />
              <input type="number" placeholder="درصد سود" value={newPlan.profit_percent} onChange={e => setNewPlan({...newPlan, profit_percent: e.target.value})} required />
              <input type="number" placeholder="مدت زمان (روز)" value={newPlan.duration_days} onChange={e => setNewPlan({...newPlan, duration_days: e.target.value})} required />
              <button type="submit">افزودن پلن</button>
            </form>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr><th>نام</th><th>نوع</th><th>سود</th><th>مدت</th><th>اقدامات</th></tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.type}</td>
                    <td>{p.profit_percent}%</td>
                    <td>{p.duration_days} روز</td>
                    <td>
                      <button onClick={() => deletePlan(p.id)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}