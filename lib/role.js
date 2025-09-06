"use client";

import { supabase } from "./supabaseClient";

/** دریافت یوزرِ جلسه‌ی جاری (اختیاری: کمی صبر برای پایدار شدن سشن) */
export async function getSessionUser(waitMs) {
  if (waitMs && Number(waitMs) > 0) {
    await new Promise((r) => setTimeout(r, Number(waitMs)));
  }
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user ?? null;
}

/** چک سریع ادمین: اول RPC is_admin؛ اگر نبود از profiles.is_admin می‌خوانیم */
export async function isAdminFast(userId) {
  if (!userId) return false;

  // 1) تلاش از طریق فانکشن دیتابیس
  try {
    const { data, error } = await supabase.rpc("is_admin", { uid: userId });
    if (!error && typeof data === "boolean") return data;
  } catch (_) {}

  // 2) fallback از جدول profiles
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return false;
    return !!data.is_admin;
  } catch (_) {
    return false;
  }
}

/** کمک‌کار: مستقیم چک کن آیا یوزر فعلی ادمین است */
export async function isCurrentUserAdmin(waitMs) {
  const user = await getSessionUser(waitMs);
  return user ? isAdminFast(user.id) : false;
}