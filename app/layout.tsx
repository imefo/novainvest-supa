// app/layout.tsx
import "./globals.css";
import Header from "../components/Header"; // ایمپورت نسبی مطمئن برای Vercel (حساس به حروف)

export const metadata = {
  title: "NovaInvest",
  description: "Invest smart.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Header />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}