cat > app/admin/page.js <<'EOF'
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function AdminPage(){
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    ;(async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.replace('/login')
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!profile?.is_admin) return router.replace('/dashboard')
      setOk(true)
    })()
  }, [router])

  if (!ok) return <main className="container"><div className="card">در حال بررسی دسترسی…</div></main>

  return (
    <main className="container" style={{marginTop:18}}>
      <div className="card" style={{display:'grid', gap:10}}>
        <h1 style={{margin:0}}>مدیریت NovaInvest</h1>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <Link className="btn" href="/admin/plans">مدیریت پلن‌ها</Link>
          <Link className="btn" href="/plans">مشاهده پلن‌ها</Link>
          <Link className="btn" href="/dashboard">رفتن به داشبورد کاربر</Link>
        </div>
      </div>
    </main>
  )
}
EOF