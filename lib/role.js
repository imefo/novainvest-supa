// lib/role.js
import { supabase } from "./supabaseClient";

export async function isAdmin(user) {
  if (!user) return false;

  // اول از متادیتا بخون
  if (user.user_metadata?.role === "admin") return true;

  // بعد از جدول users
  try {
    const { data: row } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (row?.is_admin) return true;
  } catch (_) {}

  // بعد از جدول profiles
  try {
    const { data: row } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (row?.role === "admin") return true;
  } catch (_) {}

  return false;
}