'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPlans() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState('')
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState({ title:'', description:'', min_invest:100, profit_percent:12, duration_months:1 })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return router.replace('/login')
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single()
        if (error) throw error
        if (!data?.is_admin) return router.replace('/dashboard')
        const { data: pl, error: e2 } = await supabase.from('plans').select('*').order('created_at', { ascending:false })
        if (e2) throw e2
        if (mounted) { setPlans(pl || []); setReady(true) }
      } catch (e) {
        if (mounted) setErr(e.message || 'خطا')
      }
    })()
    return () => { mounted = false }
  }, [router])

  const onSubmit = async e => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.from('plans').insert({
        title: form.title,
        description: form.description,
        min_invest: Number(form.min_invest),
        profit_percent: Number(form.profit_percent),
        duration_months: Number(form.duration_months)
      }).select().single()
      if (error) throw error
      setPlans(p => [data, ...p])
      setForm({ title:'', description:'', min_invest:100, profit_percent:12, duration_months:1 })
    } catch (e) { setErr(e.message) }
  }

  if (err) return <main className="container"><p className="error">خطا: {err}</p></main>
  if (!ready) return <main className="container"><p>در حال بارگذاری…</p></main>

  return (
    <main className="container">
      <h1>مدیریت پلن‌ها</h1>

      <form onSubmit={onSubmit} className="card" style={{maxWidth:720}}>
        <div className="grid2">
          <label>نام پلن
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
          </label>
          <label>حداقل سرمایه ($)
            <input type="number" min="1" value={form.min_invest} onChange={e=>setForm({...form, min_invest:e.target.value})} required />
          </label>
          <label>درصد سود ماهانه (%)
            <input type="number" min="0" value={form.profit_percent} onChange={e=>setForm({...form, profit_percent:e.target.value})} required />
          </label>
          <label>مدت (ماه)
            <input type="number" min="1" value={form.duration_months} onChange={e=>setForm({...form, duration_months:e.target.value})} required />
          </label>
        </div>
        <label>توضیحات
          <textarea rows={4} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        </label>
        <button type="submit">افزودن پلن</button>
      </form>

      <h2 style={{marginTop:24}}>فهرست پلن‌ها</h2>
      <div className="grid3">
        {plans.map(p=>(
          <div className="card" key={p.id}>
            <h3>{p.title}</h3>
            <p style={{opacity:.8}}>{p.description}</p>
            <ul className="list" style={{fontSize:14,opacity:.9}}>
              <li>حداقل سرمایه: ${p.min_invest}</li>
              <li>سود ماهانه: {p.profit_percent}%</li>
              <li>مدت: {p.duration_months} ماه</li>
            </ul>
            <Link href={`/plans/${p.id}`} className="btn">مشاهده</Link>
          </div>
        ))}
      </div>
      <p style={{marginTop:24}}><Link href="/admin">بازگشت به ادمین</Link></p>
    </main>
  )
}