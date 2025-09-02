// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // کمک به دیباگ در محیط dev (در پروداکشن لاگ نمی‌گیریم)
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

export const supabase = createClient(url, key);