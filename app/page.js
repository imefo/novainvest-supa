'use client'
import { useEffect, useRef } from 'react'
import PlansGrid from '../components/PlansGrid'

export default function HomePolishedAnimated() {
  const bgRef = useRef(null)

  // پارالاکس بک‌گراند
  useEffect(() => {
    let ticking = false
    const el = bgRef.current
    if (!el) return

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || 0
          el.style.transform = `translateY(${y * 0.12}px) scale(1.02)`
          ticking = false
        })
        ticking = true
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ریویل CSS + ریبون + گلس
  useEffect(() => {
    if (document.getElementById('nv-home-anim')) return
    const s = document.createElement('style')
    s.id = 'nv-home-anim'
    s.innerHTML = `
      .rv{opacity:0; transform:translateY(16px); transition:opacity .55s ease, transform .55s ease}
      .rv-in{opacity:1; transform:none}
      .pop-in{animation:pop .6s ease both}
      @keyframes pop{0%{opacity:0; transform:translateY(10px) scale(.98)}100%{opacity:1; transform:none}}
      .gold-ribbon{
        position:absolute; inset:auto 0 0 0; height:6px; 
        background: linear-gradient(90deg, rgba(212,175,55,.0) 0%, rgba(212,175,55,.85) 30%, rgba(226,192,77,.95) 50%, rgba(212,175,55,.85) 70%, rgba(212,175,55,.0) 100%);
        filter: blur(.3px);
        box-shadow: 0 0 18px rgba(212,175,55,.38), 0 6px 18px rgba(0,0,0,.35) inset;
        overflow:hidden;
        mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
      }
      .gold-ribbon::after{
        content:'';
        position:absolute; top:-8px; left:-20%;
        width:20%; height:22px; 
        background: radial-gradient(circle at center, rgba(255,255,255,.9), rgba(255,255,255,0));
        filter: blur(6px);
        animation: shine 3.8s ease-in-out infinite;
      }
      @keyframes shine{ 0%{ left:-20% } 55%{ left:65% } 100%{ left:110% } }
      .glass{
        backdrop-filter: blur(12px);
        background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03));
        border: 1px solid rgba(255,255,255,.12);
        box-shadow: 0 8px 24px rgba(0,0,0,.22);
      }
    `
    document.head.appendChild(s)
  }, [])

  return (
    <main>
      {/* ===== HERO ===== */}
      <section style={heroSection}>
        <img ref={bgRef} src="/hero-bg.jpg" alt="" style={bgImg} />
        <div style={bgOverlay} />
        <div className="gold-ribbon" aria-hidden="true" />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '70px 0 40px' }}>
          <div style={heroGrid}>
            <div style={{ minWidth: 0 }}>
              <h1 className="pop-in" style={title}>
                <span style={brandLeft}>Nova</span>
                <span style={brandRight}>Invest</span>
              </h1>
              <p style={subtitle}>سرمایه‌گذاری هوشمند با طراحی مدرن و مدیریت یکپارچه — ساده، امن و شفاف.</p>
              <ul style={bullets}>
                <li>پلن‌های روشن و قابل فهم</li>
                <li style={{ transitionDelay: '.06s' }}>داشبورد سبک و پاسخگو</li>
                <li style={{ transitionDelay: '.12s' }}>تمرکز بر امنیت و حریم خصوصی</li>
              </ul>
            </div>

            <aside className="glass rv" data-reveal style={signupCard}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>ثبت‌نام سریع</h3>
              <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>در کمتر از یک دقیقه حساب بسازید</p>
              <form onSubmit={(e)=>e.preventDefault()} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                <div style={grid2}>
                  <input style={input} placeholder="نام" />
                  <input style={input} placeholder="نام خانوادگی" />
                </div>
                <input style={input} type="email" placeholder="ایمیل" />
                <input style={input} type="password" placeholder="رمز عبور" />
                <button className="btn primary" type="submit">ادامه</button>
              </form>
              <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>با ورود یا ثبت‌نام، شرایط استفاده را می‌پذیرید.</p>
            </aside>
          </div>
        </div>
      </section>

      {/* ===== Plans از دیتابیس + ریویل ===== */}
      <PlansGrid limit={6} showTitle />

      {/* فوتر */}
      <footer style={footer}>
        <div className="container" style={footerRow}>
          <div style={{ fontWeight: 900, letterSpacing: '.2px' }}>NovaInvest</div>
          <div className="muted" style={{ fontSize: 12 }}>© {new Date().getFullYear()}</div>
        </div>
      </footer>
    </main>
  )
}

/* ===== Styles (inline) ===== */
const heroSection = { position: 'relative', minHeight: 560, borderBottom: '1px solid var(--border)', overflow: 'hidden' }
const bgImg = { position: 'absolute', inset: 0, width: '100%', height: '110%', objectFit: 'cover', zIndex: 0, willChange: 'transform' }
const bgOverlay = {
  position: 'absolute', inset: 0, zIndex: 0,
  background: `
    radial-gradient(1000px 520px at 80% -10%, rgba(124,77,255,.22), transparent),
    linear-gradient(rgba(8,6,20,.60), rgba(8,6,20,.60))
  `
}
const heroGrid = { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, alignItems: 'stretch' }
const title = { fontSize: 72, lineHeight: 1.02, margin: '0 0 10px 0', fontWeight: 900, letterSpacing: '-1.4px' }
const brandLeft  = { color: '#d4af37', textShadow: '0 0 18px rgba(212,175,55,.35)' }
const brandRight = { color:'var(--primary)', marginInlineStart:6, textShadow:'0 0 18px rgba(124,77,255,.35)' }
const subtitle = { color:'var(--muted)', maxWidth:760, fontSize:16, margin:'6px 0 10px' }
const bullets = { listStyle:'none', padding:0, margin:'14px 0 0 0', display:'grid', gap:8, fontSize:14 }
const signupCard = { height:'100%', padding:14, borderRadius:14 }
const input = { width:'100%', background:'rgba(10,10,18,.65)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px', outline:'none' }
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }
const footer = { borderTop:'1px solid var(--border)', padding:'18px 0', marginTop:28 }
const footerRow = { display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap' }