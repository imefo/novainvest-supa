'use client'

export default function StyleDebug(){
  const vars = [
    '--bg','--text','--muted','--primary','--accent',
    '--card-bg','--border','--sidebar-bg','--sidebar-border','--pill-bg','--link'
  ]
  const styles = getComputedStyle(document.documentElement)
  return (
    <main className="container">
      <h1>Style Debug</h1>
      <div className="grid grid-3" style={{gap:12}}>
        {vars.map(v => {
          const val = styles.getPropertyValue(v).trim()
          return (
            <div key={v} className="card" style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:22,height:22,borderRadius:6,background:val,border:'1px solid var(--border)'}}/>
              <div><strong>{v}</strong><div className="muted">{val || '—'}</div></div>
            </div>
          )
        })}
      </div>
      <p className="muted" style={{marginTop:12}}>
        اگر مربع‌ها رنگ ندارند یا مقدارها خالی‌اند، یعنی تم/متغیرها لود نشده‌اند.
      </p>
    </main>
  )
}