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

  useEffect(()=>{
    if(!id) return
    ;(async()=>{
      const { data } = await supabase.from('plans').select('*').eq('id',id).maybeSingle()
      setPlan(data||null)
      setLoading(false)
    })()
  },[id])

  if(loading) return <main className="container"><div className="card">در حال بارگذاری…</div></main>
  if(!plan) return <main className="container"><div className="card">پلن پیدا نشد</div></main>

  return (
    <main className="container" style={{marginTop:18}}>
      <div className="card">
        <h1>{plan.name}</h1>
        <p>{plan.description}</p>
        <div className="pill">{plan.profit_percent}% / ماه</div>
        <Link className="btn" href="/plans">بازگشت</Link>
      </div>
    </main>
  )
}
EOF