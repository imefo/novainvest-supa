// lib/role.js
// نقش‌ها و پروفایل کاربر – توابع ساده و بدون وابستگی به React/Next hooks

import { supabase } from "./supabaseClient";

/**
 * پروفایل کاربر را از جدول public.profiles می‌خواند.
 * ستون‌های حداقل: id (uuid, PK, برابر با auth.users.id) ، full_name (اختیاری) ، is_admin (boolean).
 */
export async function getProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("getProfile error:", error.message);
    return null;
  }
  return data;
}

/**
 * بررسی ادمین بودن کاربر (بر اساس ستون is_admin در profiles)
 */
export async function isAdmin(userId) {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("isAdmin error:", error.message);
    return false;
  }
  return data?.is_admin === true;
}

/**
 * گرفتن کاربر فعلی از supabase.auth و بازگرداندن اطلاعات پایه + ادمین بودن.
 * برای استفاده در کلاینت یا سرور (Route handlers/Server Actions) مناسب است.
 */
export async function getCurrentUserWithRole() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("getCurrentUserWithRole auth error:", error.message);
    return { user: null, isAdmin: false, profile: null };
  }
  if (!user) return { user: null, isAdmin: false, profile: null };

  const profile = await getProfile(user.id);
  const admin = profile?.is_admin === true;

  return { user, isAdmin: admin, profile };
}

/**
 * کمک‌تابع کمکی: اگر کاربر ادمین نبود false می‌دهد؛
 * اگر بود true. مناسب برای گِیت ساده قبل از رندر صفحات ادمین.
 */
export async function allowOnlyAdmin(userId) {
  return await isAdmin(userId);
}
// lib/role.js
import { supabase } from "./supabaseClient";

/** چک سریع ادمین: اول RPC is_admin(uid)؛ اگر نبود، از profiles.is_admin می‌خوانیم */
export async function isAdminFast(userId) {
  if (!userId) return false;

  // 1) تلاش با RPC (اگر ساخته‌ای)
  try {
    const { data, error } = await supabase.rpc("is_admin", { uid: userId });
    if (!error && typeof data === "boolean") {
      return data === true;
    }
  } catch (_) {}

  // 2) fallback: از جدول profiles بخوان
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .maybeSingle();
    if (!error) return !!data?.is_admin;
  } catch (_) {}

  return false;
}