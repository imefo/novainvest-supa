// lib/role.js
import { supabase } from "@/lib/supabaseClient";

/**
 * هوشمند: اگر user_metadata.role = 'admin' بود، فوری true.
 * اگر نبود، در جداول users و profiles، role یا is_admin را چک می‌کنیم.
 */
export async function isAdmin(user) {
  if (!user) return false;

  // 1) متادیتا
  const metaRole = user.user_metadata?.role;
  if (metaRole && String(metaRole).toLowerCase() === "admin") return true;

  // 2) جداولی که ممکن است داشته باشی
  const tables = [
    { name: "users", roleCol: "role", boolCol: "is_admin" },
    { name: "profiles", roleCol: "role", boolCol: "is_admin" },
  ];

  for (const t of tables) {
    const { data, error } = await supabase
      .from(t.name)
      .select(`${t.roleCol}, ${t.boolCol}`)
      .eq("id", user.id)
      .maybeSingle();

    // اگر جدول/ستون نبود، ادامه می‌دهیم
    if (error && !String(error.message).toLowerCase().includes("does not exist")) continue;

    if (data) {
      if (data[t.boolCol] === true) return true;
      if (data[t.roleCol] && String(data[t.roleCol]).toLowerCase() === "admin") return true;
    }
  }

  return false;
}