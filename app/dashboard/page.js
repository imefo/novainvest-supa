cat > app/dashboard/page.js <<'EOF'
'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard(){
  const router = useRouter()
  const [plans,setPlans] = useState([])
  const [loading,setLoading] = useState(true)
  const fmt = useMemo(()=>new Intl.NumberFormat('fa-IR'),[])

  useEffect(()=>{
    ;(async()=>{
      const { data:{ user } } = await supabase.auth.getUser()
      if(!user) return router.replace('/login')
      const { data } = await supabase.from('plans').select('*').eq('is_active',true)
      setPlans(data||[])
      setLoading(false)
    })()
  },[router])

  return (
    <main className="container" style={{marginTop:18}}>
      <div className="card">
        <h1>داشبورد</h1>
        <Link className="btn" href="/plans">مشاهده همه پلن‌ها</Link>
      </div>
      <section style={{marginTop:12}}>
        <h2>پلن‌های پیشنهادی</h2>
        <div className="grid grid-3" style={{gap:10}}>
          {loading && <div className="card">در حال بارگذاری…</div>}
          {!loading && plans.map(p=>(
            <div className="card" key={p.id}>
              <strong>{p.name}</strong>
              <div className="pill">{p.profit_percent}% / ماه</div>
              <Link className="btn" href={`/plans/${p.id}`}>جزئیات</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
EOF