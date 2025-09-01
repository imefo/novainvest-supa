'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage(){
  const bgRef = useRef(null)
  const router = useRouter()
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  // پارالاکس بک‌گراند
  useEffect(() => {
    let ticking = false
    const el = bgRef.current
    if (!el) return
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY || 0
          el.style.transform = `translateY(${y * 0.10}px) scale(1.02)`
          ticking = false
        })
        ticking = true
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // CSS اختصاصی
  useEffect(() => {
    if (document.getElementById('nv-auth-css')) return
    const s = document.createElement('style')
    s.id = 'nv-auth-css'
    s.innerHTML = `
      .rv{opacity:0; transform:translateY(14px); transition:opacity .5s ease, transform .5s ease}
      .rv-in{opacity:1; transform:none}
      .tabs{display:flex; gap:8px; margin-top:10px; margin-bottom:8px;}
      .tab{padding:8px 12px; border:1px solid var(--border); border-radius:999px; background:#0f0f18; cursor:pointer}
      .tab.active{ background: var(--primary); color: var(--primary-contrast); border-color: color-mix(in oklab,var(--primary) 70%, #fff 30%); }
      .glass{ backdrop-filter: blur(12px); background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03)); border:1px solid rgba(255,255,255,.12); box-shadow: 0 8px 24px rgba(0,0,0,.22); }
      .gold-ribbon{ position:absolute; inset:auto 0 0 0; height:6px;
        background: linear-gradient(90deg, rgba(212,175,55,.0) 0%, rgba(212,175,55,.85) 30%, rgba(226,192,77,.95) 50%, rgba(212,175,55,.85) 70%, rgba(212,175,55,.0) 100%);
        filter: blur(.3px); box-shadow: 0 0 18px rgba(212,175,55,.38), 0 6px 18px rgba(0,0,0,.35) inset;
        mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
      }
    `
    document.head.appendChild(s)
  }, [])

  async function handleSubmit(e){
    e.preventDefault()
    setMsg('')
    setBusy(true)
    try{
      if (mode === 'signin'){
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // پس از ورود، بررسی ادمین
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', user.id)
            .maybeSingle()
          if (profile?.is_admin) router.replace('/admin')
          else router.replace('/dashboard')
        } else {
          router.replace('/dashboard')
        }
      } else {
        // ثبت‌نام
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } }
        })
        if (error) throw error
        setMsg('ثبت‌نام انجام شد. لطفاً ایمیل خود را تأیید کنید یا وارد شوید.')
      }
    }catch(err){
      setMsg(err?.message || 'خطا در عملیات')
    }finally{
      setBusy(false)
    }
  }

  return (
    <main>
      {/* هدر تصویری مشابه هوم */}
      <section style={heroSection}>
        <img ref={bgRef} src="/hero-bg.jpg" alt="" style={bgImg} />
        <div style={bgOverlay} />
        <div className="gold-ribbon" aria-hidden="true" />

        <div className="container" style={{ position:'relative', zIndex:1, padding:'70px 0 40px' }}>
          <div style={heroGrid}>
            <div style={{ minWidth:0 }}>
              <h1 style={title}>
                <span style={brandLeft}>Nova</span>
                <span style={brandRight}>Invest</span>
              </h1>
              <p style={subtitle}>به حساب خود وارد شوید یا ثبت‌نام کنید.</p>
              <ul style={bullets}>
                <li>امنیت و سادگی در استفاده</li>
                <li>مدیریت یکپارچهٔ سرمایه</li>
                <li>پلن‌های شفاف و قابل فهم</li>
              </ul>
            </div>

            {/* کارت گلس برای ورود/ثبت‌نام */}
            <aside className="glass rv rv-in" style={card}>
              <div className="tabs">
                <button className={`tab ${mode==='signin'?'active':''}`} onClick={()=>setMode('signin')}>ورود</button>
                <button className={`tab ${mode==='signup'?'active':''}`} onClick={()=>setMode('signup')}>ثبت‌نام</button>
              </div>

              {msg && (
                <div className="card" style={{borderColor:'rgba(255,255,255,.18)', background:'rgba(255,255,255,.04)', marginBottom:8}}>
                  <span className="muted">{msg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'grid', gap:10 }}>
                {mode === 'signup' && (
                  <input
                    placeholder="نام و نام خانوادگی"
                    value={fullName}
                    onChange={e=>setFullName(e.target.value)}
                  />
                )}
                <input
                  type="email"
                  placeholder="ایمیل"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  required
                />
                <button className="btn primary" type="submit" disabled={busy}>
                  {busy ? 'در حال انجام…' : (mode==='signin' ? 'ورود' : 'ثبت‌نام')}
                </button>
              </form>

              {mode === 'signin' && (
                <p className="muted" style={{ marginTop:8, fontSize:12 }}>
                  حساب ندارید؟ <button className="nav-link" onClick={()=>setMode('signup')}>ثبت‌نام</button>
                </p>
              )}
              {mode === 'signup' && (
                <p className="muted" style={{ marginTop:8, fontSize:12 }}>
                  قبلاً ثبت‌نام کرده‌اید؟ <button className="nav-link" onClick={()=>setMode('signin')}>ورود</button>
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ===== استایل‌ها (هماهنگ با هوم) ===== */
const heroSection = { position:'relative', minHeight: 560, borderBottom:'1px solid var(--border)', overflow:'hidden' }
const bgImg = { position:'absolute', inset:0, width:'100%', height:'110%', objectFit:'cover', zIndex:0, willChange:'transform' }
const bgOverlay = {
  position:'absolute', inset:0, zIndex:0,
  background: `
    radial-gradient(1000px 520px at 80% -10%, rgba(124,77,255,.22), transparent),
    linear-gradient(rgba(8,6,20,.60), rgba(8,6,20,.60))
  `
}
const heroGrid = { display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:16, alignItems:'stretch' }
const title = { fontSize: 64, lineHeight: 1.04, margin: '0 0 8px 0', fontWeight: 900, letterSpacing: '-1.2px' }
const brandLeft  = { color:'#d4af37', textShadow:'0 0 18px rgba(212,175,55,.35)' }
const brandRight = { color:'var(--primary)', marginInlineStart:6, textShadow:'0 0 18px rgba(124,77,255,.35)' }
const subtitle = { color:'var(--muted)', maxWidth:720, fontSize:16, margin:'6px 0 10px' }
const bullets = { listStyle:'none', padding:0, margin:'12px 0 0 0', display:'grid', gap:8, fontSize:14 }
const card = { height:'100%', padding:14, borderRadius:14 }