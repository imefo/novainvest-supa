import './globals.css'

export const metadata = {
  title: 'NovaInvest',
  description: 'MVP با Supabase + Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
