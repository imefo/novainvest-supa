'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState('theme-purple')

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const saved = typeof window !== 'undefined' ? localStorage.getItem('nova_theme') : null
      const t = saved === 'theme-gold' ? 'theme-gold' : 'theme-purple'
      setTheme(t); applyTheme(t)

      setReady(true)
    })()
  }, [])

  function applyTheme(t){
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('theme-purple', 'theme-gold')
      document.documentElement.classList.add(t)
    }
  }
  function toggleTheme(){
    const next = theme === 'theme-purple' ? 'theme-gold' : 'theme-purple'
    setTheme(next); applyTheme(next)
    if (typeof window !== 'undefined') localStorage.setItem('nova_theme', next)
  }

  async function signOut(){ await supabase.auth.signOut(); window.location.href = '/login' }
  if (!ready) return <main className="container"><p>در حال بارگذاری…</p></main>

  const links = [
    { href: '/dashboard',               label: 'داشبورد' },
    { href: '/dashboard/transactions',  label: 'تراکنش‌ها' },
    { href: '/dashboard/charts',        label: 'نمودارها' },
    { href: '/plans',                   label: 'پلن‌ها' },
  ]

  const shell = { display:'grid', gridTemplateColumns: '240px 1fr', minHeight:'100vh' }
  const shellMobile = { display:'grid', gridTemplateColumns: '1fr', minHeight:'100vh' }
  const aside = {
    background:'var(--sidebar-bg)', borderInlineStart:'1px solid var(--sidebar-border)', borderInlineEnd:'1px solid var(--sidebar-border)',
    padding:'16px', position:'sticky', top:0, height:'100vh', overflow:'auto'
  }
  const header = { display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }
  const brand  = { fontWeight:800, fontSize:18, color:'var(--text)' }
  const email  = { direction:'ltr', fontSize:12, color:'var(--muted)' }
  const nav    = { display:'flex', flexDirection:'column', gap:6, marginTop:12 }
  const aStyle = (active) => ({
    display:'block', padding:'10px 12px', borderRadius:8, textDecoration:'none',
    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'var(--primary-contrast)' : 'var(--text)'
  })
  const mainWrap = { padding: '16px' }

  return (
    <div style={typeof window !== 'undefined' && window.innerWidth < 900 ? shellMobile : shell}>
      <aside style={{
        ...aside,
        display: typeof window !== 'undefined' && window.innerWidth < 900 ? (open ? 'block' : 'none') : 'block'
      }}>
        <div style={header}>
          <div>
            <div style={brand}>NovaInvest</div>
            <div style={email}>{user?.email}</div>
          </div>
          <div style={{display:'flex', gap:6}}>
            <button className="btn" onClick={toggleTheme}>{theme === 'theme-purple' ? 'تم طلایی' : 'تم بنفش'}</button>
            <button className="btn" onClick={()=>setOpen(false)} style={{display: typeof window !== 'undefined' && window.innerWidth < 900 ? 'inline-flex' : 'none'}}>بستن</button>
          </div>
        </div>

        <nav style={nav}>
          {links.map(l => {
            const active = pathname === l.href
            return <Link key={l.href} href={l.href} style={aStyle(active)} onClick={()=>setOpen(false)}>{l.label}</Link>
          })}
        </nav>

        <div style={{marginTop:'auto', display:'flex', gap:8, flexDirection:'column'}}>
          <button className="btn" onClick={signOut}>خروج</button>
        </div>
      </aside>

      <section style={mainWrap}>
        <div style={{display: typeof window !== 'undefined' && window.innerWidth < 900 ? 'flex' : 'none', justifyContent:'flex-end', marginBottom:8}}>
          <button className="btn" onClick={()=>setOpen(true)}>منو</button>
        </div>
        {children}
      </section>
    </div>
  )
}