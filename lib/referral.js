// lib/referral.js
"use client";

export const REF_COOKIE = "nv_ref";

export function setRefCookie(code, days = 30) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days*24*60*60*1000);
    document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  } catch {}
}

export function getRefCookie() {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${REF_COOKIE}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch { return null; }
}

export function clearRefCookie() {
  try {
    document.cookie = `${REF_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
  } catch {}
}

// ساخت QR-data URL ساده (بدون وابستگی)
// اگر خواستی بعداً کتابخانه اضافه کن.
export function makeQrApiUrl(text, size=180) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  return url;
}