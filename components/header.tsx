// components/Header.tsx
"use client";

export default function Header() {
  console.log("HEADER MOUNTED ✅");
  return (
    <div
      id="header-test"
      style={{
        position: "fixed",
        inset: "0 auto auto 0",
        width: "100%",
        zIndex: 99999,
        background: "#111",
        color: "#fff",
        padding: "12px 16px",
        fontWeight: 800,
        textAlign: "center",
        letterSpacing: "0.5px",
      }}
    >
      HEADER TEST — اگر این نوار را می‌بینی یعنی Header رندر شده
    </div>
  );
}