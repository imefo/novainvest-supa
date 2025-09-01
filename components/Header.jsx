'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Header(){
  const [user, setUser] = useState(null)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)
    })()
  }, [])

  async function signOut(){
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header role="banner">
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',gap:10}}>
        {/* لوگو مینیمال */}
        <Link href="/" aria-label="NovaInvest" style={{
          display:'inline-flex',alignItems:'center',justifyContent:'center',
          width:36,height:36,borderRadius:10,background:'var(--primary)',color:'var(--primary-contrast)',fontWeight:900,textDecoration:'none'
        }}>
          N
        </Link>

        {/* ناوبری */}
        <nav style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <Link className="nav-link" href="/">خانه</Link>
          <Link className="nav-link" href="/plans">پلن‌ها</Link>

          {!user ? (
            <Link className="nav-link" href="/login">ورود / ثبت‌نام</Link>
          ) : (
            <>
              <Link className="nav-link" href="/dashboard">داشبورد</Link>
              <button className="btn" onClick={signOut}>خروج</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}