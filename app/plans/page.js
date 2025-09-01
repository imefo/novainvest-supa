'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error: e } = await supabase
          .from('plans')
          .select('id, title, description, min_invest, profit_percent, duration_months')
          .order('id', { ascending: true })
        if (e) throw e
        if (mounted) setPlans(data || [])
        setLoading(false)
      } catch (e) {
        setError('خطا در بارگذاری پلن‌ها')
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <main className="container"><p>در حال بارگذاری…</p></main>
  if (error)   return <main className="container"><p style={{color:'#f66'}}>{error}</p></main>

  return (
    <main className="container" style={{padding:'24px', display:'grid', gap:16}}>
      <h1 style={{fontSize:'22px'}}>پلن‌های سرمایه‌گذاری</h1>

      <div style={{display:'grid', gap:12}}>
        {plans.map(p => (
          <div key={p.id} className="card" style={{display:'grid', gap:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <strong>{p.title}</strong>
              <Link href={`/plans/${p.id}`} className="btn tiny">جزئیات</Link>
            </div>
            {p.description ? <p style={{opacity:.85}}>{p.description}</p> : null}
            <div style={{display:'flex', gap:16, opacity:.85, fontSize:14}}>
              <span>حداقل: ${p.min_invest}</span>
              <span>سود ماهانه: {p.profit_percent}%</span>
              <span>مدت: {p.duration_months} ماه</span>
            </div>
          </div>
        ))}
        {plans.length === 0 && <p>پلنی موجود نیست.</p>}
      </div>
    </main>
  )
}