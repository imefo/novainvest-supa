// app/layout.tsx
import "./globals.css";
import Header from "../components/Header";

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
        {/* DEBUG fingerprint: اگر این را در سورس دیدی یعنی layout.tsx فعال است */}
        {/* LAYOUT_ACTIVE */}
        <Header />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}