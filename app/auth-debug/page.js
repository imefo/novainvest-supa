'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AuthDebug() {
  const [email, setEmail] = useState('admin@nova.local')
  const [password, setPassword] = useState('Test1234!')
  const [out, setOut] = useState('')

  const signIn = async () => {
    setOut('Signing in...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('LOGIN ERROR:', error)
      setOut('ERROR: ' + error.message)
    } else {
      console.log('LOGIN OK:', data)
      setOut('OK: ' + (data.session ? 'session created' : 'no session'))
    }
  }

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    console.log('GET USER:', data, error)
    setOut(error ? ('ERROR: ' + error.message) : ('USER: ' + (data?.user?.id || 'no user')))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setOut('Signed out')
  }

  return (
    <main className="container" style={{padding:20}}>
      <h1>Auth Debug</h1>
      <div className="card" style={{maxWidth:520}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{marginTop:8}} />
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button className="btn primary" onClick={signIn}>Sign In</button>
          <button className="btn" onClick={getUser}>Get User</button>
          <button className="btn" onClick={signOut}>Sign Out</button>
        </div>
        <p className="muted" style={{marginTop:8,whiteSpace:'pre-wrap'}}>{out}</p>
      </div>
      <p className="muted">همزمان Console مرورگر را هم باز کن تا جزئیات را ببینی.</p>
    </main>
  )
}