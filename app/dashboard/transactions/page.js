'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

const TYPES = [
  { v: '',       t: 'همه نوع‌ها' },
  { v: 'deposit', t: 'واریز' },
  { v: 'withdraw', t: 'برداشت' },
  { v: 'payout', t: 'سود پرداخت‌شده' },
  { v: 'bonus',   t: 'پاداش' },
  { v: 'fee',     t: 'کارمزد' },
]

export default function TxPage(){
  const [user, setUser] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    from: '',
    to: ''
  })

  useEffect(() => {
    (async ()=>{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user){ window.location.href='/login'; return }
      setUser(user)
      await load()
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load(){
    setLoading(true); setMsg('')
    let query = supabase.from('transactions')
      .select('id, type, amount, note, created_at')
      .order('created_at', { ascending: false })

    if (filters.type) query = query.eq('type', filters.type)
    if (filters.from) query = query.gte('created_at', new Date(filters.from).toISOString())
    if (filters.to){
      const dt = new Date(filters.to); dt.setHours(23,59,59,999)
      query = query.lte('created_at', dt.toISOString())
    }

    const { data, error } = await query
    if (error){ setMsg(error.message) } else { setRows(data || []) }
    setLoading(false)
  }

  function onChange(k, v){ setFilters(f=>({ ...f, [k]: v })) }

  const fmt = new Intl.NumberFormat('fa-IR')
  const rowsView = useMemo(()=> rows.map(r=>({
    ...r,
    created_local: new Date(r.created_at).toLocaleString('fa-IR'),
    amount_fmt: fmt.format(Number(r.amount||0)),
    type_txt: TYPES.find(t=>t.v===r.type)?.t || r.type
  })), [rows])

  function exportCSV(){
    const header = ['id','type','type_fa','amount','note','created_at','created_local']
    const lines = [header.join(',')]
    for (const r of rowsView){
      const vals = [
        r.id,
        r.type,
        r.type_txt,
        String(r.amount ?? ''),
        (r.note ?? '').replaceAll('"','""'),
        r.created_at,
        r.created_local
      ].map(v => /[",\n]/.test(String(v)) ? `"${String(v)}"` : String(v))
      lines.push(vals.join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function signOut(){ await supabase.auth.signOut(); window.location.href='/login' }

  if (loading && !rows.length) return <main className="container"><p>در حال بارگذاری…</p></main>

  return (
    <main className="container">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
        <h1>تاریخچه تراکنش‌ها</h1>
        <div style={{display:'flex',gap:8}}>
          <a className="btn" href="/dashboard">داشبورد</a>
          <button className="btn" onClick={signOut}>خروج</button>
        </div>
      </header>

      <section className="card" style={{marginTop:12}}>
        <h3>فیلتر</h3>
        <div className="grid grid-4" style={{gap:8}}>
          <select value={filters.type} onChange={e=>onChange('type', e.target.value)}>
            {TYPES.map(t => <option key={t.v} value={t.v}>{t.t}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={e=>onChange('from', e.target.value)} />
          <input type="date" value={filters.to} onChange={e=>onChange('to', e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button className="btn primary" onClick={load}>اعمال</button>
            <button className="btn" onClick={()=>{setFilters({type:'',from:'',to:''}); setTimeout(load,0)}}>ریست</button>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
          <span className="muted">{msg}</span>
          <button className="btn" onClick={exportCSV}>دانلود CSV</button>
        </div>
      </section>

      <section style={{marginTop:12}}>
        <div className="card" style={{padding:0, overflow:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th style={th}>تاریخ</th>
                <th style={th}>نوع</th>
                <th style={th}>مبلغ</th>
                <th style={th}>توضیح</th>
              </tr>
            </thead>
            <tbody>
              {rowsView.map(r=>(
                <tr key={r.id}>
                  <td style={td}>{r.created_local}</td>
                  <td style={td}>{r.type_txt}</td>
                  <td style={td}>{r.amount_fmt}</td>
                  <td style={td}>{r.note || '—'}</td>
                </tr>
              ))}
              {rowsView.length===0 && (
                <tr><td style={td} colSpan={4} className="muted">تراکنشی یافت نشد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

const th = { textAlign:'right', padding:'10px 12px', borderBottom:'1px solid #eee', background:'#fafafa', fontWeight:700 }
const td = { textAlign:'right', padding:'10px 12px', borderBottom:'1px solid #f1f1f1' }