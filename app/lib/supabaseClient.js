import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required. Check NEXT_PUBLIC_SUPABASE_URL in .env.local')
}
if (!supabaseAnonKey) {
  throw new Error('supabaseAnonKey is required. Check NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  global: { fetch: typeof fetch === 'function' ? fetch : undefined },
  headers: { 'X-Client-Info': 'novainvest-app' },
})
