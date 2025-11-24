// src/app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  CreateOrderItem,
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/types/order";

declare global {
  interface Window {
    TossPayments: (clientKey: string) => any;
  }
}

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

// 백엔드 Product 응답 타입 (단순 버전)
type ProductSummary = {
  id: number;
  name: string;
  listPriceKrw: number;
};

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [selectedItems, setSelectedItems] = useState<CreateOrderItem[]>([]);

  // 1) 마운트 시 상품 목록 조회
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8080/api/products");
        if (!res.ok) {
          console.error("fetch products failed:", res.status);
          return;
        }
        const data: ProductSummary[] = await res.json();
        setProducts(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // 특정 productId의 수량 변경 (+1, -1 등)
  const changeQuantity = (productId: number, delta: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (!existing) {
        // 기존에 없는데 delta>0 이면 새로 추가
        if (delta <= 0) return prev;
        return [...prev, { productId, quantity: delta }];
      }

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        // 0 이하가 되면 목록에서 제거
        return prev.filter((i) => i.productId !== productId);
      }

      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity: newQty } : i
      );
    });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);

      if (selectedItems.length === 0) {
        alert("주문할 상품을 선택해주세요.");
        return;
      }

      const body: CreateOrderRequest = {
        userId: 1,
        items: selectedItems,
      };

      const orderRes = await fetch(
        "http://localhost:8080/api/order-commands",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!orderRes.ok) {
        const text = await orderRes.text();
        console.error("createOrder failed:", orderRes.status, text);
        alert("주문 생성에 실패했습니다.");
        return;
      }

      const order: CreateOrderResponse = await orderRes.json();

      if (!window.TossPayments) {
        alert("TossPayments SDK 로드가 안됐습니다.");
        return;
      }

      const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);
      const origin = window.location.origin;

      await tossPayments.requestPayment("카드", {
        amount: order.totalAmountKrw,
        orderId: order.orderId,
        orderName: "테스트 주문", // TODO: 선택된 상품명들 join해서 넣어도 됨
        successUrl: `${origin}/payments/success`,
        failUrl: `${origin}/payments/fail`,
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
      <h1>결제 데모 (Product + OrderLine 기반 주문)</h1>

      <section>
        <h2>상품 선택</h2>
        <ul>
          {products.map((p) => {
            const selected = selectedItems.find(
              (i) => i.productId === p.id
            );
            const qty = selected?.quantity ?? 0;

            return (
              <li key={p.id} style={{ marginBottom: 8 }}>
                {p.name} - ₩{p.listPriceKrw.toLocaleString()}
                <span style={{ marginLeft: 12 }}>
                  수량: <strong>{qty}</strong>
                </span>
                <button
                  style={{ marginLeft: 8 }}
                  onClick={() => changeQuantity(p.id, +1)}
                >
                  +
                </button>
                <button
                  style={{ marginLeft: 4 }}
                  onClick={() => changeQuantity(p.id, -1)}
                  disabled={qty === 0}
                >
                  -
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>현재 선택된 주문 항목</h2>
        {selectedItems.length === 0 ? (
          <p>선택된 상품이 없습니다.</p>
        ) : (
          <ul>
            {selectedItems.map((item, idx) => (
              <li key={idx}>
                productId: {item.productId} / 수량: {item.quantity}
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={handleCheckout}
        disabled={loading || selectedItems.length === 0}
      >
        {loading ? "처리중..." : "결제하기"}
      </button>
    </main>
  );
}