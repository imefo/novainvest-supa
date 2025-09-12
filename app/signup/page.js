// سرور: این فایل هیچ "use client"ی ندارد
import { Suspense } from "react";
import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SignupPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-6">ثبت‌نام</h1>
      <Suspense fallback={<div>در حال بارگذاری…</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}