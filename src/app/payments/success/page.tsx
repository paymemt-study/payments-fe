// src/app/payments/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ConfirmResponse = {
  data?: any;
  error?: string;
};

export default function SuccessPage() {
  const sp = useSearchParams();
  const paymentKey = sp.get("paymentKey");
  const orderId = sp.get("orderId");
  const amount = sp.get("amount");

  const [result, setResult] = useState<ConfirmResponse | null>(null);

  useEffect(() => {
    const confirm = async () => {
      if (!paymentKey || !orderId || !amount) {
        setResult({ error: "필수 파라미터가 없습니다." });
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/payments/confirm`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentKey,
              orderId,
              amount: Number(amount),
            }),
          }
        );

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          setResult({
            error:
              errBody?.message ||
              `결제 승인 실패 (status=${res.status})`,
          });
          return;
        }

        const body = await res.json();
        setResult({ data: body });
      } catch (e: any) {
        setResult({ error: e?.message || "네트워크 에러" });
      }
    };

    confirm();
  }, [paymentKey, orderId, amount]);

  return (
    <div style={{ padding: 24, maxWidth: 540, margin: "0 auto" }}>
      <h2>결제를 완료했어요</h2>
      <p>paymentKey: {paymentKey}</p>
      <p>orderId: {orderId}</p>
      <p>amount: {amount}</p>

      {result === null && <p>서버에 결제 승인 요청 중...</p>}

      {result?.error && (
        <div style={{ marginTop: 16, color: "red" }}>
          <strong>결제 승인 실패:</strong> {result.error}
        </div>
      )}

      {result?.data && (
        <div style={{ marginTop: 16 }}>
          <strong>서버 승인 응답:</strong>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      <a href="/checkout" style={{ display: "inline-block", marginTop: 24 }}>
        다시 결제하기
      </a>
    </div>
  );
}