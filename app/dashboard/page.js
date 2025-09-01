'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'

export default function Dashboard(){
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.replace('/login?redirect=/dashboard')
      const { data } = await supabase.from('profiles').select('is_admin, full_name').eq('user_id', user.id).maybeSingle()
      setProfile(data || null)
      setOk(true)
    })()
  }, [router])

  if (!ok) return <div className="container">در حال بارگذاری داشبورد…</div>

  return (
    <main className="container">
      <h1>داشبورد</h1>
      <p>خوش آمدید {profile?.full_name ? `، ${profile.full_name}` : ''}</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <Link className="button" href="/plans">رفتن به پلن‌ها</Link>
        {profile?.is_admin && <Link className="button ghost" href="/admin">رفتن به پنل ادمین</Link>}
      </div>
    </main>
  )
}