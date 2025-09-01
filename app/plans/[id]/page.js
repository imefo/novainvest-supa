'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient'

export default function PlanDetails(){
  const { id } = useParams()
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    if (!id) return
    supabase.from('plans').select('*').eq('id', id).maybeSingle().then(({data})=>{
      setPlan(data || null)
    })
  }, [id])

  if (!plan) return <main className="container">در حال بارگذاری…</main>

  return (
    <main className="container">
      <h1>{plan.title}</h1>
      <p style={{opacity:.8}}>{plan.description || '—'}</p>
      <div className="grid" style={{marginTop:16}}>
        <div className="card">حداقل سرمایه: ${plan.min_invest}</div>
        <div className="card">مدت: {plan.duration_months} ماه</div>
        <div className="card">نرخ سود: {plan.profit_percent}%</div>
      </div>
      <div style={{marginTop:16}}>
        <Link className="button" href="/plans">بازگشت به لیست پلن‌ها</Link>
      </div>
    </main>
  )
}