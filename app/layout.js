// app/layout.js
import './globals.css'
import Header from '../components/Header'
import { Vazirmatn } from 'next/font/google'

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['300','400','600','800'],
  display: 'swap',
  variable: '--font-vazir'
})

export const metadata = {
  title: 'NovaInvest',
  description: 'سرمایه‌گذاری مدرن با پلن‌های شفاف و داشبورد حرفه‌ای',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}