// components/Header.tsx
"use client";

export default function Header() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999999,          // از همه بالاتر
        background: "red",
        color: "#fff",
        padding: "16px",
        textAlign: "center",
        fontWeight: "bold",
      }}
    >
      🔴 HEADER FORCED — اگر این را می‌بینی، هدر رندر شده
    </div>
  );
}