"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function WalletCard() {
  const [addr, setAddr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // لود آدرس فعلی از پروفایل
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
          .from("profiles")
          .select("usdt_wallet_addr")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!alive) return;
        if (error) throw error;
        setAddr(data?.usdt_wallet_addr || "");
      } catch (e) {
        console.error(e);
        setMsg({ t: "error", text: "خطا در دریافت آدرس کیف‌پول." });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // اعتبارسنجی خیلی ساده: خالی نباشه و حداقل طول
  const isValid = (a) => (a?.trim().length ?? 0) >= 10;

  const save = async () => {
    setMsg(null);
    if (!isValid(addr)) {
      setMsg({ t: "error", text: "آدرس نامعتبر است." });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("no user");

      const { error } = await supabase
        .from("profiles")
        .update({ usdt_wallet_addr: addr.trim() })
        .eq("user_id", user.id);

      if (error) throw error;
      setMsg({ t: "ok", text: "آدرس با موفقیت ذخیره شد." });
    } catch (e) {
      console.error(e);
      setMsg({ t: "error", text: "ذخیره‌سازی ناموفق بود." });
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(addr || "");
      setMsg({ t: "ok", text: "کپی شد." });
    } catch {
      setMsg({ t: "error", text: "کپی نشد." });
    }
  };

  return (
    <div
      className="rounded-2xl p-4 md:p-5"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 10px 30px rgba(0,0,0,.25)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">کیف‌پول تتر (USDT)</h3>
        <span className="text-xs opacity-70">صرفاً آدرس را ذخیره کنید</span>
      </div>

      {loading ? (
        <div className="text-sm opacity-80">در حال بارگذاری…</div>
      ) : (
        <>
          <label className="text-sm opacity-80 block mb-2">آدرس کیف‌پول شما</label>
          <div className="flex gap-2">
            <input
              dir="ltr"
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              placeholder="مثلاً: TQ7f… (TRC20) یا 0x… (ERC20)"
              className="flex-1 rounded-xl px-3 py-2 bg-black/20 border border-white/10 outline-none focus:border-white/25"
            />
            <button onClick={copy} className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/25">
              کپی
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white disabled:opacity-60"
            >
              {saving ? "در حال ذخیره…" : "ذخیره"}
            </button>
          </div>

          {msg && (
            <div
              className={`mt-3 text-sm ${msg.t === "ok" ? "text-emerald-300" : "text-rose-300"}`}
            >
              {msg.text}
            </div>
          )}

          <p className="mt-3 text-xs opacity-70 leading-6">
            نکته: شبکهٔ تتر (TRC20/ ERC20) را مطابق کیف‌پول خود انتخاب کنید؛
            ما تنها «آدرس» را ذخیره می‌کنیم. برای واریز، بعداً اسکرین‌شات/TxHash را در
            بخش «واریز دستی» ارسال خواهید کرد.
          </p>
        </>
      )}
    </div>
  );
}