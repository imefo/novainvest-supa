"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, is_admin, is_blocked, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error) setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleBlock(user_id, is_blocked) {
    await supabase
      .from("profiles")
      .update({ is_blocked: !is_blocked })
      .eq("user_id", user_id);
    load();
  }

  async function toggleAdmin(user_id, is_admin) {
    await supabase
      .from("profiles")
      .update({ is_admin: !is_admin })
      .eq("user_id", user_id);
    load();
  }

  return (
    <div className="stack gap16">
      <h1>کاربران</h1>
      <div className="glass card">
        {loading ? "درحال بارگذاری…" : (
          <div className="table">
            <div className="thead">
              <div>ایمیل/شناسه</div><div>نام</div><div>ادمین؟</div><div>بلاک؟</div><div>اعمال</div>
            </div>
            {rows.map((r) => (
              <div key={r.user_id} className="trow">
                <div className="muted">{r.user_id}</div>
                <div>{r.full_name || "-"}</div>
                <div>{r.is_admin ? "بله" : "خیر"}</div>
                <div>{r.is_blocked ? "بله" : "خیر"}</div>
                <div className="row gap8">
                  <button className="btn" onClick={() => toggleAdmin(r.user_id, r.is_admin)}>
                    {r.is_admin ? "حذف ادمین" : "ادمین کن"}
                  </button>
                  <button className="btn" onClick={() => toggleBlock(r.user_id, r.is_blocked)}>
                    {r.is_blocked ? "آزاد" : "بلاک"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}