"use client";

import { useState } from "react";
import type { OrderDetail } from "@/types/order";

type Props = {
  order: OrderDetail;
};

export function OrderDetailClient({ order }: Props) {
  const [loading, setLoading] = useState(false);
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("단순 변심");

  const isOrderPaid = order.status === "PAID";
  const isPaymentCancelable =
    order.payment &&
    (order.payment.status === "PAID" ||
      order.payment.status === "PARTIAL_REFUND");

  const canCancel = isOrderPaid && !!isPaymentCancelable && !!order.payment;

  if (!canCancel) {
    return (
      <div style={{ marginTop: 16, color: "#666" }}>
        취소/환불은 결제 상태가 PAID 또는 PARTIAL_REFUND인 경우에만
        가능합니다.
      </div>
    );
  }

  const payment = order.payment!;
  const fullAmount = payment.amountKrw;
  const refundedAmount = payment.refundedAmountKrw ?? 0;
  const remainingAmount = fullAmount - refundedAmount;

  const callCancelApi = async (cancelAmount: number, cancelReason: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/payments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId, // ✅ 백엔드 PaymentCancelRequest와 맞춤
          amount: cancelAmount,
          reason: cancelReason,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("cancel failed:", res.status, text);
        alert("취소/환불 요청에 실패했습니다.");
        return;
      }

      const data = await res.json().catch(() => null);
      console.log("cancel success:", data);

      alert("취소/환불이 완료되었습니다.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("취소/환불 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFullCancel = async () => {
    if (remainingAmount <= 0) {
      alert("더 이상 환불 가능한 금액이 없습니다.");
      return;
    }
    if (
      !window.confirm(
        `정말 남은 금액 전체(₩${remainingAmount.toLocaleString()}원)를 취소하시겠습니까?`
      )
    ) {
      return;
    }
    await callCancelApi(remainingAmount, reason || "단순 변심");
  };

  const handlePartialRefund = async () => {
    const amount = Number(partialAmount);
    if (!amount || amount <= 0) {
      alert("부분 환불 금액을 올바르게 입력하세요.");
      return;
    }
    if (amount > remainingAmount) {
      alert(
        `부분 환불 금액은 남은 환불 가능 금액(₩${remainingAmount.toLocaleString()}원)보다 클 수 없습니다.`
      );
      return;
    }
    if (
      !window.confirm(`₩${amount.toLocaleString()}원을 부분 환불하시겠습니까?`)
    ) {
      return;
    }
    await callCancelApi(amount, reason || "부분 환불");
  };

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h3>결제 취소 / 환불</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        • 결제 총액: {fullAmount.toLocaleString()}원
        <br />
        • 누적 환불 금액: {refundedAmount.toLocaleString()}원
        <br />
        • 남은 환불 가능 금액: {remainingAmount.toLocaleString()}원
      </p>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          취소/환불 사유
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          placeholder="취소/환불 사유를 입력하세요"
        />
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        {/* 남은 금액 전체 취소 */}
        <button
          onClick={handleFullCancel}
          disabled={loading || remainingAmount <= 0}
          style={{
            padding: "8px 16px",
            cursor:
              loading || remainingAmount <= 0 ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "처리 중..." : "남은 금액 전체 취소"}
        </button>

        {/* 부분 환불 영역 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number"
            min={1}
            max={remainingAmount}
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value)}
            placeholder="부분 환불 금액"
            style={{ width: 130, padding: 6 }}
          />
          <button
            onClick={handlePartialRefund}
            disabled={loading}
            style={{
              padding: "8px 16px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "처리 중..." : "부분 환불"}
          </button>
        </div>
      </div>
    </div>
  );
}
