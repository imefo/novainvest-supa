// lib/role.js
"use client";
import { supabase } from "./supabaseClient";

/** گرفتن یوزر جاری بدون گیر */
export async function getSessionUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user ?? null;
  } catch {
    return null;
  }
}

/** چک سریع ادمین: از profiles.is_admin (یا RPC اگر داشتی) */
export async function isAdminFast(userId) {
  if (!userId) return false;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return false;
    return !!data?.is_admin;
  } catch {
    return false;
  }
}

/** خروج */
export async function signOut() {
  try { await supabase.auth.signOut(); } catch {}
}