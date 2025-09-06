// lib/role.js
import { supabase } from "./supabaseClient";

/** گرفتن یوزر فعلی (nullable) */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}

/** چک ادمین با جدول profiles.is_admin */
export async function checkIsAdmin(uid) {
  if (!uid) return { isAdmin: false };
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", uid)
    .single();
  return { isAdmin: !!data?.is_admin, error };
}

/** سازگاری با ایمپورت‌های قدیمی: isAdmin(uid) -> boolean */
export async function isAdmin(uid) {
  // سعی کن از RPC استفاده کنی اگر تابع is_admin در DB تعریف شده
  const { data, error } = await supabase.rpc("is_admin", { uid });
  if (!error && typeof data === "boolean") return data;

  // اگر RPC نبود/خطا داد، از profiles چک کن
  const { isAdmin } = await checkIsAdmin(uid);
  return isAdmin;
}