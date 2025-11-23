// app/payments/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type State = "loading" | "success" | "fail";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  const paymentKey = searchParams.get("paymentKey") ?? undefined;
  const orderId = searchParams.get("orderId") ?? undefined;
  const amount = searchParams.get("amount") ?? undefined;
  const paymentType = searchParams.get("paymentType") ?? undefined;

  const [state, setState] = useState<State>("loading");
  const [resp, setResp] = useState<any>(null);
  const [message, setMessage] = useState("결제 승인 처리 중입니다...");

  useEffect(() => {
    // 필수 파라미터 체크
    if (!paymentKey || !orderId || !amount) {
      setState("fail");
      setMessage("필수 결제 정보가 누락되었습니다.");
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            paymentType,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          setState("fail");
          setMessage(`결제 승인 실패: ${text}`);
          return;
        }

        const data = await res.json();
        setResp(data);
        setState("success");
        setMessage("결제가 정상적으로 승인되었습니다.");
      } catch (e) {
        console.error(e);
        setState("fail");
        setMessage("서버 오류로 결제 승인에 실패했습니다.");
      }
    };

    confirm();
  }, [paymentKey, orderId, amount, paymentType]);

  return (
    <main style={{ padding: 40 }}>
      <h1>결제 결과</h1>
      <p>paymentKey: {paymentKey}</p>
      <p>orderId: {orderId}</p>
      <p>amount: {amount}</p>
      <p>paymentType: {paymentType}</p>

      <hr />

      <p>
        상태:{" "}
        {state === "loading" ? "승인 처리 중..." : state === "success" ? "성공" : "실패"}
      </p>
      <p>{message}</p>

      {resp && (
        <>
          <hr />
          <pre>{JSON.stringify(resp, null, 2)}</pre>
          <a
            href={`/orders/${orderId}`}
            style={{
              display: "inline-block",
              marginTop: "16px",
              padding: "8px 12px",
              backgroundColor: "#4f46e5",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            주문 상세 보기
          </a>
        </>
      )}
    </main>
  );
}