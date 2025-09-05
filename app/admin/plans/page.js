"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const EMPTY = {
  id: null,
  name: "",
  description: "",
  type: "safe",        // safe | balanced | risky
  rules: "",
  profit_percent: 0,
  duration_days: 30,
  min_amount: 0,
  max_amount: null,    // اختیاری
  is_active: true,
};

export default function AdminPlansPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  function startEdit(row) {
    setForm({
      id: row.id,
      name: row.name || "",
      description: row.description || "",
      type: row.type || "safe",
      rules: row.rules || "",
      profit_percent: Number(row.profit_percent || 0),
      duration_days: Number(row.duration_days || 30),
      min_amount: Number(row.min_amount || 0),
      max_amount: row.max_amount == null ? null : Number(row.max_amount),
      is_active: !!row.is_active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // پاک‌سازی انواع عددی
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      type: form.type,
      rules: form.rules?.trim() || null,
      profit_percent: Number(form.profit_percent),
      duration_days: Number(form.duration_days),
      min_amount: Number(form.min_amount),
      max_amount: form.max_amount === null || form.max_amount === "" ? null : Number(form.max_amount),
      is_active: !!form.is_active,
    };

    if (form.id) {
      const { error } = await supabase.from("plans").update(payload).eq("id", form.id);
      if (error) alert(error.message);
      else resetForm();
    } else {
      const { error } = await supabase.from("plans").insert(payload);
      if (error) alert(error.message);
      else resetForm();
    }

    setLoading(false);
    await load();
  }

  async function toggleActive(row) {
    const { error } = await supabase
      .from("plans")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) alert(error.message);
    await load();
  }

  async function removeRow(id) {
    if (!confirm("پلن حذف شود؟")) return;
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) alert(error.message);
    await load();
  }

  const filtered = items.filter((p) => {
    if (!q) return true;
    const t = (q || "").toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(t) ||
      (p.description || "").toLowerCase().includes(t) ||
      (p.type || "").toLowerCase().includes(t)
    );
  });

  return (
    <section className="section">
      <div className="container">
        <h1 style={{marginBottom:12}}>مدیریت پلن‌ها</h1>

        {/* فرم ایجاد/ویرایش */}
        <form onSubmit={handleSubmit} className="glass card stack gap12" style={{marginBottom:16}}>
          <div className="row gap12">
            <input
              className="input" placeholder="نام پلن"
              value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required
            />
            <select
              className="input" value={form.type}
              onChange={e=>setForm({...form, type:e.target.value})}
            >
              <option value="safe">ایمن (safe)</option>
              <option value="balanced">متعادل (balanced)</option>
              <option value="risky">ریسکی (risky)</option>
            </select>
            <label className="row center gap6">
              <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active:e.target.checked})}/>
              فعال برای عموم
            </label>
          </div>

          <textarea className="input" rows={3} placeholder="توضیحات"
            value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />

          <textarea className="input" rows={2} placeholder="قوانین"
            value={form.rules} onChange={e=>setForm({...form, rules:e.target.value})} />

          <div className="row gap12">
            <input type="number" className="input" placeholder="درصد سود (مثلاً 4.5)"
              value={form.profit_percent} onChange={e=>setForm({...form, profit_percent:e.target.value})} step="0.01" />
            <input type="number" className="input" placeholder="مدت (روز)"
              value={form.duration_days} onChange={e=>setForm({...form, duration_days:e.target.value})} />
            <input type="number" className="input" placeholder="حداقل مبلغ"
              value={form.min_amount} onChange={e=>setForm({...form, min_amount:e.target.value})} />
            <input type="number" className="input" placeholder="حداکثر مبلغ (اختیاری)"
              value={form.max_amount ?? ""} onChange={e=>setForm({...form, max_amount:e.target.value})} />
          </div>

          <div className="row gap8">
            <button className="btn-primary" disabled={loading}>
              {form.id ? "ذخیره تغییرات" : "ایجاد پلن"}
            </button>
            {form.id && (
              <button type="button" className="btn" onClick={resetForm}>انصراف از ویرایش</button>
            )}
          </div>
        </form>

        {/* فیلتر جستجو */}
        <div className="row gap8" style={{marginBottom:12}}>
          <input className="input" placeholder="جستجو نام/نوع/توضیح…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn" onClick={load}>بازخوانی</button>
        </div>

        {/* جدول پلن‌ها */}
        <div className="glass card">
          <div className="table">
            <div className="thead">
              <div>نام</div>
              <div>نوع</div>
              <div>سود٪</div>
              <div>مدت</div>
              <div>حداقل</div>
              <div>حداکثر</div>
              <div>وضعیت</div>
              <div>اعمال</div>
            </div>

            {filtered.map((p)=>(
              <div key={p.id} className="trow">
                <div>{p.name}</div>
                <div>{p.type}</div>
                <div>{Number(p.profit_percent).toLocaleString("fa-IR")}</div>
                <div>{p.duration_days} روز</div>
                <div>{Number(p.min_amount).toLocaleString("fa-IR")}</div>
                <div>{p.max_amount == null ? "—" : Number(p.max_amount).toLocaleString("fa-IR")}</div>
                <div>
                  <button className="btn tiny" onClick={()=>toggleActive(p)}>
                    {p.is_active ? "🔓 فعال" : "🔒 غیرفعال"}
                  </button>
                </div>
                <div className="row gap6">
                  <button className="btn tiny" onClick={()=>startEdit(p)}>ویرایش</button>
                  <button className="btn tiny" onClick={()=>removeRow(p.id)}>حذف</button>
                </div>
              </div>
            ))}

            {!filtered.length && (
              <div className="trow muted" style={{justifyContent:"center"}}>موردی یافت نشد.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}