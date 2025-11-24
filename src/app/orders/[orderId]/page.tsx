import Link from "next/link";
import { OrderDetail } from "@/types/order";
import { OrderDetailClient } from "./OrderDetailClient";

async function fetchOrderDetail(orderId: string): Promise<OrderDetail> {
  const res = await fetch(
    `http://localhost:8080/api/orders/${orderId}?userId=1`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("order detail error:", res.status, text);
    throw new Error("주문 상세 조회 실패");
  }

  return res.json();
}

type PageProps = {
  params: { orderId: string };
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await fetchOrderDetail(orderId);

  return (
    <main style={{ padding: 40 }}>
      <h1>주문 상세</h1>

      <section style={{ marginTop: 20 }}>
        <h2>주문 정보</h2>
        <p>주문번호: {order.orderId}</p>
        <p>금액: {order.amount.toLocaleString()}원</p>
        <p>통화: {order.currency}</p>
        <p>상태: {order.status}</p>
        <p>생성일시: {new Date(order.createdAt).toLocaleString("ko-KR")}</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>결제 정보</h2>
        {order.payment ? (
          <>
            <p>결제키: {order.payment.paymentKey}</p>
            <p>결제수단: {order.payment.provider}</p>
            <p>결제상태: {order.payment.status}</p>
            <p>
              승인일시:{" "}
              {order.payment.approvedAt
                ? new Date(order.payment.approvedAt).toLocaleString("ko-KR")
                : "-"}
            </p>
          </>
        ) : (
          <p>아직 결제 정보가 없습니다. (PENDING 상태)</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <OrderDetailClient order={order} />
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/orders">← 내 주문 목록으로</Link>
      </div>
    </main>
  );
}