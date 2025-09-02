// components/Header.js
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const isActive = (p) => (pathname === p ? 'text-gold-400' : 'text-gray-200')

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        background: 'rgba(10,10,12,0.55)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <nav style={{
        width:'100%', maxWidth:1200, display:'flex',
        alignItems:'center', justifyContent:'space-between', padding:'0 16px'
      }}>
        {/* لوگو/برند */}
        <Link href="/" style={{display:'flex', alignItems:'center', gap:10, textDecoration:'none'}}>
          <div style={{
            width:34, height:34, borderRadius:8,
            background:'linear-gradient(135deg,#f6d365,#fda085)',
            boxShadow:'0 0 16px rgba(253,160,133,.45)'
          }} />
          <span style={{
            fontWeight:800, letterSpacing:.5,
            background:'linear-gradient(90deg,#f5d76e,#d4af37)',
            WebkitBackgroundClip:'text', color:'transparent'
          }}>
            NovaInvest
          </span>
        </Link>

        {/* لینک‌ها */}
        <div style={{display:'flex', gap:18, alignItems:'center'}}>
          <Link href="/" className={isActive('/')}>خانه</Link>
          <Link href="/plans" className={isActive('/plans')}>پلن‌ها</Link>
          <Link href="/login" className={isActive('/login')}>ورود / ثبت‌نام</Link>
        </div>
      </nav>
      <style jsx global>{`
        .text-gray-200{ color:rgba(235,235,240,.92); text-decoration:none; }
        .text-gray-200:hover{ color:#fff }
        .text-gold-400{
          background:linear-gradient(90deg,#f5d76e,#d4af37);
          -webkit-background-clip:text; color:transparent; font-weight:700;
        }
        body{ background:#0b0c10; color:#e6e6ea; }
        main.pagePad{ padding-top:74px; } /* زیر هدر فاصله */
      `}</style>
    </header>
  )
}