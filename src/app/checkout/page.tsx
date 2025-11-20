"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

type CreateOrderResponse = {
  orderId: string;
  amount: number;
};

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const createOrderAndPay = async () => {
    if (!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
      alert("Toss 클라이언트 키가 설정되어 있지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      // 1) 백엔드에서 Order 생성
      const orderRes = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 50000,
          orderName: "테스트 상품",
          userId: 1,
        }),
      });

      if (!orderRes.ok) {
        const text = await orderRes.text();
        console.error("order create failed:", text);
        alert("주문 생성에 실패했습니다.");
        return;
      }

      const order: CreateOrderResponse = await orderRes.json();
      const { orderId, amount } = order;

      // 2) TossPayments SDK 로드
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      );

      // 3) 결제창 초기화 (payment() 함수)
      const payment = tossPayments.payment({
        // 유저 식별자 (회원이면 userId 기반으로 넣어도 됨)
        customerKey: "USER-1",
      });

      // 4) 결제창 띄우기
      await payment.requestPayment({
        method: "CARD",
        amount: {
          value: amount, // 50000
          currency: "KRW",
        },
        orderId, // 백엔드에서 생성한 ORD-xxxx
        orderName: "테스트 상품",
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
      });
    } catch (e) {
      console.error(e);
      alert("결제 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>결제 테스트</h1>
      <button onClick={createOrderAndPay} disabled={loading}>
        {loading ? "요청 중..." : "50000원 결제하기"}
      </button>
    </main>
  );
}