"use client";

export default function GlobalError({ error, reset }) {
  console.error("GlobalError:", error);
  return (
    <html lang="fa" dir="rtl">
      <body style={{ padding: 24, color: "#e5e7eb", background: "#0c0f1a" }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.06)",
            backdropFilter: "blur(8px)",
          }}
        >
          <h1 style={{ marginTop: 0 }}>خطا در اجرای صفحه</h1>
          <p style={{ opacity: .8, lineHeight: 1.8 }}>
            مشکلی در اجرای کد سمت مرورگر رخ داد. لطفاً صفحه را دوباره بارگذاری کنید.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            تلاش دوباره
          </button>
        </div>
      </body>
    </html>
  );
}