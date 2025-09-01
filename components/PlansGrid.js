// components/PlansGrid.jsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PlansGrid({ limit = 6, showTitle = true, showControls = true }){
  const [plans, setPlans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [user, setUser]       = useState(null)
  const [sortBy, setSortBy]   = useState('new')      // new | profit | min
  const [risk, setRisk]       = useState('all')      // all | safe | risky

  const fmt = useMemo(() => new Intl.NumberFormat('fa-IR'), [])

  useEffect(() => {
    (async ()=>{
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)
    })()
  }, [])

  // fetch plans from Supabase
  useEffect(() => {
    let mounted = true
    ;(async ()=>{
      setError(''); setLoading(true)
      let q = supabase
        .from('plans')
        .select('id,name,description,min_invest,profit_percent,duration_months,is_active,risk_level,created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (!mounted) return
      if (error) { setError(error.message || 'خطا در بارگذاری پلن‌ها'); setPlans([]) }
      else { setPlans(data || []) }
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [limit])

  // inject styles once
  useEffect(() => {
    if (document.getElementById('nv-reveal')) return
    const s = document.createElement('style')
    s.id = 'nv-reveal'
    s.innerHTML = `
      .rv{opacity:0; transform:translateY(14px); transition:opacity .5s ease, transform .5s ease}
      .rv-in{opacity:1; transform:none}
      .plan-card{ transition: transform .18s ease, box-shadow .18s ease }
      .plan-card:hover{ transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0,0,0,.28); }
      .plan-head h3{ letter-spacing: -.2px }
      .cta-row{ display:flex; gap:8px; flex-wrap:wrap }
      .cta-row .btn{ flex:1; min-width: 160px }
      .tabs{ display:flex; gap:8px; flex-wrap:wrap }
      .tab{ padding:8px 12px; border:1px solid var(--border); border-radius:999px; background:#0f0f18; cursor:pointer }
      .tab.active{ background: var(--primary); color: var(--primary-contrast); border-color: color-mix(in oklab, var(--primary) 70%, #fff 30%); }
      .badge-risk{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; border:1px solid var(--border); font-size:12px }
      .badge-safe{ background: rgba(60,200,120,.12); }
      .badge-risky{ background: rgba(255,90,90,.12); }
    `
    document.head.appendChild(s)
  }, [])

  // reveal IO
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('rv-in')
          io.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
    nodes.forEach(n => { if (!n.classList.contains('rv')) n.classList.add('rv'); io.observe(n) })
    return () => io.disconnect()
  }, [plans, loading, sortBy, risk])

  // risk filter + sorting in-memory
  const filtered = useMemo(() => {
    if (risk === 'all') return plans
    return plans.filter(p => (p.risk_level || 'safe') === risk)
  }, [plans, risk])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sortBy) {
      case 'profit': arr.sort((a,b) => num(b.profit_percent) - num(a.profit_percent)); break
      case 'min':    arr.sort((a,b) => num(a.min_invest) - num(b.min_invest)); break
      default:       arr.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return arr
  }, [filtered, sortBy])

  const investHref = user ? '/dashboard' : '/login'

  return (
    <section className="container" style={{marginTop:28, marginBottom:24}}>
      {(showTitle || showControls) && (
        <div style={headRow}>
          {showTitle && (
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>پلن‌های فعال</h2>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                دسته‌بندی: امن و پرریسک — به‌همراه مرتب‌سازی
              </p>
            </div>
          )}

          {showControls && (
            <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', justifyContent:'flex-end'}}>
              <div className="tabs">
                <button className={`tab ${risk==='all'?'active':''}`}   onClick={()=>setRisk('all')}>همه</button>
                <button className={`tab ${risk==='safe'?'active':''}`}  onClick={()=>setRisk('safe')}>پلن‌های امن</button>
                <button className={`tab ${risk==='risky'?'active':''}`} onClick={()=>setRisk('risky')}>پروژه‌های پرریسک</button>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <label className="muted" htmlFor="sort" style={{fontSize:13}}>مرتب‌سازی:</label>
                <select id="sort" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={select}>
                  <option value="new">جدیدترین</option>
                  <option value="profit">بیشترین سود</option>
                  <option value="min">کمترین حداقل سرمایه</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="card" style={{borderColor:'rgba(255,0,0,.25)'}}>
          <strong>خطا:</strong> {error}
        </div>
      )}

      <div className="grid grid-3" style={{gap:12}}>
        {loading && Array.from({length: limit || 6}).map((_,i)=> <PlanSkeleton key={`sk-${i}`} />)}

        {!loading && sorted.map((p) => {
          const minInvest   = safeNum(p.min_invest)
          const profit      = safeNum(p.profit_percent)
          const months      = safeNum(p.duration_months)
          const rl          = (p.risk_level || 'safe')

          return (
            <article key={p.id} className="card plan-card rv" data-reveal style={planCard}>
              <header className="plan-head" style={planHead}>
                <h3 style={{margin:0, fontSize:18, fontWeight:900}}>{p.name}</h3>
                <span className="pill">{profit}% / ماه</span>
              </header>

              <div style={{display:'flex', gap:8, alignItems:'center', marginTop:6}}>
                <span className={`badge-risk ${rl === 'safe' ? 'badge-safe' : 'badge-risky'}`}>
                  {rl === 'safe' ? 'امن' : 'پرریسک'}
                </span>
              </div>

              {p.description && (
                <p className="muted" style={{whiteSpace:'pre-wrap', marginTop:6}}>
                  {p.description}
                </p>
              )}

              <div className="grid grid-3" style={{gap:8, marginTop:10}}>
                <div className="pill">حداقل: {fmt.format(minInvest)} USDT</div>
                <div className="pill">مدت: {months} ماه</div>
                <div className="pill">{p.is_active ? 'فعال' : 'غیرفعال'}</div>
              </div>

              <div className="cta-row" style={{marginTop:12}}>
                <a className="btn" href={`/plans/${encodeURIComponent(p.id)}`}>جزئیات بیشتر</a>
                <a className="btn primary" href={investHref}>شروع سرمایه‌گذاری</a>
              </div>
            </article>
          )
        })}

        {!loading && !error && sorted.length === 0 && (
          <div className="card rv" data-reveal>
            <p className="muted" style={{margin:0}}>موردی در این دسته‌بندی پیدا نشد.</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* ==== Helpers & Styles ==== */
function num(v){ const n = Number(v); return Number.isFinite(n) ? n : 0 }
function safeNum(v){ return Number.isFinite(Number(v)) ? Number(v) : 0 }

function PlanSkeleton(){
  return (
    <div className="card rv" data-reveal style={{height:180, display:'grid', gap:8}}>
      <div style={sk(70)} />
      <div style={sk(50)} />
      <div style={{display:'flex', gap:8}}>
        <div style={sk(80)} /><div style={sk(60)} /><div style={sk(50)} />
      </div>
      <div style={{display:'flex', gap:8}}>
        <div style={sk(100)} /><div style={sk(80)} />
      </div>
    </div>
  )
}
const sk = (w) => ({
  height:10, width: typeof w==='number' ? `${w}%` : w, borderRadius:8,
  background:'linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.02), rgba(255,255,255,.06))',
  animation:'sh 1.2s infinite'
})

const headRow = { display:'flex', justifyContent:'space-between', alignItems:'end', gap:10, flexWrap:'wrap', marginBottom:10 }
const select = {
  background: 'rgba(10,10,18,.65)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '8px 10px',
  outline: 'none'
}
const planCard = { display:'flex', flexDirection:'column' }
const planHead = { display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }