// src/app/payments/fail/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function FailPage() {
  const sp = useSearchParams();
  const code = sp.get("code");
  const message = sp.get("message");

  return (
    <div style={{ padding: 24, maxWidth: 540, margin: "0 auto" }}>
      <h2>결제를 실패했어요</h2>
      <p>code: {code}</p>
      <p>message: {message}</p>
      <a href="/checkout" style={{ display: "inline-block", marginTop: 16 }}>
        다시 시도
      </a>
    </div>
  );
}