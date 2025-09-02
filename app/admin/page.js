'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function AdminPage() {
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return router.replace('/login')
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single()
        if (error) throw error
        if (!data?.is_admin) return router.replace('/dashboard')
        if (mounted) setOk(true)
      } catch (e) {
        if (mounted) setErr(e.message || 'خطا')
      }
    })()
    return () => { mounted = false }
  }, [router])

  if (err) return <main className="container"><p className="error">خطا: {err}</p></main>
  if (!ok) return <main className="container"><p>در حال بارگذاری…</p></main>

  return (
    <main className="container">
      <h1>مدیریت نوااینوست</h1>
      <ul className="list">
        <li><Link href="/admin/plans">مدیریت پلن‌ها</Link></li>
        <li><Link href="/dashboard">بازگشت به داشبورد</Link></li>
      </ul>
    </main>
  )
}