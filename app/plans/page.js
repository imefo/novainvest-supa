'use client'
import PlansGrid from '../../components/PlansGrid'

export default function PlansPage(){
  return (
    <main>
      <section className="container" style={{marginTop:18}}>
        <h1 style={{margin:'0 0 10px 0', fontSize:28, fontWeight:900}}>پلن‌ها</h1>
        <p className="muted" style={{margin:0, fontSize:13}}>لیست کامل پلن‌های فعال</p>
      </section>

      {/* بدون limit = همه را می‌آورد */}
      <PlansGrid limit={null} showTitle={false} />
    </main>
  )
}