// app/layout.tsx
import "./globals.css";            // مسیر درست نسبت به app/
import Header from "../components/Header"; // ایمپورت نسبی؛ روی لینوکس مطمئن‌تر است

export const metadata = {
  title: "NovaInvest",
  description: "Invest smart.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Header />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}