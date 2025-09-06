"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const EMPTY = {
  id: null,
  name: "",
  description: "",
  type: "safe",          // safe | balanced | risky
  rules: "",
  profit_percent: 10,    // %
  duration_days: 30,     // days
  min_amount: 0,         // currency
  is_active: true,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const resetMsg = () => setMsg({ type: "", text: "" });

  async function load() {
    setLoading(true);
    resetMsg();
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMsg({ type: "error", text: error.message });
    else setPlans(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function edit(p) {
    resetMsg();
    setForm({
      id: p.id,
      name: p.name ?? "",
      description: p.description ?? "",
      type: p.type ?? "safe",
      rules: p.rules ?? "",
      profit_percent: Number(p.profit_percent) || 0,
      duration_days: Number(p.duration_days) || 0,
      min_amount: Number(p.min_amount) || 0,
      is_active: !!p.is_active,
    });
    scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setForm(EMPTY);
    resetMsg();
  }

  async function save(e) {
    e.preventDefault();
    resetMsg();
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      rules: form.rules.trim(),
      profit_percent: Number(form.profit_percent) || 0,
      duration_days: Number(form.duration_days) || 0,
      min_amount: Number(form.min_amount) || 0,
      is_active: !!form.is_active,
    };

    let res;
    if (form.id) {
      res = await supabase.from("plans").update(payload).eq("id", form.id).select().single();
    } else {
      res = await supabase.from("plans").insert(payload).select().single();
    }

    if (res.error) {
      setMsg({ type: "error", text: res.error.message });
    } else {
      setMsg({ type: "ok", text: form.id ? "پلن ویرایش شد." : "پلن ایجاد شد." });
      setForm(EMPTY);
      await load();
    }
    setSaving(false);
  }

  async function toggleActive(p) {
    resetMsg();
    const { error } = await supabase
      .from("plans")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) setMsg({ type: "error", text: error.message });
    else await load();
  }

  async function removePlan(p) {
    resetMsg();
    if (!confirm(`پلن «${p.name}» حذف شود؟`)) return;
    const { error } = await supabase.from("plans").delete().eq("id", p.id);
    if (error) setMsg({ type: "error", text: error.message });
    else {
      setMsg({ type: "ok", text: "پلن حذف شد." });
      await load();
    }
  }

  const countActive = useMemo(() => plans.filter((p) => p.is_active).length, [plans]);

  return (
    <div className="nv-container nv-rtl" style={{ paddingTop: 24 }}>
      <h2 className="section-title">مدیریت پلن‌ها</h2>

      {/* پیام وضعیت */}
      {msg.text ? (
        <div
          className="card"
          style={{
            borderColor: msg.type === "error" ? "#ef4444" : "#22c55e",
            marginBottom: 12,
          }}
        >
          <strong style={{ display: "block", marginBottom: 6 }}>
            {msg.type === "error" ? "خطا" : "موفق"}
          </strong>
          <div>{msg.text}</div>
        </div>
      ) : null}

      {/* فرم ایجاد/ویرایش */}
      <form onSubmit={save} className="card" style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>نام پلن</label>
            <input
              className="nv-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label>نوع</label>
            <select
              className="nv-input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="safe">امن</option>
              <option value="balanced">متعادل</option>
              <option value="risky">ریسکی</option>
            </select>
          </div>
        </div>

        <div>
          <label>توضیحات</label>
          <textarea
            className="nv-input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label>قوانین / نکات</label>
          <textarea
            className="nv-input"
            rows={3}
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <div>
            <label>درصد سود (%)</label>
            <input
              type="number"
              className="nv-input"
              value={form.profit_percent}
              onChange={(e) => setForm({ ...form, profit_percent: e.target.value })}
            />
          </div>
          <div>
            <label>مدت (روز)</label>
            <input
              type="number"
              className="nv-input"
              value={form.duration_days}
              onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
            />
          </div>
          <div>
            <label>حداقل مبلغ</label>
            <input
              type="number"
              className="nv-input"
              value={form.min_amount}
              onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            فعال (برای عموم نمایش داده شود)
          </label>

          <div style={{ marginInlineStart: "auto", display: "flex", gap: 8 }}>
            {form.id && (
              <button type="button" className="btn" onClick={cancelEdit}>
                لغو ویرایش
              </button>
            )}
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "در حال ذخیره…" : form.id ? "ذخیره ویرایش" : "ایجاد پلن"}
            </button>
          </div>
        </div>
      </form>

      {/* لیست پلن‌ها */}
      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <strong>مجموع پلن‌ها: {plans.length}</strong>
          <span className="muted">فعال: {countActive}</span>
        </div>

        {loading ? (
          <div className="nv-loading">در حال بارگذاری…</div>
        ) : plans.length === 0 ? (
          <div className="muted">هیچ پلنی ثبت نشده است.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="nv-table">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>نوع</th>
                  <th>سود (%)</th>
                  <th>مدت (روز)</th>
                  <th>حداقل مبلغ</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      {p.type === "safe" ? "امن" : p.type === "balanced" ? "متعادل" : "ریسکی"}
                    </td>
                    <td>{p.profit_percent}</td>
                    <td>{p.duration_days}</td>
                    <td>{p.min_amount}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: p.is_active ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)",
                          border: `1px solid ${p.is_active ? "rgba(34,197,94,.35)" : "rgba(239,68,68,.35)"}`,
                          color: p.is_active ? "#34d399" : "#f87171",
                        }}
                      >
                        {p.is_active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button className="btn" onClick={() => edit(p)}>ویرایش</button>
                        <button className="btn" onClick={() => toggleActive(p)}>
                          {p.is_active ? "غیرفعال‌سازی" : "فعال‌سازی"}
                        </button>
                        <button className="btn" onClick={() => removePlan(p)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* استایل‌های کوچک مخصوص جدول/ورودی‌ها */}
      <style jsx>{`
        label { display:block; font-size:14px; margin: 0 0 6px; color: #cbd5e1; }
        .nv-input { width:100%; height:44px; border-radius:10px; border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.05); color:#fff; padding:0 12px; outline:none; }
        textarea.nv-input { height:auto; padding:10px 12px; }
        .nv-table { width:100%; border-collapse: collapse; min-width: 820px; }
        .nv-table th, .nv-table td { text-align:right; padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.08); }
        .badge { display:inline-block; padding:6px 10px; border-radius:999px; font-size:12px; }
      `}</style>
    </div>
  );
}