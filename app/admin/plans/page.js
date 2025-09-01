'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabaseClient'

export default function PlansPage(){
  const [plans, setPlans] = useState([])

  useEffect(() => {
    supabase.from('plans').select('*').order('created_at',{ascending:false}).then(({data})=>{
      setPlans(data || [])
    })
  }, [])

  return (
    <main className="container">
      <h1>پلن‌ها</h1>
      <div className="list">
        {plans.map(pl=>(
          <div key={pl.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
            <div>
              <h3 style={{margin:'0 0 8px'}}>{pl.title}</h3>
              <p style={{margin:0,opacity:.8}}>{pl.description || '—'}</p>
            </div>
            <div style={{textAlign:'end'}}>
              <div>حداقل: ${pl.min_invest}</div>
              <div>مدت: {pl.duration_months} ماه</div>
              <div>سود: {pl.profit_percent}%</div>
              <Link className="button small" href={`/plans/${pl.id}`}>جزئیات</Link>
            </div>
          </div>
        ))}
        {!plans.length && <p>پلنی پیدا نشد.</p>}
      </div>
    </main>
  )
}