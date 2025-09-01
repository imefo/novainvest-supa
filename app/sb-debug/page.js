'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SBDebug(){
  const [out, setOut] = useState('')

  const log = (label, val) =>
    setOut(prev => `${label}: ${typeof val === 'object' ? JSON.stringify(val, null, 2) : val}\n`)

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) return log('USER ERROR', error.message)
    log('USER', data?.user ? { id: data.user.id, email: data.user.email } : 'no user')
  }

  const getProfile = async () => {
    const { data: u } = await supabase.auth.getUser()
    if (!u?.user) return log('PROFILE', 'no user')
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, is_admin')
      .eq('user_id', u.user.id)
      .single()
    if (error) return log('PROFILE ERROR', error.message)
    log('PROFILE', data)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    log('AUTH', 'signed out')
  }

  return (
    <main style={{padding:20}}>
      <h1>Supabase Debug</h1>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', margin:'12px 0'}}>
        <button onClick={getUser}>Get User</button>
        <button onClick={getProfile}>Get Profile</button>
        <button onClick={signOut}>Sign Out</button>
      </div>
      <pre style={{background:'#111', color:'#0f0', padding:12, borderRadius:8, whiteSpace:'pre-wrap'}}>{out || '—'}</pre>
      <p style={{opacity:.7}}>با «Get User» آیدی و ایمیل فعلی، و با «Get Profile» مقدار <code>is_admin</code> را می‌بینی.</p>
    </main>
  )
}