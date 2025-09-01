'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function PlanDetails(){
  const { id } = useParams()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if(!id) return
    ;(async ()=>{
      try{
        setError('')
        setLoading(true)
        const { data, error } = await supabase
          .from('plans')
          .select('id,name,description,min_invest,profit_percent,duration_months,is_active,created_at')
          .eq('id', id)
          .maybeSingle()
        if (error) throw error
        setPlan(data || null)
      }catch(err){
        setError(err?.message || 'خطا در دریافت پلن')
        setPlan(null)
      }finally{
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return (
    <main className="container" style={{marginTop:18}}>
      <div className="card">در حال بارگذاری…</div>
    </main>
  )
  if (error) return (
    <main className="container" style={{marginTop:18}}>
      <div className="card" style={{borderColor:'rgba(255,0,0,.25)'}}>خطا: {error}</div>
    </main>
  )
  if (!plan) return (
    <main className="container" style={{marginTop:18}}>
      <div className="card">پلن پیدا نشد.</div>
    </main>
  )

  const fmt = new Intl.NumberFormat('fa-IR')
  const minInvest = Number(plan.min_invest || 0)
  const profit = Number(plan.profit_percent || 0)
  const months = Number(plan.duration_months || 0)

  return (
    <main className="container" style={{marginTop:18, marginBottom:24}}>
      <div className="card" style={{display:'grid', gap:12}}>
        <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
          <h1 style={{margin:0, fontSize:24, fontWeight:900}}>{plan.name}</h1>
          <span className="pill">{profit}% / ماه</span>
        </header>

        {plan.description && (
          <p className="muted" style={{whiteSpace:'pre-wrap'}}>{plan.description}</p>
        )}

        <div className="grid grid-3" style={{gap:8}}>
          <div className="pill">حداقل سرمایه: {fmt.format(minInvest)} USDT</div>
          <div className="pill">مدت پلن: {months} ماه</div>
          <div className="pill">{plan.is_active ? 'فعال' : 'غیرفعال'}</div>
        </div>

        <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
          <a className="btn" href="/plans">بازگشت به لیست پلن‌ها</a>
          <a className="btn primary" href="/login">شروع سرمایه‌گذاری</a>
        </div>
      </div>
    </main>
  )
}