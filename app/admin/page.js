'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'

export default function AdminPage(){
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data?.user
      if (!user) return router.replace('/login?redirect=/admin')
      const { data: profile } = await supabase.from('profiles')
        .select('is_admin').eq('user_id', user.id).maybeSingle()
      if (!profile?.is_admin) return router.replace('/dashboard')
      setOk(true)
    })
  }, [router])

  if (!ok) return <div className="container">در حال بررسی دسترسی…</div>

  return (
    <main className="container">
      <h1>پنل ادمین</h1>
      <div style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
        <Link href="/admin/plans" className="button">مدیریت پلن‌ها</Link>
        <Link href="/dashboard" className="button ghost">رفتن به داشبورد</Link>
        <Link href="/plans" className="button ghost">نمایش پلن‌ها</Link>
      </div>
    </main>
  )
}