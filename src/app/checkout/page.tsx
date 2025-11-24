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
      alert("Toss 클라이언트 키가 없습니다.");
      return;
    }

    setLoading(true);

    try {
      // 1) 주문 생성
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
        alert("주문 생성 실패");
        return;
      }

      const order: CreateOrderResponse = await orderRes.json();
      const { orderId, amount } = order;

      // 2) Toss SDK 로드
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      );

      const payment = tossPayments.payment({
        customerKey: "USER-1",
      });

      // 3) 결제 요청
      await payment
        .requestPayment({
          method: "CARD",
          amount: { value: amount, currency: "KRW" },
          orderId,
          orderName: "테스트 상품",
          successUrl: `${window.location.origin}/payments/success`,
          failUrl: `${window.location.origin}/payments/fail`,
        })
        .catch(async (err) => {
          if (err.code === "USER_CANCEL") {
            // 🔥 결제창 닫힘 → 자동 실패 처리 API 호출
            await fetch("http://localhost:8080/api/payments/fail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });

            alert("결제가 취소되었습니다.");
            return;
          }

          throw err;
        });
    } catch (e) {
      console.error(e);
      alert("결제 중 오류가 발생했습니다.");
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