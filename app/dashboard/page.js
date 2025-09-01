cat > app/dashboard/page.js <<'EOF'
'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard(){
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const fmt = useMemo(()=> new Intl.NumberFormat('fa-IR'), [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      if (!mounted) return
      setUser(user)

      const { data, error } = await supabase
        .from('plans')
        .select('id,name,min_invest,profit_percent,duration_months,risk_level,is_active,created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (!mounted) return
      setPlans(error ? [] : (data || []))
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [router])

  async function signOut(){
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <main className="container" style={{marginTop:18, marginBottom:24}}>
      <div className="card" style={{display:'grid', gap:10}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10}}>
          <div>
            <h1 style={{margin:0}}>داشبورد</h1>
            <p className="muted" style={{margin:'4px 0 0 0', fontSize:13}}>
              خوش آمدی {user?.email ? `— ${user.email}` : ''} ✨
            </p>
          </div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <Link className="btn" href="/plans">مشاهده پلن‌ها</Link>
            <button className="btn" onClick={signOut}>خروج</button>
          </div>
        </div>

        <div className="grid grid-3" style={{gap:10}}>
          <div className="card" style={{background:'rgba(255,255,255,.03)'}}>
            <div className="muted" style={{fontSize:12}}>موجودی کل (نمایشی)</div>
            <div style={{fontWeight:900, fontSize:20, marginTop:6}}>{fmt.format(0)} USDT</div>
          </div>
          <div className="card" style={{background:'rgba(255,255,255,.03)'}}>
            <div className="muted" style={{fontSize:12}}>پلن‌های فعال</div>
            <div style={{fontWeight:900, fontSize:20, marginTop:6}}>{plans.length}</div>
          </div>
          <div className="card" style={{background:'rgba(255,255,255,.03)'}}>
            <div className="muted" style={{fontSize:12}}>سود ماه جاری (نمایشی)</div>
            <div style={{fontWeight:900, fontSize:20, marginTop:6}}>{fmt.format(0)} USDT</div>
          </div>
        </div>
      </div>

      <section style={{marginTop:12}}>
        <h2 style={{margin:'6px 0'}}>پلن‌های پیشنهادی</h2>
        <div className="grid grid-3" style={{gap:10}}>
          {loading && <div className="card">در حال بارگذاری…</div>}
          {!loading && plans.length === 0 && (
            <div className="card"><span className="muted">فعلاً پلن فعالی موجود نیست.</span></div>
          )}
          {!loading && plans.map(p => (
            <div className="card" key={p.id} style={{display:'grid', gap:8}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <strong style={{fontWeight:800}}>{p.name}</strong>
                <span className="pill">{Number(p.profit_percent||0)}% / ماه</span>
              </div>
              <div className="grid grid-3" style={{gap:6}}>
                <span className="pill">حداقل: {fmt.format(Number(p.min_invest||0))} USDT</span>
                <span className="pill">مدت: {Number(p.duration_months||0)} ماه</span>
                <span className="pill">{(p.risk_level||'safe')==='risky' ? 'پرریسک' : 'امن'}</span>
              </div>
              <div style={{display:'flex', gap:8}}>
                <Link className="btn" href={`/plans/${encodeURIComponent(p.id)}`}>جزئیات</Link>
                <Link className="btn primary" href="/plans">شروع سرمایه‌گذاری</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
EOF