'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import {
  Chart as ChartJS,
  LineElement, CategoryScale, LinearScale, PointElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, BarElement, ArcElement, Tooltip, Legend, Filler)

/** تنظیمات UI */
const CHART_HEIGHT = 360         // ارتفاع ثابت برای جلوگیری از کش آمدن صفحه
const MAX_POINTS = 60            // نهایتاً 60 نقطه برای روان بودن

export default function ChartsPage() {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('portfolio') // 'portfolio' | 'flow' | 'alloc'
  const [tx, setTx] = useState([])            // transactions
  const [userPlans, setUserPlans] = useState([]) // user_plans + plans

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      // تراکنش‌ها (مرتب‌شده صعودی برای نمودار خطی)
      const { data: txRows } = await supabase
        .from('transactions')
        .select('type, amount, created_at')
        .order('created_at', { ascending: true })
      setTx(txRows || [])

      // پلن‌های کاربر برای دونات
      const { data: up } = await supabase
        .from('user_plans')
        .select(`id, amount, created_at, plans ( id, name )`)
      setUserPlans(up || [])

      setLoading(false)
    })()
  }, [])

  // ======= Helperها =======
  const yyyymm = d => {
    const dt = new Date(d); const y = dt.getFullYear(); const m = dt.getMonth() + 1
    return `${y}-${String(m).padStart(2,'0')}`
  }
  const clamp = (arr, n) => (arr.length > n ? arr.slice(arr.length - n) : arr)

  // 1) پرتفوی در زمان: cumulative = deposits + payouts - withdraws
  const portfolioSeries = useMemo(() => {
    let cum = 0
    const points = (tx || []).map(r => {
      const amt = Number(r.amount || 0)
      if (r.type === 'deposit' || r.type === 'payout') cum += amt
      else if (r.type === 'withdraw') cum -= amt
      return { x: new Date(r.created_at), y: cum }
    })
    const pts = points.length ? clamp(points, MAX_POINTS) : [{ x: new Date(), y: 0 }]
    const labels = pts.map(p => new Date(p.x).toLocaleDateString('fa-IR'))
    const data = pts.map(p => p.y)
    return { labels, data }
  }, [tx])

  // 2) جریان نقدی ماهانه: جمع deposit/withdraw/payout در هر ماه
  const monthlyFlow = useMemo(() => {
    const buckets = {} // { '2025-08': {deposit, withdraw, payout} }
    for (const r of (tx || [])) {
      const key = yyyymm(r.created_at)
      buckets[key] ||= { deposit:0, withdraw:0, payout:0 }
      const amt = Number(r.amount || 0)
      if (r.type === 'deposit') buckets[key].deposit += amt
      else if (r.type === 'withdraw') buckets[key].withdraw += amt
      else if (r.type === 'payout')  buckets[key].payout  += amt
    }
    const keysAll = Object.keys(buckets).sort()
    const keys = clamp(keysAll, 12) // نهایت ۱۲ ماه اخیر
    const deposits  = keys.map(k => buckets[k].deposit)
    const withdraws = keys.map(k => buckets[k].withdraw)
    const payouts   = keys.map(k => buckets[k].payout)
    return { keys, deposits, withdraws, payouts }
  }, [tx])

  // 3) سهم هر پلن
  const allocation = useMemo(() => {
    const map = new Map() // name -> sum(amount)
    for (const up of (userPlans || [])) {
      const name = up?.plans?.name || 'بدون نام'
      const amt  = Number(up.amount || 0)
      map.set(name, (map.get(name) || 0) + amt)
    }
    const entries = Array.from(map.entries()).sort((a,b)=> b[1]-a[1])
    const top = entries.slice(0, 8) // حداکثر ۸ سکتور تا خوانایی بهتر شود
    const labels = top.map(([k]) => k)
    const data   = top.map(([,v]) => v)
    return { labels: labels.length ? labels : ['—'], data: data.length ? data : [1] }
  }, [userPlans])

  if (loading) return <main className="container"><p>در حال بارگذاری…</p></main>

  return (
    <main className="container">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
        <h1>نمودارها</h1>
        <div style={{display:'flex',gap:8}}>
          <a className="btn" href="/dashboard">داشبورد</a>
          <a className="btn" href="/dashboard/transactions">تاریخچه تراکنش‌ها</a>
        </div>
      </header>

      {/* تب‌ها */}
      <nav className="card" style={{marginTop:12, display:'flex', gap:8, padding:'8px', alignItems:'center'}}>
        <TabBtn active={tab==='portfolio'} onClick={()=>setTab('portfolio')}>رشد سرمایه</TabBtn>
        <TabBtn active={tab==='flow'} onClick={()=>setTab('flow')}>جریان نقدی ماهانه</TabBtn>
        <TabBtn active={tab==='alloc'} onClick={()=>setTab('alloc')}>سهم هر پلن</TabBtn>
      </nav>

      {/* محتوای تب‌ها */}
      <section className="card" style={{marginTop:12}}>
        {tab === 'portfolio' && (
          <div>
            <h3>رشد سرمایه در زمان</h3>
            <div style={{height: CHART_HEIGHT}}>
              <Line
                data={{
                  labels: portfolioSeries.labels,
                  datasets: [{
                    label: 'ارزش پرتفوی',
                    data: portfolioSeries.data,
                    fill: true,
                    borderWidth: 2,
                    tension: 0.25
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { intersect: false, mode: 'index' }
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { callback: v => new Intl.NumberFormat('fa-IR').format(v) } },
                    x: { ticks: { maxRotation: 0, autoSkip: true } }
                  }
                }}
              />
            </div>
          </div>
        )}

        {tab === 'flow' && (
          <div>
            <h3>جریان نقدی ماهانه</h3>
            <div style={{height: CHART_HEIGHT}}>
              <Bar
                data={{
                  labels: monthlyFlow.keys.length ? monthlyFlow.keys : ['—'],
                  datasets: [
                    { label: 'واریز',   data: monthlyFlow.deposits,  borderWidth: 1 },
                    { label: 'برداشت', data: monthlyFlow.withdraws, borderWidth: 1 },
                    { label: 'سود پرداخت‌شده', data: monthlyFlow.payouts, borderWidth: 1 },
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </div>
          </div>
        )}

        {tab === 'alloc' && (
          <div>
            <h3>سهم هر پلن</h3>
            <div style={{maxWidth: 520, marginInline: 'auto'}}>
              <Doughnut
                data={{
                  labels: allocation.labels,
                  datasets: [{ data: allocation.data, borderWidth: 1 }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: { legend: { position: 'bottom' } },
                  cutout: '55%'
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* نکات UI کوچک */}
      <section className="muted" style={{marginTop:8, fontSize:12}}>
        نکته: برای روان بودن، حداکثر {MAX_POINTS} نقطهٔ زمانی و ۱۲ ماه اخیر نمایش داده می‌شود.
      </section>
    </main>
  )
}

/** دکمه تب ساده */
function TabBtn({ active, onClick, children }){
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        background: active ? '#222' : undefined,
        color: active ? '#fff' : undefined,
        border: active ? '1px solid #222' : '1px solid #ddd'
      }}
    >
      {children}
    </button>
  )
}