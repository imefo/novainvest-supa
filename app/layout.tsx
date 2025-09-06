// app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "NovaInvest",
  description: "سرمایه‌گذاری هوشمند، شفاف و سریع",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Header />
        <main className="nv-container">{children}</main>
        <footer className="nv-footer">
          <div className="nv-footer-inner">
            © NovaInvest 2025 — همه حقوق محفوظ است.
          </div>
        </footer>
      </body>
    </html>
  );
}