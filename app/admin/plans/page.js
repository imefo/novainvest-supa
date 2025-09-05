"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const emptyForm = {
  id: null,
  name: "",
  description: "",
  type: "safe",
  rules: "",
  profit_percent: 0,
  duration_days: 30,
  min_amount: 0,
  is_active: true,
};

export default function AdminPlans() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  function editRow(row) {
    setForm({ ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form };
    if (payload.id) {
      const { error } = await supabase.from("plans").update(payload).eq("id", payload.id);
      if (!error) setForm(emptyForm);
    } else {
      const { error } = await supabase.from("plans").insert(payload);
      if (!error) setForm(emptyForm);
    }
    setLoading(false);
    load();
  }

  async function remove(id) {
    if (!confirm("حذف پلن؟")) return;
    await supabase.from("plans").delete().eq("id", id);
    load();
  }

  return (
    <div className="stack gap16">
      <h1>پلن‌ها</h1>

      <form onSubmit={submit} className="glass card stack gap12">
        <div className="row gap12">
          <input className="input" placeholder="نام پلن" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="safe">ایمن</option>
            <option value="balanced">متعادل</option>
            <option value="risky">ریسکی</option>
          </select>
          <label className="row center gap6">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            فعال
          </label>
        </div>

        <textarea className="input" rows={3} placeholder="توضیحات"
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

        <textarea className="input" rows={2} placeholder="قوانین"
          value={form.rules} onChange={e => setForm({ ...form, rules: e.target.value })} />

        <div className="row gap12">
          <input type="number" className="input" placeholder="درصد سود"
            value={form.profit_percent} onChange={e => setForm({ ...form, profit_percent: Number(e.target.value) })} />
          <input type="number" className="input" placeholder="مدت (روز)"
            value={form.duration_days} onChange={e => setForm({ ...form, duration_days: Number(e.target.value) })} />
          <input type="number" className="input" placeholder="حداقل مبلغ"
            value={form.min_amount} onChange={e => setForm({ ...form, min_amount: Number(e.target.value) })} />
        </div>

        <div className="row gap8">
          <button className="btn-primary" disabled={loading}>{form.id ? "ذخیره تغییرات" : "ایجاد پلن"}</button>
          {form.id && (
            <button type="button" className="btn" onClick={() => setForm(emptyForm)}>انصراف</button>
          )}
        </div>
      </form>

      <div className="glass card">
        <div className="table">
          <div className="thead">
            <div>نام</div><div>نوع</div><div>سود٪</div><div>مدت</div><div>حداقل</div><div>وضعیت</div><div>اعمال</div>
          </div>
          {items.map(p => (
            <div key={p.id} className="trow">
              <div>{p.name}</div>
              <div>{p.type}</div>
              <div>{p.profit_percent}</div>
              <div>{p.duration_days} روز</div>
              <div>{p.min_amount}</div>
              <div>{p.is_active ? "فعال" : "غیرفعال"}</div>
              <div className="row gap8">
                <button className="btn" onClick={() => editRow(p)}>ویرایش</button>
                <button className="btn" onClick={() => remove(p.id)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}