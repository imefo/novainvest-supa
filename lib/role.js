// lib/role.js
// نقش کاربر و چک ادمین

import { supabase } from "./supabaseClient";

/** چک ادمین از طریق RPC و در صورت نیاز فال‌بک به profiles.is_admin */
export async function isAdmin(userId) {
  if (!userId) return false;

  // تلاش اول: RPC
  const { data, error } = await supabase.rpc("is_admin", { uid: userId });
  if (!error && typeof data === "boolean") return data;

  // فال‌بک: از جدول profiles
  const { data: prof } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(prof?.is_admin);
}

/** دریافت نقش متنی */
export async function getUserRole(userId) {
  return (await isAdmin(userId)) ? "admin" : "user";
}

/** کمکی: برگرداندن آبجکت نقش */
export async function getRoleInfo(userId) {
  const admin = await isAdmin(userId);
  return {
    isAdmin: admin,
    role: admin ? "admin" : "user",
  };
}