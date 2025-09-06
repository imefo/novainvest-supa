// app/layout.js
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "NovaInvest — هوشمند، شفاف، سریع",
  description: "پلتفرم سرمایه‌گذاری با پلن‌های امن، متعادل و ریسکی",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Header />
        <main className="nv-container">{children}</main>
        <footer className="nv-footer">
          <div className="nv-footer-inner">© NovaInvest 2025 — همه حقوق محفوظ است.</div>
        </footer>
      </body>
    </html>
  );
}