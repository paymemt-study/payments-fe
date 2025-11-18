"use client";

import { useEffect } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

const AMOUNT = {
  currency: "KRW",
  value: 50_000,
};

export default function CheckoutPage() {
  useEffect(() => {
    const init = async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      const tossPayments = await loadTossPayments(clientKey);

      const widgets = tossPayments.widgets({
        customerKey: ANONYMOUS, // 비회원 결제
      });

      await widgets.setAmount(AMOUNT);

      const [paymentMethodWidget] = await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      const button = document.getElementById("payment-request-button");
      if (!button) return;

      button.addEventListener("click", async () => {
        try {
          // 선택된 결제수단 확인 (선택사항)
          const selected = await paymentMethodWidget.getSelectedPaymentMethod();
          console.log("selectedPaymentMethod", selected);

          await widgets.requestPayment({
            orderId: generateRandomOrderId(),
            orderName: "테스트 상품",
            successUrl: window.location.origin + "/payments/success",
            failUrl: window.location.origin + "/payments/fail",
            customerEmail: "customer123@gmail.com",
            customerName: "김토스",
            customerMobilePhone: "01012341234",
          });
        } catch (e) {
          console.error(e);
        }
      });
    };

    init();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 540, margin: "0 auto" }}>
      <h2>결제 테스트</h2>
      <div id="payment-method" />
      <div id="agreement" style={{ marginTop: 24 }} />
      <button
        id="payment-request-button"
        style={{ marginTop: 24, width: "100%", padding: 12 }}
      >
        결제하기
      </button>
    </div>
  );
}

function generateRandomOrderId() {
  return "ORD-" + Math.random().toString(36).substring(2, 12);
}