// src/app/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SuccessPage() {
  const sp = useSearchParams();
  const paymentKey = sp.get("paymentKey") || "";
  const orderId = sp.get("orderId") || "";
  const amount = sp.get("amount") || "";
  const [done, setDone] = useState(false);
  const [resp, setResp] = useState<any>(null);

  const confirm = async () => {
    const r = await fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    });
    const data = await r.json();
    setResp(data);
    setDone(true);
  };

  return (
    <div style={{ padding: 24, maxWidth: 540 }}>
      {!done ? (
        <div>
          <h2>결제 요청 성공 – 승인 진행</h2>
          <p>paymentKey: {paymentKey}</p>
          <p>orderId: {orderId}</p>
          <p>amount: {amount}</p>
          <button onClick={confirm} style={{ marginTop: 16 }}>결제 승인하기</button>
        </div>
      ) : (
        <div>
          <h2>결제를 완료했어요</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(resp, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}