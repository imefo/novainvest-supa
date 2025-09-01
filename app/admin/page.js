'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPage() {
  const [status, setStatus] = useState('checking...')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUserEmail(user.email || '')

      const { data: prof, error } = await supabase
        .from('profiles').select('is_admin').eq('user_id', user.id).single()

      if (error) { console.error(error); setStatus('profile error'); window.location.href = '/dashboard'; return }
      if (!prof?.is_admin) { setStatus('not admin'); window.location.href = '/dashboard'; return }
      setStatus('ok')
    })()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (status !== 'ok') return <main className="container"><p>{status}</p></main>

  return (
    <main className="container">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <h1>پنل ادمین</h1>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span className="muted" style={{direction:'ltr',fontSize:12}}>{userEmail}</span>
          <button className="btn" onClick={signOut}>خروج</button>
        </div>
      </header>

      <p className="muted">شما ادمین هستید.</p>

      <section style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
        <a className="btn primary" href="/admin/plans">مدیریت پلن‌ها</a>
        <a className="btn" href="/plans">مشاهده پلن‌ها (سمت کاربر)</a>
        <a className="btn" href="/dashboard">داشبورد</a>
      </section>
    </main>
  )
}