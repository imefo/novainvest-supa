// components/Footer.tsx
export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,.08)",
      marginTop: 40
    }}>
      <div className="container" style={{ padding: "20px 16px", color: "#cbd5e1" }}>
        © {new Date().getFullYear()} NovaInvest — همه حقوق محفوظ است.
      </div>
    </footer>
  );
}