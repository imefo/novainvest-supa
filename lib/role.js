// lib/role.js
// تنها یک ایمپورت از supabase داشته باش؛ هیچ const supabase دیگری در این فایل نساز.
import { supabase } from "./supabaseClient";

/** چک سریع ادمین: ابتدا RPC `is_admin(uid)`؛ در صورت عدم وجود/خطا، از جدول profiles می‌خوانیم. */
export async function isAdminFast(userId) {
  if (!userId) return false;

  // 1) تلاش برای RPC
  try {
    const { data, error } = await supabase.rpc("is_admin", { uid: userId });
    if (!error && typeof data === "boolean") return data;
  } catch {
    // نادیده بگیر؛ fallback را ادامه بده
  }

  // 2) fallback از جدول profiles (ستون‌های: user_id, is_admin)
  const { data: row } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();

  return !!row?.is_admin;
}

/** اگر سشن فعلی ادمین باشد true برمی‌گرداند (برای هدر/گاردها مفید است). */
export async function isCurrentUserAdmin() {
  const { data } = await supabase.auth.getSession();
  const uid = data?.session?.user?.id;
  if (!uid) return false;
  return isAdminFast(uid);
}