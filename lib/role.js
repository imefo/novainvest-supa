// lib/role.js
import { supabase } from "./supabaseClient";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}

export async function checkIsAdmin(uid) {
  if (!uid) return { isAdmin: false };
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", uid)
    .single();
  return { isAdmin: !!data?.is_admin, error };
}