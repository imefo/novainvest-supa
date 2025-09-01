cat > app/plans/page.js <<'EOF'
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function PlansPage(){
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    ;(async()=>{
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending:false })
      setPlans(error ? [] : (data || []))
      setLoading(false)
    })()
  },[])

  return (
    <main className="container" style={{marginTop:18}}>
      <div className="card">
        <h1 style={{margin:0}}>پلن‌ها</h1>
      </div>

      {loading && <div className="card" style={{marginTop:12}}>در حال بارگذاری…</div>}

      {!loading && (
        <div className="grid grid-3" style={{gap:10, marginTop:12}}>
          {plans.map(p=>(
            <div className="card" key={p.id} style={{display:'grid', gap:8}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <strong>{p.name}</strong>
                <span className="pill">{Number(p.profit_percent||0)}% / ماه</span>
              </div>
              <div className="grid grid-3" style={{gap:6}}>
                <span className="pill">حداقل: {Number(p.min_invest||0)} USDT</span>
                <span className="pill">مدت: {Number(p.duration_months||0)} ماه</span>
                <span className="pill">{(p.risk_level||'safe')==='risky'?'پرریسک':'امن'}</span>
              </div>
              <Link className="btn" href={`/plans/${encodeURIComponent(p.id)}`}>جزئیات</Link>
            </div>
          ))}
          {plans.length===0 && <div className="card">فعلاً پلن فعالی نیست.</div>}
        </div>
      )}
    </main>
  )
}
EOF