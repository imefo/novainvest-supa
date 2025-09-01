'use client'

export default function EnvDebug(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const test = async () => {
    try {
      const res = await fetch(`${url}/auth/v1/health`)
      alert(`AUTH HEALTH: ${res.status}`)
    } catch (e) {
      alert('HEALTH FETCH ERROR: ' + e.message)
      console.error(e)
    }
  }

  return (
    <main style={{padding:20}}>
      <h1>Env Debug</h1>
      <p>URL: <code>{url || 'MISSING'}</code></p>
      <p>KEY starts with: <code>{key ? key.slice(0,12)+'...' : 'MISSING'}</code></p>
      <button onClick={test}>Test /auth/v1/health</button>
    </main>
  )
}
