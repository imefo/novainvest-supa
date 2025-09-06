// lib/role.js
"use client";
import { supabase } from "./supabaseClient";

/** دریافت سشنِ فعلی (کلاینت) */
export async function getSessionUser() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user ?? null;
  } catch (e) {
    console.error("getSessionUser error:", e);
    return null;
  }
}

/** چک ادمین با RPC و در صورت نبود، fallback به profiles.is_admin */
export async function isAdminFast(userId) {
  try {
    if (!userId) return false;
    // 1) تلاش با RPC
    const { data: rpc, error: rpcErr } = await supabase.rpc("is_admin", { uid: userId });
    if (!rpcErr && typeof rpc === "boolean") return rpc;

    // 2) fallback: خواندن از profiles
    const { data: prof, error: pErr } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .maybeSingle();

    if (!pErr && prof && typeof prof.is_admin === "boolean") return prof.is_admin;
    return false;
  } catch (e) {
    console.error("isAdminFast error:", e);
    return false;
  }
}