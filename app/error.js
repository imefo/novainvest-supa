"use client";

export default function Error({ error, reset }) {
  console.error("App Error:", error);
  return (
    <div className="nv-container" dir="rtl" style={{ paddingTop: 24 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>خطا</h2>
        <p className="muted">مشکلی پیش آمد. لطفاً دوباره تلاش کنید.</p>
        <button className="nv-btn nv-btn-primary" onClick={() => reset()}>
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}