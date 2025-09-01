'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  // دیتاها
  const [userPlans, setUserPlans] = useState([])  // join plans + user_plans
  const [txAgg, setTxAgg] = useState({ deposit: 0, withdraw: 0, payout: 0 })
  const [modal, setModal] = useState({ open: false, amount: '' })

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      // لود پلن‌های کاربر (با جزئیات پلن)
      const { data: up } = await supabase
        .from('user_plans')
        .select(`
          id, amount, created_at,
          plans ( id, name, profit_percent, duration_months, min_invest, rules, description )
        `)
        .order('created_at', { ascending: false })

      setUserPlans(up || [])

      // مجموع تراکنش‌ها
      const types = ['deposit','withdraw','payout']
      const agg = { deposit: 0, withdraw: 0, payout: 0 }
      for (const t of types) {
        const { data: rows, error } = await supabase
          .from('transactions')
          .select('amount')
          .eq('type', t)
        if (!error && rows) agg[t] = rows.reduce((s,r)=> s + Number(r.amount||0), 0)
      }
      setTxAgg(agg)

      setLoading(false)
    })()
  }, [])

  // KPIها
  const kpis = useMemo(() => {
    const invested = userPlans.reduce((s, r) => s + Number(r.amount || 0), 0)
    const deposits = Number(txAgg.deposit || 0)
    const withdraws = Number(txAgg.withdraw || 0)
    const payouts = Number(txAgg.payout || 0)
    // موجودی کل (تقریبی MVP): واریزها + سود پرداخت شده − برداشت‌ها
    const portfolio = deposits + payouts - withdraws
    // سود کل تحقق‌یافته
    const realizedProfit = payouts
    const activePlans = userPlans.length
    return { portfolio, realizedProfit, activePlans, invested }
  }, [userPlans, txAgg])

  // Progress باقی‌مانده هر پلن بر اساس created_at + duration_months (تقریبی)
  function planProgressPercentage(up) {
    try {
      const months = Number(up?.plans?.duration_months)
      if (!Number.isFinite(months) || months <= 0) return 0
      const start = new Date(up.created_at).getTime()
      const end = new Date(start)
      end.setMonth(end.getMonth() + months)
      const now = Date.now()
      if (now <= start) return 0
      if (now >= end.getTime()) return 100
      return Math.round(((now - start) / (end.getTime() - start)) * 100)
    } catch { return 0 }
  }

  const fmt = new Intl.NumberFormat('fa-IR')

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function makeDemoDeposit(e){
    e.preventDefault()
    setMsg('')
    const amt = Number(modal.amount)
    if (!Number.isFinite(amt) || amt <= 0) { setMsg('مبلغ معتبر وارد کنید'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href='/login'; return }
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id, type: 'deposit', amount: amt, note: 'Demo USDT deposit'
    })
    if (error) { setMsg('خطا در ثبت واریز: ' + error.message); return }
    setMsg('واریز ثبت شد ✅')
    setModal({ open:false, amount:'' })
    // رفرش مجموع‌ها
    const { data: rows } = await supabase.from('transactions').select('amount').eq('type','deposit')
    const sumD = (rows||[]).reduce((s,r)=> s + Number(r.amount||0), 0)
    setTxAgg(a=>({...a, deposit: sumD}))
  }

  if (loading) return <main className="container"><p>در حال بارگذاری…</p></main>

  return (
    <main className="container">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12, gap:10, flexWrap:'wrap'}}>
        <h1>داشبورد</h1>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <span className="muted" style={{direction:'ltr',fontSize:12}}>{user?.email}</span>
          <a className="btn" href="/plans">پلن‌ها</a>
          <a className="btn" href="/dashboard/transactions">تاریخچه تراکنش‌ها</a>
          {/* لینک اضافه‌شده C3 */}
          <a className="btn" href="/dashboard/charts">نمودارها</a>
          <button className="btn" onClick={signOut}>خروج</button>
        </div>
      </header>

      {/* KPIها */}
      <section className="grid grid-4" style={{gap:12}}>
        <div className="card">
          <div className="muted">موجودی کل</div>
          <div style={{fontSize:22, fontWeight:700}}>{fmt.format(kpis.portfolio)}</div>
        </div>
        <div className="card">
          <div className="muted">سود تحقق‌یافته</div>
          <div style={{fontSize:22, fontWeight:700}}>{fmt.format(kpis.realizedProfit)}</div>
        </div>
        <div className="card">
          <div className="muted">پلن‌های فعال</div>
          <div style={{fontSize:22, fontWeight:700}}>{kpis.activePlans}</div>
        </div>
        <div className="card">
          <div className="muted">کل سرمایه‌گذاری</div>
          <div style={{fontSize:22, fontWeight:700}}>{fmt.format(kpis.invested)}</div>
        </div>
      </section>

      {/* اقدام‌های سریع */}
      <section style={{marginTop:16}}>
        <h3>اقدام‌های سریع</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <a className="btn primary" href="/plans">خرید پلن</a>
          <a className="btn" href="/dashboard/transactions">تاریخچه تراکنش‌ها</a>
          <a className="btn" href="/dashboard/charts">نمودارها</a>
          <button className="btn" onClick={()=>setModal({open:true, amount:''})}>واریز نمایشی (USDT)</button>
        </div>
        {msg && <p className="muted" style={{marginTop:8}}>{msg}</p>}
      </section>

      {/* پلن‌های فعال من */}
      <section style={{marginTop:16}}>
        <h3>پلن‌های فعال من</h3>
        <div className="grid grid-2" style={{gap:12}}>
          {userPlans.map(up => {
            const p = up.plans || {}
            const prog = planProgressPercentage(up)
            return (
              <div key={up.id} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h4>{p.name || 'پلن'}</h4>
                  <span className="pill" title="پیشرفت">{prog}%</span>
                </div>
                <div className="grid grid-3" style={{marginTop:6}}>
                  <div className="pill">مبلغ: {fmt.format(Number(up.amount||0))}</div>
                  <div className="pill">سود/ماه: {Number(p.profit_percent||0)}%</div>
                  <div className="pill">مدت: {Number(p.duration_months||0)} ماه</div>
                </div>
                {p.rules && <details style={{marginTop:6}}><summary>قوانین</summary><pre style={{whiteSpace:'pre-wrap'}}>{p.rules}</pre></details>}
                <div style={{height:8, background:'#eee', borderRadius:6, marginTop:10}}>
                  <div style={{width:`${prog}%`, height:'100%', background:'#8a2be2', borderRadius:6}}/>
                </div>
              </div>
            )
          })}
          {userPlans.length===0 && <p className="muted">هیچ پلن فعالی ندارید. از «خرید پلن» شروع کنید.</p>}
        </div>
      </section>

      {/* مودال واریز نمایشی */}
      {modal.open && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.35)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:9999
        }}
          onClick={()=>setModal({open:false, amount:''})}
        >
          <div className="card" style={{minWidth:320}} onClick={e=>e.stopPropagation()}>
            <h3>واریز نمایشی USDT</h3>
            <form onSubmit={makeDemoDeposit}>
              <input type="number" step="0.01" placeholder="مبلغ (USDT)"
                     value={modal.amount} onChange={e=>setModal(m=>({...m, amount:e.target.value}))}/>
              <div style={{display:'flex',gap:8,marginTop:10}}>
                <button className="btn primary" type="submit">ثبت واریز</button>
                <button className="btn" type="button" onClick={()=>setModal({open:false, amount:''})}>انصراف</button>
              </div>
            </form>
            <p className="muted" style={{marginTop:8}}>نسخهٔ نمایشی — فقط برای تست داشبورد.</p>
          </div>
        </div>
      )}
    </main>
  )
}