'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPlansPage(){
  const [status, setStatus] = useState('loading')
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState({
    id: null, name:'', description:'', rules:'',
    min_invest:'', profit_percent:'', duration_months:'', is_active:true
  })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: prof, error } = await supabase
        .from('profiles').select('is_admin').eq('user_id', user.id).single()
      if (error || !prof?.is_admin) { window.location.href = '/dashboard'; return }
      setStatus('ok')
      await loadPlans()
    })()
  }, [])

  async function loadPlans(){
    const { data, error } = await supabase.from('plans').select('*').order('created_at', { ascending: false })
    if (error) setMsg(error.message); else setPlans(data || [])
  }

  function resetForm(){ setForm({ id:null,name:'',description:'',rules:'',min_invest:'',profit_percent:'',duration_months:'',is_active:true }) }
  function editPlan(p){
    setForm({
      id:p.id, name:p.name||'', description:p.description||'', rules:p.rules||'',
      min_invest:String(p.min_invest??''), profit_percent:String(p.profit_percent??''),
      duration_months:String(p.duration_months??''), is_active:!!p.is_active
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function savePlan(e){
    e.preventDefault(); setMsg('در حال ذخیره...')
    const min_invest = Number(form.min_invest)
    const profit_percent = Number(form.profit_percent)
    const duration_months = parseInt(form.duration_months, 10)
    const payload = {
      name: (form.name||'').trim(),
      description: (form.description||'').trim() || null,
      rules: (form.rules||'').trim() || null,
      min_invest, profit_percent, duration_months, is_active: !!form.is_active,
    }
    if (!payload.name) return setMsg('نام پلن الزامی است')
    if (!Number.isFinite(min_invest) || min_invest<=0) return setMsg('حداقل سرمایه باید > 0 باشد')
    if (!Number.isFinite(profit_percent) || profit_percent<0) return setMsg('درصد سود معتبر نیست')
    if (!Number.isFinite(duration_months) || duration_months<=0) return setMsg('مدت (ماه) معتبر نیست')

    let error
    if (form.id){ ({ error } = await supabase.from('plans').update(payload).eq('id', form.id)) }
    else { ({ error } = await supabase.from('plans').insert(payload)) }
    if (error) setMsg('خطا: '+error.message); else { setMsg('ذخیره شد ✅'); resetForm(); await loadPlans() }
  }

  async function removePlan(id){
    if (!confirm('حذف این پلن قطعی است؟')) return
    const { error } = await supabase.from('plans').delete().eq('id', id)
    if (error) setMsg('خطا: '+error.message); else { setMsg('حذف شد ✅'); await loadPlans() }
  }

  if (status !== 'ok') return <main className="container"><p>در حال بررسی دسترسی…</p></main>

  return (
    <main className="container">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <h1>مدیریت پلن‌ها</h1>
        <div style={{display:'flex',gap:8}}>
          <a className="btn" href="/admin">بازگشت به ادمین</a>
          <a className="btn" href="/plans">مشاهده پلن‌ها</a>
        </div>
      </header>

      <form className="card" onSubmit={savePlan} style={{marginTop:12}}>
        <h3>{form.id ? 'ویرایش پلن' : 'ایجاد پلن جدید'}</h3>
        <div className="grid grid-2" style={{gap:8}}>
          <input placeholder="نام پلن" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input type="number" step="0.01" placeholder="حداقل سرمایه" value={form.min_invest} onChange={e=>setForm(f=>({...f,min_invest:e.target.value}))}/>
          <input type="number" step="0.01" placeholder="درصد سود ماهانه" value={form.profit_percent} onChange={e=>setForm(f=>({...f,profit_percent:e.target.value}))}/>
          <input type="number" placeholder="مدت (ماه)" value={form.duration_months} onChange={e=>setForm(f=>({...f,duration_months:e.target.value}))}/>
        </div>
        <textarea placeholder="توضیحات پلن" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
        <textarea placeholder="قوانین پلن" rows={3} value={form.rules} onChange={e=>setForm(f=>({...f,rules:e.target.value}))}/>
        <label style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:6}}>
          <input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
          فعال باشد
        </label>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button className="btn primary" type="submit">{form.id ? 'ذخیره تغییرات' : 'ایجاد پلن'}</button>
          {form.id && <button type="button" className="btn" onClick={resetForm}>انصراف/جدید</button>}
        </div>
        <p className="muted" style={{marginTop:8}}>{msg}</p>
      </form>

      <section style={{marginTop:16}}>
        <h3>فهرست پلن‌ها</h3>
        <div className="grid grid-2" style={{gap:12}}>
          {plans.map(p=>(
            <div key={p.id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h4>{p.name}</h4>
                <span className="muted">{p.is_active ? 'فعال' : 'غیرفعال'}</span>
              </div>
              <p style={{whiteSpace:'pre-wrap'}}>{p.description || '—'}</p>
              {p.rules && <details style={{marginTop:6}}><summary>قوانین</summary><pre style={{whiteSpace:'pre-wrap'}}>{p.rules}</pre></details>}
              <div className="grid grid-3" style={{marginTop:8}}>
                <div className="pill">حداقل سرمایه: {p.min_invest}</div>
                <div className="pill">سود ماهانه: {p.profit_percent}%</div>
                <div className="pill">مدت: {p.duration_months} ماه</div>
              </div>
              <div style={{display:'flex',gap:8,marginTop:10}}>
                <button className="btn" onClick={()=>editPlan(p)}>ویرایش</button>
                <button className="btn danger" onClick={()=>removePlan(p.id)}>حذف</button>
              </div>
            </div>
          ))}
          {plans.length===0 && <p className="muted">هنوز پلنی ثبت نشده.</p>}
        </div>
      </section>
    </main>
  )
}