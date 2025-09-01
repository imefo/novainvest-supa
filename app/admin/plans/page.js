cat > app/admin/plans/page.js <<'EOF'
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPlans(){
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState({
    name:'', description:'', min_invest:'', profit_percent:'', duration_months:'', risk_level:'safe', is_active:true
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    ;(async()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.replace('/login')
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!profile?.is_admin) return router.replace('/dashboard')
      setOk(true)
    })()
  }, [router])

  useEffect(() => {
    if (!ok) return
    ;(async()=>{
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending:false })
      if (!error) setPlans(data || [])
    })()
  }, [ok])

  async function savePlan(e){
    e.preventDefault()
    setBusy(true); setMsg('')
    try{
      const payload = {
        name: form.name,
        description: form.description || null,
        min_invest: Number(form.min_invest || 0),
        profit_percent: Number(form.profit_percent || 0),
        duration_months: Number(form.duration_months || 0),
        risk_level: form.risk_level || 'safe',
        is_active: !!form.is_active
      }
      const { data, error } = await supabase.from('plans').insert(payload).select().single()
      if (error) throw error
      setPlans([data, ...plans])
      setForm({name:'',description:'',min_invest:'',profit_percent:'',duration_months:'',risk_level:'safe',is_active:true})
      setMsg('پلن جدید ذخیره شد ✔')
    }catch(err){
      setMsg(err?.message || 'خطا در ذخیره')
    }finally{
      setBusy(false)
    }
  }

  if (!ok) return <main className="container"><div className="card">در حال بررسی دسترسی…</div></main>

  return (
    <main className="container" style={{marginTop:18, marginBottom:24}}>
      <div className="card" style={{display:'grid', gap:12}}>
        <h1 style={{margin:0}}>مدیریت پلن‌ها</h1>

        <form onSubmit={savePlan} style={{display:'grid', gap:8}}>
          <div className="grid grid-3" style={{gap:8}}>
            <input placeholder="نام پلن" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            <input placeholder="حداقل سرمایه (USDT)" value={form.min_invest} onChange={e=>setForm({...form, min_invest:e.target.value})} required />
            <input placeholder="سود ماهانه (%)" value={form.profit_percent} onChange={e=>setForm({...form, profit_percent:e.target.value})} required />
            <input placeholder="مدت (ماه)" value={form.duration_months} onChange={e=>setForm({...form, duration_months:e.target.value})} required />
            <select value={form.risk_level} onChange={e=>setForm({...form, risk_level:e.target.value})}>
              <option value="safe">امن</option>
              <option value="risky">پرریسک</option>
            </select>
            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active:e.target.checked})} />
              فعال باشد
            </label>
          </div>
          <textarea placeholder="توضیحات" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className="btn primary" type="submit" disabled={busy}>{busy?'در حال ذخیره…':'ذخیره پلن'}</button>
            <Link className="btn" href="/plans">مشاهده صفحه پلن‌ها</Link>
          </div>
          {msg && <div className="muted">{msg}</div>}
        </form>

        <div className="grid grid-3" style={{gap:10}}>
          {plans.map(p=>(
            <div className="card" key={p.id}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <strong>{p.name}</strong>
                <span className="pill">{Number(p.profit_percent||0)}% / ماه</span>
              </div>
              <div className="grid grid-3" style={{gap:6, marginTop:6}}>
                <span className="pill">حداقل: {Number(p.min_invest||0)} USDT</span>
                <span className="pill">مدت: {Number(p.duration_months||0)} ماه</span>
                <span className="pill">{p.risk_level==='risky'?'پرریسک':'امن'}</span>
              </div>
              <div style={{marginTop:8}}>
                <Link className="btn" href={`/plans/${encodeURIComponent(p.id)}`}>جزئیات</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
EOF