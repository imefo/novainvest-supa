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
        <Header />
        <main id="main">
          <div
            style={{
              padding: "24px",
              background: "#ffdd00",
              color: "#111",
              fontSize: "20px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            ✅ LAYOUT ACTIVE — این متن داخل layout.tsx است
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}