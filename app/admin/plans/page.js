"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPlansPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    type: "safe",
    profit_percent: 10,
    duration_days: 30,
    min_amount: 0,
    is_active: true,
  });

  const reset = () =>
    setForm({
      id: null,
      name: "",
      description: "",
      type: "safe",
      profit_percent: 10,
      duration_days: 30,
      min_amount: 0,
      is_active: true,
    });

  const fmtNum = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "0";
    try { return n.toLocaleString("fa-IR"); } catch { return String(n); }
  };

  async function load() {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 4000);
    try {
      const { data, error } = await supabase.from("plans").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("admin plans load error:", e);
      setRows([]);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form };
      const body = {
        name: payload.name || "",
        description: payload.description || "",
        type: payload.type || "safe",
        profit_percent: Number(payload.profit_percent) || 0,
        duration_days: Number(payload.duration_days) || 0,
        min_amount: Number(payload.min_amount) || 0,
        is_active: !!payload.is_active,
        rules: payload.rules ?? null,
      };

      if (payload.id) {
        const { error } = await supabase.from("plans").update(body).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("plans").insert(body);
        if (error) throw error;
      }
      reset();
      await load();
    } catch (e) {
      alert("خطا در ذخیره پلن: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm("حذف شود؟")) return;
    try {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
      await load();
    } catch (e) {
      alert("خطا در حذف: " + (e?.message || e));
    }
  }

  return (
    <div className="nv-container" style={{ paddingTop: 24 }}>
      <h2 className="section-title">مدیریت پلن‌ها</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <input placeholder="نام پلن" value={form.name} onChange={(e)=>setForm(p=>({ ...p, name:e.target.value }))} />
          <select value={form.type} onChange={(e)=>setForm(p=>({ ...p, type:e.target.value }))}>
            <option value="safe">ایمن</option>
            <option value="balanced">متعادل</option>
            <option value="risky">ریسکی</option>
          </select>
          <input placeholder="درصد سود" type="number" value={form.profit_percent} onChange={(e)=>setForm(p=>({ ...p, profit_percent:e.target.value }))} />
          <input placeholder="مدت (روز)" type="number" value={form.duration_days} onChange={(e)=>setForm(p=>({ ...p, duration_days:e.target.value }))} />
          <input placeholder="حداقل سرمایه" type="number" value={form.min_amount} onChange={(e)=>setForm(p=>({ ...p, min_amount:e.target.value }))} />
          <label style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm(p=>({ ...p, is_active:e.target.checked }))} />
            فعال برای عموم
          </label>
          <textarea style={{ gridColumn:"1 / -1" }} placeholder="توضیحات" value={form.description} onChange={(e)=>setForm(p=>({ ...p, description:e.target.value }))} />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button className="nv-btn nv-btn-primary" disabled={saving} onClick={save}>
            {form.id ? "ویرایش پلن" : "افزودن پلن"}
          </button>
          {form.id && <button className="nv-btn" onClick={reset}>انصراف</button>}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div>در حال بارگذاری لیست پلن‌ها…</div>
        ) : rows.length === 0 ? (
          <div>پلنی وجود ندارد.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r) => (
              <div key={r?.id || Math.random()} className="card" style={{ display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center" }}>
                <div>
                  <strong>{r?.name ?? "-"}</strong> <span className="muted">({r?.type ?? "-"})</span>
                  <div className="muted" style={{ marginTop: 4 }}>
                    سود: {fmtNum(r?.profit_percent)}% — مدت: {fmtNum(r?.duration_days)} روز — حداقل: {fmtNum(r?.min_amount)} — {r?.is_active ? "فعال" : "غیرفعال"}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="nv-btn" onClick={()=>setForm({
                    id:r?.id ?? null,
                    name:r?.name ?? "",
                    description:r?.description ?? "",
                    type:r?.type ?? "safe",
                    profit_percent:r?.profit_percent ?? 0,
                    duration_days:r?.duration_days ?? 0,
                    min_amount:r?.min_amount ?? 0,
                    is_active:!!r?.is_active,
                  })}>ویرایش</button>
                  <button className="nv-btn" onClick={()=>remove(r?.id)}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}