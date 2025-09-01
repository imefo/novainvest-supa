cat > app/plans/[id]/page.js <<'EOF'
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function PlanDetails(){
  const { id } = useParams()
  const [plan,setPlan] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')

  useEffect(()=>{
    if(!id) return
    ;(async()=>{
      try{
        const { data, error } = await supabase.from('plans').select('*').eq('id',id).maybeSingle()
        if (error) throw error
        setPlan(data||null)
      }catch(err){ setError(err?.message||'خطا') }
      finally{ setLoading(false) }
    })()
  },[id])

  if(loading) return <main className="container"><div className="card">در حال بارگذاری…</div></main>
  if(error)   return <main className="container"><div className="card">خطا: {error}</div></main>
  if(!plan)   return <main className="container"><div className="card">پلن پیدا نشد</div></main>

  return (
    <main className="container" style={{marginTop:18}}>
      <div className="card">
        <h1>{plan.name}</h1>
        {plan.description && <p className="muted">{plan.description}</p>}
        <div className="grid grid-3" style={{gap:6}}>
          <span className="pill">حداقل: {Number(plan.min_invest||0)} USDT</span>
          <span className="pill">مدت: {Number(plan.duration_months||0)} ماه</span>
          <span className="pill">{Number(plan.profit_percent||0)}% / ماه</span>
        </div>
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <Link className="btn" href="/plans">بازگشت</Link>
          <Link className="btn primary" href="/login">شروع سرمایه‌گذاری</Link>
        </div>
      </div>
    </main>
  )
}
EOF