// src/app/checkout/page.tsx
"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function CheckoutPage() {
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    const waitAndInit = async () => {
      // SDK 로드 대기
      for (let i = 0; i < 50; i++) {
        if ((window as any).TossPayments) break;
        await new Promise(r => setTimeout(r, 100));
      }
      const TossPayments = (window as any).TossPayments;
      if (!TossPayments) return;

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      const tossPayments = TossPayments(clientKey);

      // 회원 결제 예시(비회원은 TossPayments.ANONYMOUS 사용)
      const widgets = tossPayments.widgets({ customerKey: "oYX76rIP6BI15lXg9UGu3" });

      await widgets.setAmount({ currency: "KRW", value: 50000 });

      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);

      const coupon = document.getElementById("coupon-box") as HTMLInputElement | null;
      coupon?.addEventListener("change", async () => {
        const value = coupon.checked ? 45000 : 50000;
        await widgets.setAmount({ currency: "KRW", value });
      });

      const btn = document.getElementById("payment-request-button");
      btn?.addEventListener("click", async () => {
        await widgets.requestPayment({
          orderId: btoa(String(Math.random())).slice(0, 20),
          orderName: "토스 티셔츠 외 2건",
          // Next 페이지 경로
          successUrl: `${window.location.origin}/success`,
          failUrl: `${window.location.origin}/fail`,
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          customerMobilePhone: "01012341234",
        });
      });
    };

    waitAndInit();
  }, []);

  return (
    <>
      <Script src="https://js.tosspayments.com/v2/standard" strategy="afterInteractive" />
      <div className="wrapper w-100">
        <div className="max-w-540 w-100">
          <div>
            <input type="checkbox" id="coupon-box" />
            <label htmlFor="coupon-box"> 5,000원 쿠폰 적용 </label>
          </div>
          <div id="payment-method" className="w-100" />
          <div id="agreement" className="w-100" />
          <div className="btn-wrapper w-100">
            <button id="payment-request-button" className="btn primary w-100">결제하기</button>
          </div>
        </div>
      </div>
    </>
  );
}