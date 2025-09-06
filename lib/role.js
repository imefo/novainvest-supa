// lib/role.js
import { supabase } from "./supabaseClient";

export async function getSessionUser(timeoutMs = 4000) {
  const withTimeout = new Promise((_, rej) =>
    setTimeout(() => rej(new Error("auth-timeout")), timeoutMs)
  );
  const req = (async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user ?? null;
  })();
  try {
    return await Promise.race([req, withTimeout]);
  } catch {
    return null;
  }
}

/** چک ادمین: ابتدا RPC is_admin(uid)؛ در غیراینصورت از profiles.is_admin می‌خوانیم */
export async function isAdminFast(userId, timeoutMs = 3500) {
  if (!userId) return false;

  // 1) RPC
  try {
    const withTimeout = new Promise((_, rej) =>
      setTimeout(() => rej(new Error("rpc-timeout")), timeoutMs)
    );
    const req = (async () => {
      const { data, error } = await supabase.rpc("is_admin", { uid: userId });
      if (!error && typeof data === "boolean") return data;
      return null;
    })();
    const res = await Promise.race([req, withTimeout]);
    if (typeof res === "boolean") return res;
  } catch {}

  // 2) fallback: profiles
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .maybeSingle();
    if (!error) return !!data?.is_admin;
  } catch {}

  return false;
}